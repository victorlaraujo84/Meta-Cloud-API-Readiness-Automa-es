export interface BotpressFlowNode {
  id: string;
  name: string;
  title: string;
  description: string;
  topic: string;
  prompt: string;
  response: {
    text: string;
    suggestedActions: string[];
    officialDocLinks: Array<{ title: string; url: string }>;
  };
  transitions: Array<{
    trigger: string;
    targetNodeId: string;
    label: string;
  }>;
}

export const BOTPRESS_FAQ_FLOW: {
  botName: string;
  version: string;
  description: string;
  startNode: string;
  nodes: BotpressFlowNode[];
} = {
  botName: 'Meta WhatsApp Readiness Consultant (Botpress Flow)',
  version: '2.4.0',
  description: 'Fluxo oficial Botpress para triagem, esclarecimento de dúvidas da WhatsApp Cloud API e conversão para serviços de automação.',
  startNode: 'welcome_node',
  nodes: [
    {
      id: 'welcome_node',
      name: 'start',
      title: 'Boas-vindas & Identificação de Intenção',
      description: 'Saudação inicial, apresentação dos pilares da Meta e escuta ativa da dúvida do cliente.',
      topic: 'Boas-Vindas',
      prompt: 'Olá, sou o assistente de arquitetura da WhatsApp Cloud API.',
      response: {
        text: `Olá! Sou o assistente de arquitetura e conformidade da Meta WhatsApp Cloud API.

Posso esclarecer qualquer dúvida técnica ou operacional antes de você submeter sua empresa à Meta:
1. Verificação de Empresa & CNPJ na Meta
2. Riscos de banimento com APIs Não Oficiais (Baileys / Evolution API)
3. Infraestrutura de Webhooks HTTPS & System User Tokens
4. Templates, Tarifas (Marketing, Utility) & Janela de 24 horas
5. Arquitetura completa com Twilio, n8n e Chatwoot

Qual assunto você deseja explorar agora?`,
        suggestedActions: [
          'Verificação de Empresa & CNPJ',
          'Riscos de banimento com Baileys',
          'Webhooks & Tokens de Sistema',
          'Custos de Templates & Janela 24h',
          'Quero um orçamento de automação'
        ],
        officialDocLinks: [
          {
            title: 'Meta: Visão Geral da WhatsApp Cloud API',
            url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/overview'
          }
        ]
      },
      transitions: [
        { trigger: 'cnpj', targetNodeId: 'verification_node', label: 'Verificação & CNPJ' },
        { trigger: 'baileys', targetNodeId: 'baileys_node', label: 'Riscos Baileys' },
        { trigger: 'webhook', targetNodeId: 'webhook_node', label: 'Webhooks & Tokens' },
        { trigger: 'template', targetNodeId: 'templates_node', label: 'Templates & Custos' },
        { trigger: 'orcamento', targetNodeId: 'quote_node', label: 'Solicitar Orçamento' }
      ]
    },
    {
      id: 'verification_node',
      name: 'verificacao_empresa',
      title: 'Verificação do Meta Business Portfolio & CNPJ',
      description: 'Orientações práticas para aprovação cadastral e documental na Meta sem risco de rejeição.',
      topic: 'Documentação & Legal',
      prompt: 'Como aprovar o CNPJ e a empresa na Meta?',
      response: {
        text: `PASSO A PASSO PARA APROVAÇÃO DO CNPJ NA META BUSINESS:

1. Cartão CNPJ Atualizado:
A Razão Social cadastrada no Meta Business deve ser 100% idêntica ao comprovante de inscrição da Receita Federal (inclusive pontuações e tipo societário Ltda/S.A.).

2. Comprovante de Endereço Societário:
Apresente conta de consumo (energia elétrica, água, gás ou telefone fixo) em nome da empresa emitido nos últimos 90 dias, exatamente no endereço constante no CNPJ.

3. Domínio Corporativo Obrigatório:
O e-mail do administrador no Business Manager DEVE possuir domínio próprio (ex: contato@suaempresa.com.br). E-mails @gmail, @outlook ou @yahoo são automaticamente rejeitados na etapa de verificação.

4. Website Institucional com HTTPS:
O site da empresa precisa estar público, seguro com SSL e exibir Razão Social, CNPJ e canais de contato no rodapé.`,
        suggestedActions: [
          'E se minha conta já foi rejeitada antes?',
          'Preciso ter termos de privacidade LGPD no site?',
          'Entender os riscos de APIs não oficiais'
        ],
        officialDocLinks: [
          {
            title: 'Meta Business Help: Guia Oficial de Verificação de Empresas',
            url: 'https://www.facebook.com/business/help/2058515294227817'
          },
          {
            title: 'Meta: Documentos Aceitos no Brasil para Verificação',
            url: 'https://www.facebook.com/business/help/159334372093366'
          }
        ]
      },
      transitions: [
        { trigger: 'rejeitada', targetNodeId: 'rejection_recovery_node', label: 'Recuperar Conta Rejeitada' },
        { trigger: 'baileys', targetNodeId: 'baileys_node', label: 'Riscos Baileys' },
        { trigger: 'orcamento', targetNodeId: 'quote_node', label: 'Solicitar Consultoria' }
      ]
    },
    {
      id: 'rejection_recovery_node',
      name: 'recuperacao_rejeitada',
      title: 'Recuperação de Contas Comerciais Rejeitadas',
      description: 'Diagnóstico cirúrgico dos motivos de rejeição anterior e protocolo de recurso oficial.',
      topic: 'Recuperação',
      prompt: 'O que fazer se a empresa foi rejeitada na Meta?',
      response: {
        text: `PROTOCOLO PARA REVERTER REJEIÇÃO NA META:

Se sua conta foi recusada, o erro mais frequente é a divergência de dados entre o registro público e o cartão submetido.

Checklist de Correção:
1. Acesse Meta Business Suite > Configurações do Negócio > Informações da Empresa.
2. Atualize o Nome Legal e Endereço para bater letra por letra com o Comprovante de Inscrição da Receita Federal.
3. Se o e-mail de verificação não chegar, configure o registro TXT ou arquivo HTML no DNS do seu domínio institucional.
4. Abra um ticket no Suporte a Empresas da Meta anexando Contrato Social consolidado e Cartão CNPJ recente.`,
        suggestedActions: [
          'Quais os requisitos de linha telefônica?',
          'Como funciona a infraestrutura de Webhooks?',
          'Solicitar ajuda técnica para aprovação'
        ],
        officialDocLinks: [
          {
            title: 'Meta Business Help: Como Recorrer de Rejeição de Verificação',
            url: 'https://www.facebook.com/business/help/159334372093366'
          }
        ]
      },
      transitions: [
        { trigger: 'webhook', targetNodeId: 'webhook_node', label: 'Infraestrutura' },
        { trigger: 'orcamento', targetNodeId: 'quote_node', label: 'Solicitar Apoio' }
      ]
    },
    {
      id: 'baileys_node',
      name: 'riscos_baileys_engenharia_reversa',
      title: 'Riscos Operacionais de Baileys & APIs Não Oficiais',
      description: 'Análise de vulnerabilidades, detecção algorítmica e roteiro de migração segura.',
      topic: 'Segurança & Risco',
      prompt: 'Por que não devo usar Baileys ou Evolution API em produção?',
      response: {
        text: `ALERTA DE SEGURANÇA OPERACIONAL: BAILEYS / EVOLUTION / VENOM

Bibliotecas baseadas em conexão multi-device de WhatsApp Web operam por engenharia reversa e apresentam 3 riscos estruturais para o seu negócio:

1. Banimento Permanente do Número Telefônico:
A Meta monitora anomalias de handshake TLS e padrões de envio. Quando a linha é suspensa por violação dos Termos de Serviço, o número é bloqueado para sempre, resultando na perda irreparável de clientes ativos.

2. Inviabilidade em Escala:
Sempre que o WhatsApp Web atualiza sua criptografia de protocolo, as bibliotecas quebram até que um voluntário lance um patch, gerando horas ou dias de apagão comercial.

3. Falta de Criptografia Corporativa & SLA:
Provedores não oficiais não garantem conformidade com LGPD nem tempo de resposta.

Solução Recomendada: Migre para a WhatsApp Cloud API Oficial. Você preserva o mesmo número (desde que desvincule do app de celular) e ganha estabilidade de 99.9% com capacidade de disparar milhares de mensagens por segundo.`,
        suggestedActions: [
          'Como migrar meu número com segurança para a Cloud API?',
          'Como a Twilio protege meu tráfego?',
          'Solicitar projeto de migração com n8n + Twilio'
        ],
        officialDocLinks: [
          {
            title: 'Meta: Termos de Serviço do WhatsApp Business',
            url: 'https://developers.facebook.com/docs/whatsapp/overview/business-terms'
          },
          {
            title: 'Meta: Diretrizes de Registro e Migração de Linhas',
            url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers'
          }
        ]
      },
      transitions: [
        { trigger: 'migracao', targetNodeId: 'webhook_node', label: 'Passo a Passo de Migração' },
        { trigger: 'orcamento', targetNodeId: 'quote_node', label: 'Contratar Migração' }
      ]
    },
    {
      id: 'webhook_node',
      name: 'webhooks_e_tokens',
      title: 'Infraestrutura de Webhooks HTTPS & System User Tokens',
      description: 'Arquitetura técnica para receber mensagens, validar tokens permanentes e evitar timeout da Graph API.',
      topic: 'Arquitetura Backend',
      prompt: 'Como configurar o Webhook e o Token Permanente na Meta?',
      response: {
        text: `ARQUITETURA DE WEBHOOKS & SYSTEM USER TOKENS:

1. Handshake do Webhook (Requisição GET da Meta):
A Meta envia três parâmetros de query na validação:
• hub.mode: sempre "subscribe"
• hub.verify_token: token secreto que você cadastrou no painel
• hub.challenge: valor alfanumérico aleatório
Seu backend deve validar o token e retornar imediatamente o hub.challenge com status HTTP 200.

2. Recebimento de Mensagens (Requisição POST):
Quando um usuário envia mensagem ou há mudança no status (sent, delivered, read), a Meta envia um POST JSON.
Regra Mandatória: Seu servidor DEVE responder HTTP 200 OK em menos de 3 segundos. Se demorar, a Meta reenvia a mensagem com backoff exponencial e pode desativar o webhook. Coloque o payload em fila (n8n ou Redis/BullMQ).

3. Token Permanente do Usuário de Sistema:
Não use User Access Tokens (expiram em 24h). No Meta Business Manager:
Vá em Usuários > Usuários do Sistema > Criar Administrador de Sistema > Atribuir WhatsApp WABA > Gerar Token Permanente com permissões:
- whatsapp_business_messaging
- whatsapp_business_management`,
        suggestedActions: [
          'Como integrar o Webhook direto no n8n?',
          'Como configurar templates de mensagem?',
          'Quero apoio técnico para configurar minha API'
        ],
        officialDocLinks: [
          {
            title: 'Meta Docs: Webhook Components & Handshake Verification',
            url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components'
          },
          {
            title: 'Meta Docs: System Users & Permanent Access Tokens',
            url: 'https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#system-users'
          }
        ]
      },
      transitions: [
        { trigger: 'template', targetNodeId: 'templates_node', label: 'Templates' },
        { trigger: 'orcamento', targetNodeId: 'quote_node', label: 'Contratar Setup de Webhook' }
      ]
    },
    {
      id: 'templates_node',
      name: 'templates_e_tarifas',
      title: 'Templates Homologados, Tarifação & Janela de 24h',
      description: 'Como funciona a cobrança oficial da Meta e como evitar rejeição de mensagens promocionais.',
      topic: 'Templates & Custos',
      prompt: 'Como funciona a janela de 24h e o custo de templates?',
      response: {
        text: `MODELO OFICIAL DE COBRANÇA & CATEGORIAS DE TEMPLATES:

1. Janela de Conversa de 24 Horas:
Quando o cliente envia uma mensagem para sua empresa, abre-se uma janela de atendimento de 24h. Nesse intervalo, sua empresa pode enviar quantas mensagens de texto livre desejar sem pagar tarifas adicionais de template.

2. Disparos Ativos (Fora das 24h):
Para iniciar contato proativo, é obrigatório utilizar templates pré-aprovados pela Meta nas categorias:
• Utility (Utilidade): Notificações de rastreamento, confirmações de pedido, recibos (menor custo).
• Marketing: Ofertas, novidades, reengajamento, cupons.
• Authentication (Autenticação): Códigos de segurança (OTP) de 2 fatores.

3. Evitando Rejeição de Templates:
• Não use links encurtadores genéricos (bit.ly ou tinyurl).
• Deixe claro o contexto de variáveis {{1}} e {{2}}.
• Nunca submeta conteúdo promocional sob a categoria 'utility' (a Meta reclassifica ou rejeita).`,
        suggestedActions: [
          'Como colocar botão de opt-out nas mensagens de marketing?',
          'Como integrar o Botpress para responder durante as 24h?',
          'Solicitar orçamento de automação'
        ],
        officialDocLinks: [
          {
            title: 'Meta Docs: Diretrizes de Criação de Message Templates',
            url: 'https://developers.facebook.com/docs/whatsapp/message-templates/guidelines'
          },
          {
            title: 'Meta Docs: Tabela Oficial de Tarifas por País',
            url: 'https://developers.facebook.com/docs/whatsapp/pricing'
          }
        ]
      },
      transitions: [
        { trigger: 'orcamento', targetNodeId: 'quote_node', label: 'Solicitar Orçamento' },
        { trigger: 'inicio', targetNodeId: 'welcome_node', label: 'Voltar ao Menu' }
      ]
    },
    {
      id: 'quote_node',
      name: 'conversao_orcamento',
      title: 'Transbordo Comercial & Orçamento de Automação',
      description: 'Direcionamento qualificado para o formulário de orçamento de serviços Twilio, n8n, Botpress e Chatwoot.',
      topic: 'Orçamento de Automação',
      prompt: 'Quero um orçamento para implantar minha automação.',
      response: {
        text: `EXCELENTE DECISÃO! VAMOS ESTRUTURAR SUA ARQUITETURA.

Nossa equipe projeta e entrega o ecossistema pronto para operar em escala:
• Conectividade oficial via Twilio WhatsApp Platform com redundância e SLA.
• Orquestração de webhooks, filas e CRM com n8n.
• Chatbot de IA com compreensão contextual no Botpress.
• Caixa de entrada compartilhada entre atendentes humanos no Chatwoot.

Você pode preencher nosso simulador na aba 'Orçamento de Automação' para receber uma proposta executiva detalhada em até 4 horas comerciais.`,
        suggestedActions: [
          'Abrir Formulário de Orçamento de Automação',
          'Fazer o Diagnóstico Gratuito de Elegibilidade',
          'Voltar ao Menu de Dúvidas'
        ],
        officialDocLinks: [
          {
            title: 'Twilio: WhatsApp Business Platform Overview',
            url: 'https://www.twilio.com/en-us/messaging/channels/whatsapp'
          }
        ]
      },
      transitions: [
        { trigger: 'inicio', targetNodeId: 'welcome_node', label: 'Voltar ao Menu' }
      ]
    }
  ]
};

// Exportador no formato oficial Botpress Studio Flow JSON
export function generateBotpressExportableFlowJson(): string {
  const exportPayload = {
    version: '1.0.0',
    name: 'meta-cloud-api-readiness-flow',
    description: 'Fluxo oficial Botpress para esclarecimento de dúvidas e triagem da WhatsApp Cloud API da Meta',
    startNode: 'entry',
    nodes: BOTPRESS_FAQ_FLOW.nodes.map((node, index) => ({
      id: node.id,
      name: node.name,
      type: 'standard',
      position: { x: 100 + (index % 3) * 320, y: 100 + Math.floor(index / 3) * 260 },
      onEnter: [
        {
          type: 'say',
          text: node.response.text
        }
      ],
      onReceive: [],
      next: node.transitions.map((t) => ({
        condition: `event.payload.text?.toLowerCase().includes("${t.trigger}")`,
        node: t.targetNodeId
      }))
    }))
  };

  return JSON.stringify(exportPayload, null, 2);
}
