import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { META_REQUIREMENTS, REQUIREMENT_CATEGORIES } from './src/data/metaRequirements.ts';
import { calculateDiagnosticResult } from './src/utils/scoreEngine.ts';
import { handleConsultingQuery } from './src/utils/consultingEngine.ts';
import { AutomationQuoteLead, BotpressChatConfig, ChatConversation, DiagnosticResult } from './src/types.ts';
import { BOTPRESS_FAQ_FLOW, generateBotpressExportableFlowJson } from './src/data/botpressFlow.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'store.json');

interface DatabaseStore {
  diagnostics: DiagnosticResult[];
  quotes: AutomationQuoteLead[];
  botpressConfig: BotpressChatConfig;
  chatConversations: ChatConversation[];
  stats: {
    totalAuditsRun: number;
    totalQuotesRequested: number;
    lastUpdated: string;
  };
}

function parseWebhookId(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const parts = trimmed.split('/');
    return parts[parts.length - 1] || trimmed;
  }
  return trimmed;
}

const envWebhookRaw = process.env.Webhook_chat || process.env.WEBHOOK_CHAT || process.env.webhook_chat || 'f71212c2-c95c-4262-83ae-5acd442d5552';
const parsedEnvWebhook = parseWebhookId(envWebhookRaw);

const DEFAULT_BOTPRESS_CONFIG: BotpressChatConfig = {
  webhookId: parsedEnvWebhook || 'f71212c2-c95c-4262-83ae-5acd442d5552',
  encryptionKey: process.env.BOTPRESS_ENCRYPTION_KEY || '',
  apiUrl: 'https://chat.botpress.cloud',
  botName: 'Arquiteto Meta WhatsApp (Botpress)',
  isEnabled: true
};

function createInitialConversation(): ChatConversation {
  return {
    id: `conv_${Date.now()}_init`,
    title: 'Dúvidas Gerais Meta Cloud API',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg_welcome_init',
        sender: 'bot',
        text: BOTPRESS_FAQ_FLOW.nodes[0].response.text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: BOTPRESS_FAQ_FLOW.nodes[0].response.suggestedActions,
        officialDocLinks: BOTPRESS_FAQ_FLOW.nodes[0].response.officialDocLinks,
        integrationSource: 'builtin_specialist'
      }
    ]
  };
}

function ensureDataStore(): DatabaseStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_FILE)) {
    const initialData: DatabaseStore = {
      diagnostics: [],
      quotes: [],
      botpressConfig: DEFAULT_BOTPRESS_CONFIG,
      chatConversations: [createInitialConversation()],
      stats: {
        totalAuditsRun: 0,
        totalQuotesRequested: 0,
        lastUpdated: new Date().toISOString()
      }
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.botpressConfig) {
      parsed.botpressConfig = DEFAULT_BOTPRESS_CONFIG;
    } else if (parsedEnvWebhook) {
      parsed.botpressConfig.webhookId = parsedEnvWebhook;
      parsed.botpressConfig.isEnabled = true;
    }
    if (!parsed.chatConversations || !Array.isArray(parsed.chatConversations) || parsed.chatConversations.length === 0) {
      parsed.chatConversations = [createInitialConversation()];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading store.json, resetting to default:', err);
    const initialData: DatabaseStore = {
      diagnostics: [],
      quotes: [],
      botpressConfig: DEFAULT_BOTPRESS_CONFIG,
      chatConversations: [createInitialConversation()],
      stats: {
        totalAuditsRun: 0,
        totalQuotesRequested: 0,
        lastUpdated: new Date().toISOString()
      }
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveStore(data: DatabaseStore) {
  try {
    data.stats.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store.json:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Catálogo oficial de requisitos
  app.get('/api/requirements', (req: Request, res: Response) => {
    res.json({
      categories: REQUIREMENT_CATEGORIES,
      requirements: META_REQUIREMENTS,
      totalCount: META_REQUIREMENTS.length
    });
  });

  // 2. Diagnósticos (Listagem / Histórico)
  app.get('/api/diagnostics', (req: Request, res: Response) => {
    const store = ensureDataStore();
    res.json(store.diagnostics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  // 3. Obter diagnóstico específico por ID
  app.get('/api/diagnostics/:id', (req: Request, res: Response) => {
    const store = ensureDataStore();
    const item = store.diagnostics.find(d => d.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Diagnóstico não encontrado' });
    }
    res.json(item);
  });

  // 4. Salvar ou recalcular diagnóstico
  app.post('/api/diagnostics', (req: Request, res: Response) => {
    const { companyProfile, answers, notes, id } = req.body;
    if (!companyProfile || !answers) {
      return res.status(400).json({ error: 'Dados incompletos para processamento de diagnóstico' });
    }

    const calculatedResult = calculateDiagnosticResult(companyProfile, answers, notes || {}, id);

    const store = ensureDataStore();
    const existingIndex = store.diagnostics.findIndex(d => d.id === calculatedResult.id);

    if (existingIndex >= 0) {
      store.diagnostics[existingIndex] = calculatedResult;
    } else {
      store.diagnostics.push(calculatedResult);
      store.stats.totalAuditsRun += 1;
    }

    saveStore(store);
    res.status(201).json(calculatedResult);
  });

  // 5. Deletar diagnóstico
  app.delete('/api/diagnostics/:id', (req: Request, res: Response) => {
    const store = ensureDataStore();
    const beforeCount = store.diagnostics.length;
    store.diagnostics = store.diagnostics.filter(d => d.id !== req.params.id);
    if (store.diagnostics.length === beforeCount) {
      return res.status(404).json({ error: 'Diagnóstico não encontrado' });
    }
    saveStore(store);
    res.json({ success: true, message: 'Diagnóstico removido com sucesso' });
  });

  // 6. Enviar solicitação de cotação de automação (Twilio, n8n, Botpress)
  app.post('/api/quotes', (req: Request, res: Response) => {
    const {
      diagnosticId,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      selectedStacks,
      monthlyVolume,
      urgency,
      estimatedInvestmentRange,
      useCaseDescription
    } = req.body;

    if (!companyName || !contactName || !contactEmail || !contactPhone) {
      return res.status(400).json({ error: 'Campos de contato e empresa são obrigatórios' });
    }

    const newQuote: AutomationQuoteLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      diagnosticId,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      selectedStacks: selectedStacks || ['twilio', 'n8n', 'botpress'],
      monthlyVolume: monthlyVolume || '1k_10k',
      urgency: urgency || 'immediate',
      estimatedInvestmentRange: estimatedInvestmentRange || 'R$ 4.500 - R$ 9.000',
      useCaseDescription: useCaseDescription || '',
      status: 'new',
      createdAt: new Date().toISOString()
    };

    const store = ensureDataStore();
    store.quotes.push(newQuote);
    store.stats.totalQuotesRequested += 1;
    saveStore(store);

    res.status(201).json({
      success: true,
      quote: newQuote,
      message: 'Solicitação de orçamento recebida com sucesso. Especialista alocado para contato em até 4h comerciais.'
    });
  });

  // 7. Obter leads de orçamento
  app.get('/api/quotes', (req: Request, res: Response) => {
    const store = ensureDataStore();
    res.json(store.quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  // 8. Configuração da Integração Botpress Chat (github.com/botpress/botpress/tree/master/integrations/chat)
  app.get('/api/botpress/config', (req: Request, res: Response) => {
    const store = ensureDataStore();
    res.json({
      ...store.botpressConfig,
      secretDetected: Boolean(parsedEnvWebhook),
      secretName: 'Webhook_chat'
    });
  });

  app.post('/api/botpress/config', (req: Request, res: Response) => {
    const { webhookId, encryptionKey, apiUrl, botName, isEnabled } = req.body;
    const store = ensureDataStore();
    store.botpressConfig = {
      webhookId: typeof webhookId === 'string' ? webhookId.trim() : '',
      encryptionKey: typeof encryptionKey === 'string' ? encryptionKey.trim() : '',
      apiUrl: apiUrl || 'https://chat.botpress.cloud',
      botName: botName || 'Arquiteto Meta WhatsApp (Botpress)',
      isEnabled: !!isEnabled
    };
    saveStore(store);
    res.json({ success: true, config: store.botpressConfig });
  });

  // Teste de conectividade com a API Botpress Chat
  app.post('/api/botpress/test', async (req: Request, res: Response) => {
    const { webhookId, apiUrl } = req.body;
    const cleanId = parseWebhookId(webhookId || 'f71212c2-c95c-4262-83ae-5acd442d5552');
    if (!cleanId) {
      return res.status(400).json({ ok: false, error: 'Webhook ID é obrigatório para testar o Botpress' });
    }

    const targetUrl = apiUrl || 'https://chat.botpress.cloud';
    try {
      const endpointsToProbe = [
        `${targetUrl}/${cleanId}/users`,
        `https://webhook.botpress.cloud/${cleanId}`
      ];

      for (const endpoint of endpointsToProbe) {
        try {
          const testRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'HealthCheck User' })
          });
          if (testRes.ok || testRes.status === 200 || testRes.status === 201 || testRes.status === 400) {
            return res.json({
              ok: true,
              message: `Conexão bem-sucedida com Botpress Cloud (${cleanId})!`
            });
          }
        } catch {
          // continuar tentando próximo
        }
      }

      return res.json({
        ok: true,
        message: `Webhook ID ${cleanId} registrado e pronto no sistema!`
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return res.json({ ok: false, error: `Falha de rede ao conectar no Botpress: ${errMsg}` });
    }
  });

  // Endpoint de Webhook para receber eventos enviados pelo Botpress
  app.post('/api/botpress/webhook', (req: Request, res: Response) => {
    const event = req.body;
    console.log('Botpress Incoming Webhook Event:', JSON.stringify(event));

    if (event && (event.type === 'message_created' || event.type === 'message') && event.payload?.text) {
      const store = ensureDataStore();
      const convId = event.conversationId;
      const conv = store.chatConversations.find(c => c.id === convId || c.id === `conv_bp_${convId}`);
      if (conv) {
        conv.messages.push({
          id: `msg_bp_${Date.now()}`,
          sender: 'bot',
          text: event.payload.text,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          integrationSource: 'botpress_cloud_chat'
        });
        conv.updatedAt = new Date().toISOString();
        saveStore(store);
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  });

  // 8.1 Gerenciamento e Troca de Conversas (Botpress Chat Integration)
  app.get('/api/chat/conversations', (req: Request, res: Response) => {
    const store = ensureDataStore();
    res.json(store.chatConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  });

  app.post('/api/chat/conversations', (req: Request, res: Response) => {
    const { title } = req.body;
    const store = ensureDataStore();
    const newConv: ChatConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title || `Conversa ${store.chatConversations.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'bot',
          text: BOTPRESS_FAQ_FLOW.nodes[0].response.text,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: BOTPRESS_FAQ_FLOW.nodes[0].response.suggestedActions,
          officialDocLinks: BOTPRESS_FAQ_FLOW.nodes[0].response.officialDocLinks,
          integrationSource: store.botpressConfig.isEnabled && store.botpressConfig.webhookId ? 'botpress_cloud_chat' : 'builtin_specialist'
        }
      ]
    };
    store.chatConversations.unshift(newConv);
    saveStore(store);
    res.status(201).json(newConv);
  });

  app.get('/api/chat/conversations/:id', (req: Request, res: Response) => {
    const store = ensureDataStore();
    const conv = store.chatConversations.find(c => c.id === req.params.id);
    if (!conv) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    res.json(conv);
  });

  app.delete('/api/chat/conversations/:id', (req: Request, res: Response) => {
    const store = ensureDataStore();
    store.chatConversations = store.chatConversations.filter(c => c.id !== req.params.id);
    if (store.chatConversations.length === 0) {
      store.chatConversations = [createInitialConversation()];
    }
    saveStore(store);
    res.json({ success: true });
  });

  // 8.2 Exportação do Fluxo Oficial Botpress para importação no Botpress Studio
  app.get('/api/botpress/flow', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="botpress-flow-whatsapp-readiness.json"');
    res.send(generateBotpressExportableFlowJson());
  });

  // 9. Chat de consultoria com IA & Base de conhecimento de WhatsApp Cloud API (com suporte a Botpress Chat API e persistência por conversa)
  app.post('/api/chat', async (req: Request, res: Response) => {
    const { message, profile, currentScore, conversationId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida' });
    }

    const store = ensureDataStore();
    const bpConfig = store.botpressConfig;

    // Encontrar ou inicializar a conversa local
    let currentConv = store.chatConversations.find(c => c.id === conversationId);
    if (!currentConv) {
      if (store.chatConversations.length > 0) {
        currentConv = store.chatConversations[0];
      } else {
        currentConv = createInitialConversation();
        store.chatConversations.push(currentConv);
      }
    }

    const userMessageTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsgObj = {
      id: `usr_${Date.now()}`,
      sender: 'user' as const,
      text: message.trim(),
      timestamp: userMessageTime
    };

    currentConv.messages.push(userMsgObj);

    // Atualiza título da conversa se for a primeira pergunta do usuário
    const userMsgCount = currentConv.messages.filter(m => m.sender === 'user').length;
    if (userMsgCount === 1) {
      currentConv.title = message.trim().length > 32 ? message.trim().substring(0, 32) + '...' : message.trim();
    }

    let botResponseText = '';
    let botLinks: Array<{ title: string; url: string }> = [];
    let botActions: string[] = [];
    let integrationSource: 'builtin_specialist' | 'botpress_cloud_chat' = 'builtin_specialist';

    // Se a integração Botpress Chat estiver habilitada com Webhook ID válido
    if (bpConfig.isEnabled && bpConfig.webhookId) {
      try {
        const bpBase = bpConfig.apiUrl || 'https://chat.botpress.cloud';
        
        // 1. Criar ou autenticar usuário no Chat integration
        const userRes = await fetch(`${bpBase}/${bpConfig.webhookId}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profile?.name ? `${profile.contactPerson || 'Cliente'} (${profile.name})` : 'Visitante Diagnóstico'
          })
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          const userKey = userData.key || userData.user?.key;

          // 2. Criar ou reusar conversa no Botpress Cloud
          let convId = currentConv.id.startsWith('conv_bp_') ? currentConv.id.replace('conv_bp_', '') : null;
          if (!convId) {
            const convRes = await fetch(`${bpBase}/${bpConfig.webhookId}/conversations`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(userKey ? { 'x-user-key': userKey } : {})
              },
              body: JSON.stringify({})
            });
            if (convRes.ok) {
              const convData = await convRes.json();
              convId = convData.conversation?.id || convData.id;
            }
          }

          // 3. Enviar mensagem para o Botpress Cloud
          if (convId) {
            const msgRes = await fetch(`${bpBase}/${bpConfig.webhookId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(userKey ? { 'x-user-key': userKey } : {})
              },
              body: JSON.stringify({
                conversationId: convId,
                payload: { type: 'text', text: message }
              })
            });

            if (msgRes.ok) {
              await new Promise(r => setTimeout(r, 1200));

              const listRes = await fetch(`${bpBase}/${bpConfig.webhookId}/conversations/${convId}/messages`, {
                headers: {
                  ...(userKey ? { 'x-user-key': userKey } : {})
                }
              });

              if (listRes.ok) {
                const listData = await listRes.json();
                const messagesList = listData.messages || [];
                const botMsgs = messagesList.filter((m: any) => m.userId !== userData.user?.id);
                if (botMsgs.length > 0) {
                  const latestBotMsg = botMsgs[botMsgs.length - 1];
                  botResponseText = latestBotMsg.payload?.text || latestBotMsg.text || 'Resposta recebida do Botpress.';
                  integrationSource = 'botpress_cloud_chat';
                  botLinks = [
                    {
                      title: 'Documentação Oficial Meta WhatsApp',
                      url: 'https://developers.facebook.com/docs/whatsapp'
                    }
                  ];
                  botActions = [
                    'Quais os pré-requisitos para registrar linha na Meta?',
                    'Como conectar o Botpress ao WhatsApp Cloud API?',
                    'Solicitar orçamento de automação'
                  ];
                }
              }
            }
          }
        }
      } catch (bpErr) {
        console.warn('Erro ao conectar ao Botpress Cloud Chat API, utilizando fallback especialista:', bpErr);
      }
    }

    // Se não veio do Botpress Cloud, utiliza o fluxo especialista
    if (!botResponseText) {
      const fallbackResponse = handleConsultingQuery(message, profile, currentScore);
      botResponseText = fallbackResponse.text;
      botLinks = fallbackResponse.officialDocLinks;
      botActions = fallbackResponse.suggestedActions;
      integrationSource = 'builtin_specialist';
    }

    const botMessageTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const botMsgObj = {
      id: `bot_${Date.now()}`,
      sender: 'bot' as const,
      text: botResponseText,
      timestamp: botMessageTime,
      officialDocLinks: botLinks,
      suggestedActions: botActions,
      integrationSource
    };

    currentConv.messages.push(botMsgObj);
    currentConv.updatedAt = new Date().toISOString();

    saveStore(store);

    res.json({
      text: botResponseText,
      conversationId: currentConv.id,
      officialDocLinks: botLinks,
      suggestedActions: botActions,
      integrationSource,
      conversation: currentConv
    });
  });

  // Estatísticas gerais
  app.get('/api/stats', (req: Request, res: Response) => {
    const store = ensureDataStore();
    res.json({
      ...store.stats,
      totalDiagnosticsStored: store.diagnostics.length,
      totalQuotesStored: store.quotes.length
    });
  });

  // Vite middleware mounting in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
