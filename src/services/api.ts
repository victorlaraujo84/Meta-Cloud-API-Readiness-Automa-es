import { AutomationQuoteLead, BotpressChatConfig, ChatConversation, CompanyProfile, DiagnosticResult, Requirement, RequirementCategory, RequirementStatus } from '../types';

export interface RequirementsResponse {
  categories: Record<RequirementCategory, { label: string; description: string }>;
  requirements: Requirement[];
  totalCount: number;
}

export async function getRequirements(): Promise<RequirementsResponse> {
  const res = await fetch('/api/requirements');
  if (!res.ok) {
    throw new Error('Falha ao carregar requisitos oficiais da Meta');
  }
  return res.json();
}

export async function getDiagnostics(): Promise<DiagnosticResult[]> {
  const res = await fetch('/api/diagnostics');
  if (!res.ok) {
    throw new Error('Falha ao carregar histórico de diagnósticos');
  }
  return res.json();
}

export async function getDiagnosticById(id: string): Promise<DiagnosticResult> {
  const res = await fetch(`/api/diagnostics/${id}`);
  if (!res.ok) {
    throw new Error('Diagnóstico não encontrado');
  }
  return res.json();
}

export async function saveDiagnostic(payload: {
  companyProfile: CompanyProfile;
  answers: Record<string, RequirementStatus>;
  notes?: Record<string, string>;
  id?: string;
}): Promise<DiagnosticResult> {
  const res = await fetch('/api/diagnostics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao salvar diagnóstico');
  }
  return res.json();
}

export async function deleteDiagnostic(id: string): Promise<void> {
  const res = await fetch(`/api/diagnostics/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Falha ao excluir diagnóstico');
  }
}

export async function submitQuoteRequest(payload: {
  diagnosticId?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  selectedStacks: string[];
  monthlyVolume: string;
  urgency: string;
  estimatedInvestmentRange: string;
  useCaseDescription: string;
}): Promise<{ success: boolean; quote: AutomationQuoteLead; message: string }> {
  const res = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao submeter solicitação de orçamento');
  }
  return res.json();
}

export async function getQuoteLeads(): Promise<AutomationQuoteLead[]> {
  const res = await fetch('/api/quotes');
  if (!res.ok) {
    throw new Error('Falha ao carregar lista de orçamentos');
  }
  return res.json();
}

export async function getBotpressConfig(): Promise<BotpressChatConfig> {
  const res = await fetch('/api/botpress/config');
  if (!res.ok) {
    throw new Error('Falha ao carregar configuração do Botpress');
  }
  return res.json();
}

export async function saveBotpressConfig(config: BotpressChatConfig): Promise<{ success: boolean; config: BotpressChatConfig }> {
  const res = await fetch('/api/botpress/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) {
    throw new Error('Falha ao salvar configuração do Botpress');
  }
  return res.json();
}

export async function testBotpressConnection(webhookId: string, apiUrl?: string): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await fetch('/api/botpress/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webhookId, apiUrl })
  });
  return res.json();
}

export async function getChatConversations(): Promise<ChatConversation[]> {
  const res = await fetch('/api/chat/conversations');
  if (!res.ok) {
    throw new Error('Falha ao carregar lista de conversas');
  }
  return res.json();
}

export async function createChatConversation(title?: string): Promise<ChatConversation> {
  const res = await fetch('/api/chat/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  if (!res.ok) {
    throw new Error('Falha ao criar nova conversa');
  }
  return res.json();
}

export async function getChatConversationById(id: string): Promise<ChatConversation> {
  const res = await fetch(`/api/chat/conversations/${id}`);
  if (!res.ok) {
    throw new Error('Falha ao carregar conversa');
  }
  return res.json();
}

export async function deleteChatConversation(id: string): Promise<void> {
  const res = await fetch(`/api/chat/conversations/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Falha ao excluir conversa');
  }
}

export async function sendConsultingChat(payload: {
  message: string;
  profile?: CompanyProfile | null;
  currentScore?: number | null;
  conversationId?: string | null;
}): Promise<{
  text: string;
  conversationId?: string;
  officialDocLinks: Array<{ title: string; url: string }>;
  suggestedActions: string[];
  integrationSource?: 'builtin_specialist' | 'botpress_cloud_chat';
  conversation?: ChatConversation;
}> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error('Falha ao processar consulta de arquitetura');
  }
  return res.json();
}

