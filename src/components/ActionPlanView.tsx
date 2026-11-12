import React from 'react';
import { DiagnosticResult, Requirement } from '../types';
import { META_REQUIREMENTS } from '../data/metaRequirements';
import {
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface ActionPlanViewProps {
  diagnostic: DiagnosticResult;
  onNavigateToQuote: () => void;
  onNavigateToWizard: () => void;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({
  diagnostic,
  onNavigateToQuote,
  onNavigateToWizard
}) => {
  // Coletar todos os requisitos que não estão totalmente conformes
  const unmetItems: Array<{ req: Requirement; status: string }> = [];

  for (const req of META_REQUIREMENTS) {
    const status = diagnostic.answers[req.id] || 'non_compliant';
    if (status === 'non_compliant' || status === 'in_progress') {
      unmetItems.push({ req, status });
    }
  }

  // Separar em 3 Fases de Ação
  // Fase 1: Imediata (Mandatórios não conformes)
  const phase1Immediate = unmetItems.filter((i) => i.req.criticality === 'mandatory');

  // Fase 2: Curto Prazo (Recomendados ou técnicos)
  const phase2ShortTerm = unmetItems.filter(
    (i) => i.req.criticality === 'recommended' || i.req.category === 'cloud_api_tech'
  );

  // Fase 3: Otimização Contínua e Escala (Arquitetura e Governança desejáveis)
  const phase3Optimization = unmetItems.filter(
    (i) => !phase1Immediate.includes(i) && !phase2ShortTerm.includes(i)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(diagnostic, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `meta_readiness_plan_${diagnostic.companyProfile.cnpj.replace(/\D/g, '')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner do Plano */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Roteiro de Homologação</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-800">{diagnostic.companyProfile.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-600">Score Atual: {diagnostic.score}/100</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Plano de Ação Personalizado & Priorizado
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Cronograma técnico estruturado para sanar lacunas societárias, de segurança e de mensageria antes do envio à Meta Business.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Exportar dados brutos em JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={onNavigateToQuote}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contratar Execução</span>
          </button>
        </div>
      </div>

      {/* Fase 1: Ações Imediatas (Bloqueadores) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs font-mono">
              01
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Fase 1: Bloqueadores de Aprovação (Ação Imediata · 1 a 3 dias)
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-rose-700">
            {phase1Immediate.length} pendências críticas
          </span>
        </div>

        {phase1Immediate.length === 0 ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <p className="text-xs text-emerald-900 font-medium">
              Excelente! Nenhum requisito bloqueante obrigatório está pendente. Sua empresa já possui os fundamentos para homologação na Meta.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phase1Immediate.map(({ req, status }) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-rose-200 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {req.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                    {status === 'in_progress' ? 'Em Ajuste' : 'Não Atendido'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Por que importa:</strong> {req.whyItMatters}
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-800">Como resolver:</div>
                  <p>{req.practicalGuidance}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <a
                    href={req.officialDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                  >
                    <span>{req.officialDocTitle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{req.resolutionTimeEstimate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fase 2: Infraestrutura Técnica, Tokens & Webhooks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs font-mono">
              02
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Fase 2: Infraestrutura Técnica, Tokens & Webhooks (Curto Prazo · 3 a 7 dias)
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-amber-700">
            {phase2ShortTerm.length} itens recomendados
          </span>
        </div>

        {phase2ShortTerm.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-600">
              Nenhuma pendência na Fase 2.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phase2ShortTerm.map(({ req, status }) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {req.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                    {status === 'in_progress' ? 'Em Ajuste' : 'Pendente'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Por que importa:</strong> {req.whyItMatters}
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-800">Como resolver:</div>
                  <p>{req.practicalGuidance}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <a
                    href={req.officialDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                  >
                    <span>{req.officialDocTitle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{req.resolutionTimeEstimate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fase 3: Escala & Automação Inteligente */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs font-mono">
              03
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Fase 3: Escala, Automações & Redução de Custos (Melhoria Contínua)
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600">
            {phase3Optimization.length} itens de escala
          </span>
        </div>

        {phase3Optimization.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-600">
              Todos os itens de escala já atendidos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phase3Optimization.map(({ req, status }) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {req.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {status === 'in_progress' ? 'Em Ajuste' : 'Desejável'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Por que importa:</strong> {req.whyItMatters}
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-800">Como resolver:</div>
                  <p>{req.practicalGuidance}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <a
                    href={req.officialDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                  >
                    <span>{req.officialDocTitle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{req.resolutionTimeEstimate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA de Conversão para Serviço Pago */}
      <div className="p-8 bg-slate-900 text-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            Consultoria Técnica Especializada & Implementação Hands-On
          </span>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Deseja que nossa engenharia execute este plano para sua empresa?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Eliminamos os gargalos de aprovação na Meta, configuramos webhooks resilientes, tokens de System User e integramos sua operação com <strong>Twilio, n8n, Botpress e Chatwoot</strong>.
          </p>
        </div>

        <button
          onClick={onNavigateToQuote}
          className="shrink-0 px-6 py-3 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Solicitar Proposta Comercial
        </button>
      </div>
    </div>
  );
};
