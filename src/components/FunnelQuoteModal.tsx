import React, { useState } from 'react';
import { AutomationStack, CompanyProfile, DiagnosticResult, MonthlyVolume } from '../types';
import { submitQuoteRequest } from '../services/api';
import {
  Check,
  CheckCircle2,
  Sparkles,
  Layers,
  Cpu,
  Bot,
  Headphones,
  Database,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface FunnelQuoteModalProps {
  diagnostic?: DiagnosticResult | null;
  onSuccess?: () => void;
}

const STACK_OPTIONS: Array<{
  id: AutomationStack;
  title: string;
  subtitle: string;
  description: string;
  basePrice: number;
  icon: React.ElementType;
}> = [
  {
    id: 'twilio',
    title: 'Twilio WhatsApp Platform',
    subtitle: 'Conectividade BSP & SLA Global',
    description: 'Infraestrutura corporativa com redundância de operadoras, API Verify para OTP e alta taxa de entrega garantida.',
    basePrice: 2200,
    icon: Cpu
  },
  {
    id: 'n8n',
    title: 'n8n Workflow Engine',
    subtitle: 'Orquestração de Filas & Backoff',
    description: 'Gestão de filas de disparo, tratamento de rate limits da Meta (erro 130429) e sincronização bidirecional com CRM/ERP.',
    basePrice: 2800,
    icon: Layers
  },
  {
    id: 'botpress',
    title: 'Botpress AI Chatbot',
    subtitle: 'IA Conversacional & Intents',
    description: 'Chatbot com inteligência contextual alimentado pela base de conhecimento da empresa e botões nativos do WhatsApp.',
    basePrice: 3200,
    icon: Bot
  },
  {
    id: 'chatwoot',
    title: 'Chatwoot Service Desk',
    subtitle: 'Atendimento Humano Unificado',
    description: 'Caixa de entrada compartilhada entre atendentes, filas por setor, notas internas e transbordo suave do chatbot.',
    basePrice: 1900,
    icon: Headphones
  },
  {
    id: 'custom_ia',
    title: 'Integração de IA com ERP / Banco',
    subtitle: 'RAG & Automações Críticas',
    description: 'Consulta em tempo real de pedidos, faturamento e emissão de boletos/Pix diretamente pela conversa do WhatsApp.',
    basePrice: 3800,
    icon: Database
  }
];

export const FunnelQuoteModal: React.FC<FunnelQuoteModalProps> = ({
  diagnostic,
  onSuccess
}) => {
  const profile = diagnostic?.companyProfile;

  const [selectedStacks, setSelectedStacks] = useState<AutomationStack[]>([
    'twilio',
    'n8n',
    'botpress',
    'chatwoot'
  ]);

  const [contactName, setContactName] = useState(profile?.contactPerson || '');
  const [contactEmail, setContactEmail] = useState(profile?.corporateEmail || '');
  const [contactPhone, setContactPhone] = useState(profile?.contactPhone || '');
  const [companyName, setCompanyName] = useState(profile?.name || '');
  const [monthlyVolume, setMonthlyVolume] = useState<MonthlyVolume>(profile?.monthlyMessageVolume || '1k_10k');
  const [urgency, setUrgency] = useState<'immediate' | '1_month' | 'planning'>('immediate');
  const [useCaseDescription, setUseCaseDescription] = useState(
    diagnostic?.companyProfile.segment
      ? `Implementação para o segmento ${diagnostic.companyProfile.segment} com objetivo de atendimento escalável e conformidade com a Meta.`
      : ''
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleStack = (id: AutomationStack) => {
    if (selectedStacks.includes(id)) {
      if (selectedStacks.length === 1) return; // manter ao menos 1
      setSelectedStacks(selectedStacks.filter((s) => s !== id));
    } else {
      setSelectedStacks([...selectedStacks, id]);
    }
  };

  // Cálculo de faixa de investimento estimada
  const baseTotal = selectedStacks.reduce((acc, stackId) => {
    const opt = STACK_OPTIONS.find((o) => o.id === stackId);
    return acc + (opt ? opt.basePrice : 0);
  }, 0);

  const volumeMultiplier =
    monthlyVolume === 'over_100k'
      ? 1.8
      : monthlyVolume === '50k_100k'
      ? 1.5
      : monthlyVolume === '10k_50k'
      ? 1.2
      : 1.0;

  const estimatedMin = Math.round((baseTotal * volumeMultiplier) / 100) * 100;
  const estimatedMax = Math.round((estimatedMin * 1.35) / 100) * 100;

  const formattedEstimate = `R$ ${estimatedMin.toLocaleString('pt-BR')} - R$ ${estimatedMax.toLocaleString('pt-BR')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactPhone || !companyName) {
      setErrorMessage('Por favor preencha todos os campos obrigatórios de contato.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await submitQuoteRequest({
        diagnosticId: diagnostic?.id,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        selectedStacks,
        monthlyVolume,
        urgency,
        estimatedInvestmentRange: formattedEstimate,
        useCaseDescription
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao enviar proposta';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-emerald-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Solicitação de Orçamento Registrada com Sucesso!
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Nossa equipe sênior de soluções para <strong>WhatsApp Cloud API & Twilio/n8n/Botpress</strong> já recebeu os dados do seu diagnóstico e entrará em contato em até <strong>4 horas comerciais</strong> pelo WhatsApp informado.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-md mx-auto text-xs text-slate-700 space-y-1 font-mono text-left">
            <div><strong>Empresa:</strong> {companyName}</div>
            <div><strong>Contato:</strong> {contactName} ({contactPhone})</div>
            <div><strong>Faixa Estimada:</strong> {formattedEstimate}</div>
            <div><strong>Módulos:</strong> {selectedStacks.join(' + ')}</div>
          </div>
          <div className="pt-4">
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Realizar outra simulação
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner de Apresentação Comercial */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Passo 2 do Funil: Automação Sob Demanda</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Simulador de Arquitetura & Orçamento de Automação
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Enquanto o diagnóstico preliminar é 100% gratuito para balizar seus requisitos da Meta, nossa equipe de engenharia constrói e implanta o ecossistema completo de automação em produção com SLA garantido.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna 1: Seleção de Módulos da Stack (8 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Selecione os Módulos da sua Solução</span>
              <span className="text-xs font-mono text-slate-500 font-normal">
                {selectedStacks.length} selecionados
              </span>
            </h2>

            <div className="space-y-3">
              {STACK_OPTIONS.map((stack) => {
                const isSelected = selectedStacks.includes(stack.id);
                const IconComponent = stack.icon;

                return (
                  <div
                    key={stack.id}
                    onClick={() => toggleStack(stack.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-emerald-700" />
                          <span>{stack.title}</span>
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {stack.subtitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {stack.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna 2: Formulário de Contato e Resumo da Faixa (5 colunas) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Resumo do Investimento */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Estimativa Preliminar de Implantação
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {formattedEstimate}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              * Estimativa de setup e homologação técnica inicial. Custos oficiais de mensagens da Meta (tarifas Utility/Marketing) são cobrados diretamente na sua conta Meta.
            </p>
          </div>

          {/* Formulário de Envio de Lead */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Dados para Recebimento da Proposta
            </h3>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Razão Social ou Nome da Empresa *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Minha Empresa Ltda"
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Responsável *
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex: Victor Araújo"
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail Corporativo *
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="nome@suaempresa.com.br"
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp com DDD *
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgência do Projeto
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as 'immediate' | '1_month' | 'planning')}
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="immediate">Imediata (preciso colocar no ar este mês)</option>
                <option value="1_month">Em até 30 a 60 dias</option>
                <option value="planning">Apenas planejamento orçamentário</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações do Caso de Uso
              </label>
              <textarea
                rows={2}
                value={useCaseDescription}
                onChange={(e) => setUseCaseDescription(e.target.value)}
                placeholder="Ex: Queremos integrar disparos automáticos de rastreamento de frete e suporte com IA para dúvidas frequentes..."
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Enviando Proposta...' : 'Solicitar Orçamento Executivo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
