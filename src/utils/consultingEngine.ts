import { ChatMessage, CompanyProfile } from '../types';

interface ConsultingResponse {
  text: string;
  officialDocLinks: Array<{ title: string; url: string }>;
  suggestedActions: string[];
}

export function handleConsultingQuery(
  userQuery: string,
  profile?: CompanyProfile | null,
  currentScore?: number | null
): ConsultingResponse {
  const query = userQuery.toLowerCase().trim();

  // 1. Dúvida sobre risco de Baileys / APIs não oficiais vs Cloud API
  if (
    query.includes('baileys') ||
    query.includes('evolution') ||
    query.includes('não oficial') ||
    query.includes('nao oficial') ||
    query.includes('banimento') ||
    query.includes('bloqueio') ||
    query.includes('venom') ||
    query.includes('wppconnect')
  ) {
    return {
      text: `ATENÇÃO SOBRE RISCOS OPERACIONAIS:
O uso de bibliotecas de engenharia reversa (Baileys, Evolution API, Venom, WPPConnect) conecta-se aos servidores do WhatsApp simulando o protocolo Web multi-device.

A Meta monitora padrões de tráfego através de algoritmos de detecção comportamental e integridade criptográfica. Os principais riscos comprovados são:
1. Banimento Permanente do Número de Telefone: Uma vez banido pelo sistema antifraude da Meta, o número não pode ser reativado, perdendo todo o histórico de contatos e reputação com clientes.
2. Responsabilidade Jurídica: Violar os Termos de Serviço da Meta pode ensejar notificação extrajudicial para a empresa titular do CNPJ.
3. Instabilidade Técnica: A cada atualização do protocolo do WhatsApp Web, a biblioteca quebra, interrompendo atendimentos em pleno horário comercial.

Recomendação técnica: Para empresas com CNPJ e volume operacional, a única rota sustentável é a WhatsApp Cloud API oficial (direta ou via parceiros como Twilio).`,
      officialDocLinks: [
        {
          title: 'Meta: Termos de Serviço e Uso Autorizado do WhatsApp',
          url: 'https://www.whatsapp.com/legal/terms-of-service'
        },
        {
          title: 'Meta: WhatsApp Business Terms of Service',
          url: 'https://developers.facebook.com/docs/whatsapp/overview/business-terms'
        }
      ],
      suggestedActions: [
        'Como migrar um número do Baileys para a Cloud API?',
        'Qual o custo por mensagem na Cloud API oficial?',
        'Solicitar orçamento de automação segura com Twilio/n8n'
      ]
    };
  }

  // 2. Verificação de Empresa / Conta Rejeitada / CNPJ
  if (
    query.includes('verificação') ||
    query.includes('verificacao') ||
    query.includes('rejeitada') ||
    query.includes('recusada') ||
    query.includes('cnpj') ||
    query.includes('business manager') ||
    query.includes('comprovante')
  ) {
    return {
      text: `PASSO A PASSO TÉCNICO PARA APROVAÇÃO DA EMPRESA NA META:

A verificação do Meta Business Portfolio falha em 90% das vezes por divergências documentais simples. Siga rigorosamente este checklist:

1. Cartão CNPJ Atualizado: Baixe a emissão recente no site da Receita Federal. O nome societário (Razão Social) cadastrado no Meta Business deve ser 100% idêntico.
2. Comprovante de Endereço Societário: Deve estar emitido exatamente em nome da Razão Social e com o CNPJ idêntico (ex: conta de energia, água ou telefone fixo dos últimos 90 dias).
3. Domínio e E-mail: O administrador que submete a verificação DEVE usar um e-mail com domínio corporativo próprio (@suaempresa.com.br). E-mails @gmail ou @outlook são reprovados.
4. Rodapé do Website: O site precisa estar online com protocolo HTTPS, exibindo Razão Social, CNPJ e endereço no rodapé em perfeita consonância com o cartão CNPJ.`,
      officialDocLinks: [
        {
          title: 'Meta Business Help: Guia Oficial de Verificação de Empresas',
          url: 'https://www.facebook.com/business/help/2058515294227817'
        },
        {
          title: 'Meta: Documentação Aceita para Verificação no Brasil',
          url: 'https://www.facebook.com/business/help/159334372093366'
        }
      ],
      suggestedActions: [
        'Meu site precisa ter termos de privacidade LGPD?',
        'O que fazer se o número já estiver cadastrado no app de celular?',
        'Avaliar prontidão no diagnóstico gratuito'
      ]
    };
  }

  // 3. Webhook / Token / System User / Erros de API
  if (
    query.includes('webhook') ||
    query.includes('token') ||
    query.includes('system user') ||
    query.includes('graph api') ||
    query.includes('403') ||
    query.includes('131047') ||
    query.includes('verify_token')
  ) {
    return {
      text: `ARQUITETURA DE WEBHOOKS & SYSTEM USER TOKENS:

1. Handshake do Webhook (GET):
Ao cadastrar sua URL no painel da Meta, ela envia uma requisição GET com os parâmetros:
- hub.mode = "subscribe"
- hub.verify_token = [seu token secreto definido no painel]
- hub.challenge = [código randômico gerado pela Meta]
Seu backend deve validar o token e devolver exatamente o valor de 'hub.challenge' com HTTP 200.

2. Recebimento de Mensagens (POST):
A Meta envia eventos de mensagens e status de entrega.
Regra de Ouro: Seu servidor DEVE responder HTTP 200 OK em menos de 3 segundos. Se demorar, a Meta reenvia com backoff e pode desativar o webhook. Coloque o payload em fila assíncrona (n8n ou Redis).

3. System User Token:
Nunca utilize tokens gerados pelo Graph API Explorer em produção (expiram em 24h). Crie um Usuário do Sistema (Admin) dentro do Business Manager e gere um token permanente com os escopos 'whatsapp_business_messaging' e 'whatsapp_business_management'.`,
      officialDocLinks: [
        {
          title: 'Meta Docs: Webhook Components and Verification',
          url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components'
        },
        {
          title: 'Meta Docs: System Users & Permanent Access Tokens',
          url: 'https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#system-users'
        }
      ],
      suggestedActions: [
        'Como configurar webhook direto no n8n?',
        'Como funciona a integração com Chatwoot?',
        'Simular envio de template com a Graph API'
      ]
    };
  }

  // 4. Templates, Categorias e Custos
  if (
    query.includes('template') ||
    query.includes('custo') ||
    query.includes('preço') ||
    query.includes('preco') ||
    query.includes('marketing') ||
    query.includes('utility') ||
    query.includes('janela') ||
    query.includes('24h')
  ) {
    return {
      text: `DIRETRIZES DE TEMPLATES & MODELO DE COBRANÇA DA META:

1. As 3 Categorias Oficiais:
- Utility (Utilidade): Notificações transacionais pós-compra, rastreamento de pedidos, confirmações de agendamento. Menor custo unitário.
- Marketing: Promoções, cupons, reengajamento, ofertas personalizadas. Tarifação específica por país.
- Authentication (Autenticação): Códigos de verificação em duas etapas (OTP) e login sem senha.

2. Janela de 24 Horas:
Quando um cliente envia uma mensagem para sua empresa, abre-se uma janela de 24 horas. Dentro desse período, sua empresa pode trocar mensagens de texto livre sem necessidade de template aprovado. Passadas as 24h, apenas templates pagos podem reabrir a conversa.

3. Rejeição de Templates:
Motivos mais comuns: erros gramaticais, variáveis vazias {{1}} sem contexto, URLs com encurtadores genéricos (bit.ly) ou tentar aprovar conteúdo promocional sob a categoria 'utility'.`,
      officialDocLinks: [
        {
          title: 'Meta Docs: Message Templates Guidelines',
          url: 'https://developers.facebook.com/docs/whatsapp/message-templates/guidelines'
        },
        {
          title: 'Meta Docs: Tabela de Preços e Tarifas da Cloud API',
          url: 'https://developers.facebook.com/docs/whatsapp/pricing'
        }
      ],
      suggestedActions: [
        'Como estruturar opt-out em templates de marketing?',
        'Qual o limite diário de mensagens (Tiers 1k, 10k, 100k)?',
        'Contratar arquitetura n8n + Twilio para gestão de disparos'
      ]
    };
  }

  // 5. Automações n8n, Botpress e Twilio
  if (
    query.includes('n8n') ||
    query.includes('botpress') ||
    query.includes('twilio') ||
    query.includes('chatwoot') ||
    query.includes('arquitetura') ||
    query.includes('stack')
  ) {
    return {
      text: `STACK RECOMENDADA DE ALTA ESCALABILIDADE:

Para operações corporativas que necessitam de IA, filas e atendimento multicanal:

1. Camada de Conectividade:
- WhatsApp Cloud API Direta (custo zero de intermediário, ideal para até 50k msgs/dia).
- Twilio WhatsApp Business Platform (ideal para empresas que necessitam de SLA garantido, redundância global de operadoras e ferramentas de segurança OTP).

2. Orquestração & Automação (n8n):
- Recebe webhooks em milissegundos.
- Realiza validação de dados em ERPs, CRMs (HubSpot, Salesforce, Pipedrive) e bancos SQL.
- Implementa retentativa com backoff exponencial contra erros 429 de Rate Limit.

3. Atendimento com IA (Botpress):
- Motor de compreensão de linguagem natural treinado com a base de conhecimento da empresa.
- Componentes nativos do WhatsApp: botões interativos (Quick Reply) e listas dinâmicas.

4. Central Humana (Chatwoot):
- Transbordo suave quando o robô detecta intenção complexa ou pedido explícito de atendente humano.`,
      officialDocLinks: [
        {
          title: 'Meta Docs: WhatsApp Interactive Messages',
          url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#interactive-messages'
        },
        {
          title: 'Meta Docs: Guia de Rate Limits e Escalabilidade',
          url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/guides/handle-rate-limits'
        }
      ],
      suggestedActions: [
        'Solicitar orçamento de implantação n8n + Botpress',
        'Fazer o diagnóstico de elegibilidade da empresa',
        'Entender requisitos de número dedicado'
      ]
    };
  }

  // Resposta padrão contextual
  const companyContext = profile?.name ? ` para a empresa ${profile.name}` : '';
  const scoreContext = currentScore !== undefined && currentScore !== null ? ` Seu score atual é de ${currentScore}/100.` : '';

  return {
    text: `Olá! Sou seu Arquiteto de Soluções e Especialista em WhatsApp Cloud API da Meta${companyContext}.${scoreContext}

Posso ajudá-lo com:
1. Requisitos para aprovação de empresa e verificação de CNPJ/Website na Meta.
2. Configuração técnica de Webhooks HTTPS, System User Tokens permanentes e registro de linha.
3. Diferenças entre WhatsApp Cloud API oficial vs riscos operacionais de APIs não oficiais (Baileys/Evolution).
4. Arquiteturas de integração em produção utilizando Twilio, n8n, Botpress e Chatwoot.
5. Aprovação e custos de Templates de Mensagem (Utility, Marketing, Auth) e janela de 24h.

Como posso orientar sua arquitetura agora?`,
    officialDocLinks: [
      {
        title: 'Meta Developers: WhatsApp Cloud API Overview',
        url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/overview'
      },
      {
        title: 'Meta: Central de Políticas Comerciais',
        url: 'https://www.facebook.com/policies_center/commerce'
      }
    ],
    suggestedActions: [
      'Por que não devo usar Baileys em produção?',
      'O que preciso para verificar meu CNPJ na Meta?',
      'Como funciona o webhook e o token permanente?',
      'Quero solicitar orçamento de automação'
    ]
  };
}
