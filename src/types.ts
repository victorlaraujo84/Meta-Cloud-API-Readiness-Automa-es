export type RequirementCategory =
  | 'legal_corporate'
  | 'cloud_api_tech'
  | 'messaging_compliance'
  | 'architecture_integration'
  | 'governance';

export type Criticality = 'mandatory' | 'recommended' | 'desirable';

export type RequirementStatus = 'compliant' | 'in_progress' | 'non_compliant' | 'not_applicable';

export interface Requirement {
  id: string;
  category: RequirementCategory;
  title: string;
  shortLabel: string;
  weight: number; // 1 to 5
  criticality: Criticality;
  question: string;
  whyItMatters: string;
  officialDocUrl: string;
  officialDocTitle: string;
  resolutionTimeEstimate: string;
  practicalGuidance: string;
  commonPitfalls?: string;
}

export type MonthlyVolume =
  | 'under_1k'
  | '1k_10k'
  | '10k_50k'
  | '50k_100k'
  | 'over_100k';

export type CurrentSolution =
  | 'official_waba'
  | 'unofficial_baileys'
  | 'whatsapp_business_app'
  | 'none';

export type PreviousMetaAttempt = 'never' | 'approved' | 'rejected' | 'pending';

export interface CompanyProfile {
  id: string;
  name: string;
  tradeName?: string; // Nome Fantasia
  cnpj: string;
  corporateEmail: string;
  websiteUrl: string;
  segment: string;
  monthlyMessageVolume: MonthlyVolume;
  currentSolution: CurrentSolution;
  previousMetaAttempt: PreviousMetaAttempt;
  hasDedicatedNumber: boolean;
  contactPerson: string;
  contactPhone: string;
  notes?: string;
}

export type DiagnosticClassification = 'critical' | 'in_progress' | 'ready' | 'advanced';

export interface CategoryScore {
  category: RequirementCategory;
  categoryLabel: string;
  scoredWeight: number;
  maxWeight: number;
  percentage: number;
  compliantCount: number;
  inProgressCount: number;
  nonCompliantCount: number;
  totalCount: number;
}

export interface DiagnosticResult {
  id: string;
  companyProfile: CompanyProfile;
  answers: Record<string, RequirementStatus>;
  notes: Record<string, string>;
  score: number;
  classification: DiagnosticClassification;
  hasBlockingIssues: boolean;
  blockingIssues: Array<{
    id: string;
    title: string;
    whyItMatters: string;
    officialDocUrl: string;
    officialDocTitle: string;
  }>;
  categoryScores: Record<RequirementCategory, CategoryScore>;
  singleNextHighImpactStep: {
    requirementId: string;
    title: string;
    whyItMatters: string;
    practicalGuidance: string;
    officialDocUrl: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export type AutomationStack = 'twilio' | 'n8n' | 'botpress' | 'chatwoot' | 'custom_ia';

export interface AutomationQuoteLead {
  id: string;
  diagnosticId?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  selectedStacks: AutomationStack[];
  monthlyVolume: MonthlyVolume;
  urgency: 'immediate' | '1_month' | 'planning';
  estimatedInvestmentRange: string;
  useCaseDescription: string;
  status: 'new' | 'contacted' | 'proposal_sent' | 'closed';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  officialDocLinks?: Array<{
    title: string;
    url: string;
  }>;
  suggestedActions?: string[];
  integrationSource?: 'builtin_specialist' | 'botpress_cloud_chat';
}

export interface BotpressChatConfig {
  webhookId: string;
  encryptionKey?: string;
  apiUrl: string;
  botName?: string;
  isEnabled: boolean;
  secretDetected?: boolean;
  secretName?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}


