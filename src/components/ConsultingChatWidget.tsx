import React, { useState, useRef, useEffect } from 'react';
import { BotpressChatConfig, ChatConversation, ChatMessage, CompanyProfile } from '../types';
import {
  createChatConversation,
  deleteChatConversation,
  getBotpressConfig,
  getChatConversations,
  saveBotpressConfig,
  sendConsultingChat,
  testBotpressConnection
} from '../services/api';
import { BOTPRESS_FAQ_FLOW, generateBotpressExportableFlowJson } from '../data/botpressFlow';
import {
  Send,
  Bot,
  User,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Plus,
  MessageSquare,
  Trash2,
  Download,
  Share2,
  Workflow,
  Sliders,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GitBranch,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ConsultingChatWidgetProps {
  profile?: CompanyProfile | null;
  currentScore?: number | null;
  onNavigateToQuote: () => void;
  onNavigateToWizard: () => void;
}

export const ConsultingChatWidget: React.FC<ConsultingChatWidgetProps> = ({
  profile,
  currentScore,
  onNavigateToQuote,
  onNavigateToWizard
}) => {
  // Conversas & Troca de Conversa
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);

  // Input & Envio
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modais e Painéis
  const [showConfig, setShowConfig] = useState(false);
  const [showFlowViewer, setShowFlowViewer] = useState(false);
  const [selectedFlowNodeId, setSelectedFlowNodeId] = useState<string>(BOTPRESS_FAQ_FLOW.startNode);

  // Configuração Botpress Chat
  const [bpConfig, setBpConfig] = useState<BotpressChatConfig>({
    webhookId: '',
    encryptionKey: '',
    apiUrl: 'https://chat.botpress.cloud',
    botName: 'Arquiteto Meta WhatsApp (Botpress)',
    isEnabled: false
  });
  const [testResult, setTestResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isLoading]);

  // Carrega histórico de conversas do backend e configuração Botpress
  useEffect(() => {
    async function init() {
      setLoadingConversations(true);
      try {
        const [convList, cfg] = await Promise.all([
          getChatConversations(),
          getBotpressConfig()
        ]);

        if (cfg) setBpConfig(cfg);

        setConversations(convList);
        if (convList.length > 0) {
          setActiveConversationId(convList[0].id);
          setActiveConversation(convList[0]);
        }
      } catch (err) {
        console.error('Falha ao inicializar conversas:', err);
      } finally {
        setLoadingConversations(false);
      }
    }

    init();
  }, []);

  // Troca de Conversa
  const handleSelectConversation = (conv: ChatConversation) => {
    setActiveConversationId(conv.id);
    setActiveConversation(conv);
  };

  // Criação de Nova Conversa (Troca de conversa conforme documentação)
  const handleNewConversation = async () => {
    try {
      const newConv = await createChatConversation(`Conversa ${conversations.length + 1}`);
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
      setActiveConversation(newConv);
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
    }
  };

  // Exclusão de conversa
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir esta conversa do histórico?')) return;
    try {
      await deleteChatConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
          setActiveConversation(remaining[0]);
        } else {
          handleNewConversation();
        }
      }
    } catch (err) {
      console.error('Erro ao excluir conversa:', err);
    }
  };

  // Salvar Configuração do Botpress
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setTestResult(null);
    try {
      const res = await saveBotpressConfig(bpConfig);
      setBpConfig(res.config);
      setTestResult({ ok: true, message: 'Configurações salvas com sucesso!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ ok: false, error: msg });
    } finally {
      setSavingConfig(false);
    }
  };

  // Testar Conexão com a Chat API do Botpress
  const handleTestConnection = async () => {
    if (!bpConfig.webhookId.trim()) {
      setTestResult({ ok: false, error: 'Informe o Webhook ID do Botpress antes de testar.' });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testBotpressConnection(bpConfig.webhookId, bpConfig.apiUrl);
      setTestResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ ok: false, error: msg });
    } finally {
      setTestingConnection(false);
    }
  };

  // Enviar Mensagem (atualizando conversa ativa)
  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await sendConsultingChat({
        message: text.trim(),
        profile,
        currentScore,
        conversationId: activeConversationId
      });

      if (res.conversation) {
        setActiveConversation(res.conversation);
        setConversations((prev) =>
          prev.map((c) => (c.id === res.conversation!.id ? res.conversation! : c))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Download do arquivo de fluxo JSON para importar no Botpress Studio
  const handleDownloadFlowJson = () => {
    const jsonString = generateBotpressExportableFlowJson();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'botpress-flow-whatsapp-cloud-api.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const selectedNode = BOTPRESS_FAQ_FLOW.nodes.find((n) => n.id === selectedFlowNodeId) || BOTPRESS_FAQ_FLOW.nodes[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>Consultoria Técnica & Botpress Chat Integration</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 font-mono">
              {bpConfig.isEnabled && bpConfig.webhookId ? 'Botpress Cloud Conectado' : 'Especialista Meta Integrado'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Assistente de Dúvidas Meta WhatsApp & Gestor de Conversas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Fluxo oficial Botpress para tirar dúvidas, com suporte à troca de conversas, exportação de fluxo para o Botpress Studio e integração via Chat API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFlowViewer(!showFlowViewer)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showFlowViewer
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Ver Fluxo do Botpress</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showConfig
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configuração API</span>
          </button>

          <button
            onClick={onNavigateToQuote}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contratar Automação</span>
          </button>
        </div>
      </div>

      {/* Painel do Visualizador de Fluxo Botpress */}
      {showFlowViewer && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-700">
                  Arquitetura de Fluxo do Botpress
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Versão {BOTPRESS_FAQ_FLOW.version}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Fluxograma de Nós & Transições de Dúvidas
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadFlowJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Baixar JSON para importar no Botpress Cloud Studio"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Fluxo JSON (Botpress Studio)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lista de Nós do Fluxo */}
            <div className="lg:col-span-4 space-y-2 max-h-[380px] overflow-y-auto pr-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Nós do Fluxo ({BOTPRESS_FAQ_FLOW.nodes.length})
              </span>
              {BOTPRESS_FAQ_FLOW.nodes.map((node, index) => {
                const isSelected = selectedFlowNodeId === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedFlowNodeId(node.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-slate-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-mono text-[10px] text-slate-600 shrink-0">
                        0{index + 1}
                      </span>
                      <span className="truncate">{node.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  </button>
                );
              })}
            </div>

            {/* Inspeção do Nó Selecionado */}
            <div className="lg:col-span-8 bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-emerald-700 uppercase font-bold tracking-wider">
                    Tópico: {selectedNode.topic}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedNode.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedNode.description}
                  </p>
                </div>

                <button
                  onClick={() => handleSend(selectedNode.prompt)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors cursor-pointer shrink-0"
                  title="Executar este nó no chat agora"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Testar Nó no Chat</span>
                </button>
              </div>

              {/* Mensagem do Robô */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  Payload de Resposta (Botpress Say Action):
                </span>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-[140px] overflow-y-auto">
                  {selectedNode.response.text}
                </p>
              </div>

              {/* Ações Sugeridas & Transições */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Botões Interativos (Quick Replies):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.response.suggestedActions.map((act, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {act}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Transições & Próximos Nós:
                  </span>
                  <div className="space-y-1">
                    {selectedNode.transitions.map((trans, i) => (
                      <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                        <GitBranch className="w-3 h-3 text-emerald-600" />
                        <span>Se &quot;{trans.trigger}&quot; &rarr; <strong>{trans.label}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Painel de Configuração da Integração Botpress Chat (github.com/botpress/botpress/tree/master/integrations/chat) */}
      {showConfig && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-700">
                  Botpress Chat Integration Config
                </span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  integrations/chat
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conecte seu próprio bot criado no Botpress Studio via{' '}
                <a
                  href="https://github.com/botpress/botpress/tree/master/integrations%2Fchat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>integrations/chat (GitHub)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>{' '}
                ou utilize o agente especialista integrado pré-treinado com os requisitos oficiais da Meta.
              </p>
            </div>
          </div>

          {/* Detecção Automática do Secret Webhook_chat */}
          {bpConfig.secretDetected && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Secret <strong>Webhook_chat</strong> detectado nas variáveis de ambiente! O Webhook ID foi vinculado automaticamente.
                </span>
              </div>
              <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                Secret Ativo
              </span>
            </div>
          )}

          {/* Guia de Onde Obter as Informações no Botpress Studio */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs text-slate-700">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Onde encontrar as informações no seu Botpress Studio:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>Acesse seu bot no <strong>Botpress Studio</strong> (app.botpress.cloud).</li>
              <li>No menu lateral esquerdo, clique no ícone de <strong>Integrations (Hub)</strong> e abra a integração <strong>Chat</strong> (conforme <code className="bg-slate-200 px-1 rounded">integrations/chat</code>).</li>
              <li>Copie o <strong>Webhook URL</strong> gerado pelo Botpress. O sistema aceita tanto a URL completa (<code className="bg-slate-200 px-1 rounded">https://chat.botpress.cloud/ID_DO_WEBHOOK</code>) quanto apenas o identificador final (<code className="bg-slate-200 px-1 rounded">UUID</code>).</li>
              <li>Se você ativou <strong>Encryption Key</strong> nas configurações do Chat no Botpress, preencha o campo correspondente abaixo para assinatura do cabeçalho <code className="bg-slate-200 px-1 rounded">x-user-key</code>.</li>
            </ol>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                testResult.ok
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{testResult.message || testResult.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Webhook ID do Botpress (ou URL Completa)
              </label>
              <input
                type="text"
                value={bpConfig.webhookId}
                onChange={(e) => setBpConfig({ ...bpConfig, webhookId: e.target.value })}
                placeholder="Ex: 53c89c83-0bd2-4916-a185-115f57731d1f ou https://chat.botpress.cloud/..."
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Valor configurado no Secret <code className="text-slate-600">Webhook_chat</code> ou inserido manualmente.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                API Base URL (Padrão Botpress Cloud)
              </label>
              <input
                type="text"
                value={bpConfig.apiUrl}
                onChange={(e) => setBpConfig({ ...bpConfig, apiUrl: e.target.value })}
                placeholder="https://chat.botpress.cloud"
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Encryption Key (Opcional - Assinatura x-user-key)
              </label>
              <input
                type="password"
                value={bpConfig.encryptionKey || ''}
                onChange={(e) => setBpConfig({ ...bpConfig, encryptionKey: e.target.value })}
                placeholder="Chave secreta de criptografia (se configurada)"
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={bpConfig.isEnabled}
                  onChange={(e) => setBpConfig({ ...bpConfig, isEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Ativar integração direta com Botpress Cloud
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              {bpConfig.isEnabled
                ? 'Mensagens serão roteadas para seu bot no Botpress Cloud.'
                : 'Usando o motor local de consultoria técnica com as diretrizes da Meta.'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection || !bpConfig.webhookId}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {testingConnection ? 'Testando...' : 'Testar Conexão'}
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                {savingConfig ? 'Salvando...' : 'Salvar Configuração'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Principal do Chat com Troca de Conversa (Sidebar de Conversas + Janela Ativa) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row h-[720px] overflow-hidden">
        {/* Sidebar de Troca de Conversas */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
          {/* Header da Sidebar com Botão Nova Conversa */}
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Conversas ({conversations.length})</span>
            </div>

            <button
              onClick={handleNewConversation}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors cursor-pointer"
              title="Iniciar nova conversa com o bot"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova</span>
            </button>
          </div>

          {/* Lista de Conversas para Troca Rápida */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingConversations ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Carregando conversas...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Nenhuma conversa iniciada.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const lastMsg = conv.messages[conv.messages.length - 1];

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-2.5 rounded-lg text-left transition-all cursor-pointer group flex items-start justify-between gap-2 ${
                      isActive
                        ? 'bg-white border border-slate-200 shadow-xs text-slate-900 font-medium'
                        : 'hover:bg-slate-100/80 text-slate-600'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="text-xs font-semibold truncate text-slate-800 group-hover:text-slate-900">
                        {conv.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {lastMsg ? lastMsg.text : 'Nova sessão'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        {conv.messages.length} msgs · {new Date(conv.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer shrink-0"
                      title="Excluir conversa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Status do Canal na Base da Sidebar */}
          <div className="p-3 bg-white border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Botpress v2.4</span>
            </span>
            <span className="text-[10px] text-slate-400">Chat API Online</span>
          </div>
        </div>

        {/* Janela Ativa do Chat */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Header da Conversa Ativa */}
          <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 truncate">
                {activeConversation?.title || 'Sessão de Dúvidas'}
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                ID: {activeConversationId || 'conv_default'} · Origem:{' '}
                {bpConfig.isEnabled && bpConfig.webhookId ? 'Botpress Cloud' : 'Arquiteto Meta'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleNewConversation}
                className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer hidden sm:block"
              >
                + Nova Conversa
              </button>
            </div>
          </div>

          {/* Lista de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
            {activeConversation?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-slate-800 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Balão de Mensagem */}
                <div
                  className={`max-w-[85%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1.5 pb-1 border-b border-slate-100">
                      <span>
                        {msg.integrationSource === 'botpress_cloud_chat'
                          ? 'Botpress Cloud (integrations/chat)'
                          : 'Especialista Meta WhatsApp'}
                      </span>
                    </div>
                  )}

                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Links Oficiais Obrigatórios da Meta */}
                  {msg.officialDocLinks && msg.officialDocLinks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Documentação Oficial Meta:
                      </span>
                      {msg.officialDocLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline block"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{link.title}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Chips de Perguntas Sugeridas / Botões do Fluxo */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (action.includes('Orçamento') || action.includes('Formulário')) {
                              onNavigateToQuote();
                            } else if (action.includes('Diagnóstico')) {
                              onNavigateToWizard();
                            } else {
                              handleSend(action);
                            }
                          }}
                          className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 font-mono text-right ${
                      msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>
                    {bpConfig.isEnabled && bpConfig.webhookId
                      ? 'Consultando bot no Botpress Cloud (Chat API)...'
                      : 'Consultando fluxo de diretrizes oficiais da Meta...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua dúvida sobre homologação na Meta, webhooks, Baileys ou orçamentos..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
