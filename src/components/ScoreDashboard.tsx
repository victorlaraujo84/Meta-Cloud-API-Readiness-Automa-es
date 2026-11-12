import React from 'react';
import { DiagnosticResult } from '../types';
import { getStatusBadgeData } from '../utils/scoreEngine';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Zap,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

interface ScoreDashboardProps {
  diagnostic: DiagnosticResult;
  history?: DiagnosticResult[];
  onNavigateToWizard: () => void;
  onNavigateToActionPlan: () => void;
  onNavigateToQuote: () => void;
  onNavigateToChat: () => void;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
  diagnostic,
  history,
  onNavigateToWizard,
  onNavigateToActionPlan,
  onNavigateToQuote,
  onNavigateToChat
}) => {
  const badgeInfo = getStatusBadgeData(diagnostic.classification);
  const isUnofficialUser = diagnostic.companyProfile.currentSolution === 'unofficial_baileys';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Alerta Crítico de Risco: Baileys / APIs Não Oficiais */}
      {isUnofficialUser && (
        <div className="bg-rose-900 text-white rounded-xl p-6 border border-rose-800 shadow-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-800 rounded-lg shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-200" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-rose-300">
                  Risco Operacional Severo Detectado
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-xs text-rose-200">Uso de Engenharia Reversa (Baileys/Evolution)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Seu número corre risco iminente de banimento permanente pela Meta
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed max-w-3xl">
                O uso de bibliotecas não oficiais viola os Termos de Serviço da Meta. A perda da linha é definitiva e irrecuperável. Recomendamos iniciar o plano de migração para a WhatsApp Cloud API oficial imediatamente.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={onNavigateToActionPlan}
                  className="px-4 py-2 text-xs font-semibold text-rose-950 bg-white hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Ver Plano de Migração Segura
                </button>
                <button
                  onClick={onNavigateToQuote}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-800 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
                >
                  Solicitar Arquitetura Oficial com Twilio/n8n
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero do Score & Resumo Executivo */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Coluna do Medidor de Score */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Índice de Prontidão Meta
            </span>

            <div className="relative flex items-center justify-center my-3">
              <div className="w-36 h-36 rounded-full border-8 border-slate-200 flex items-center justify-center relative">
                <div
                  className={`text-4xl font-extrabold tracking-tight font-mono ${
                    diagnostic.score >= 70
                      ? 'text-emerald-600'
                      : diagnostic.score >= 40
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {diagnostic.score}
                </div>
                <span className="absolute bottom-6 text-[11px] font-semibold text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${badgeInfo.colorClass}`}>
                {badgeInfo.label}
              </span>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {badgeInfo.description}
              </p>
            </div>
          </div>

          {/* Coluna de Diagnóstico Detalhado */}
          <div className="lg:col-span-8 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>Relatório Executivo</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-800">{diagnostic.companyProfile.name}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-600">CNPJ: {diagnostic.companyProfile.cnpj}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Diagnóstico de Conformidade WhatsApp Cloud API
              </h2>
            </div>

            {/* Aviso de Travamento por Requisito Mandatório */}
            {diagnostic.hasBlockingIssues && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Atenção: Existem requisitos mandatórios pendentes ({diagnostic.blockingIssues.length})</span>
                </div>
                <p>
                  Mesmo com pontuação global calculada, a Meta bloqueia a homologação caso qualquer pré-requisito mandatório (como CNPJ regular, domínio corporativo ou webhook HTTPS) não seja atendido.
                </p>
              </div>
            )}

            {/* Próximo Passo Único de Maior Impacto */}
            {diagnostic.singleNextHighImpactStep && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-emerald-700" />
                    <span>Próximo Passo de Maior Impacto Recomendado</span>
                  </div>
                  <a
                    href={diagnostic.singleNextHighImpactStep.officialDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    <span>Guia Meta</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-sm font-bold text-emerald-950">
                  {diagnostic.singleNextHighImpactStep.title}
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {diagnostic.singleNextHighImpactStep.practicalGuidance}
                </p>
              </div>
            )}

            {/* Botões de Ação Imediata */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onNavigateToActionPlan}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>Acessar Plano de Ação Priorizado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNavigateToQuote}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Solicitar Orçamento de Automação (Twilio/n8n)</span>
              </button>

              <button
                onClick={onNavigateToWizard}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span>Revisar Checklist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lacunas Bloqueantes no Topo se houver */}
      {diagnostic.blockingIssues.length > 0 && (
        <div className="bg-white rounded-xl border border-rose-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Lacunas Bloqueantes Identificadas ({diagnostic.blockingIssues.length})
              </h3>
            </div>
            <span className="text-xs text-rose-600 font-semibold">
              Corrigir antes de submeter à Meta
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnostic.blockingIssues.map((issue) => (
              <div key={issue.id} className="p-4 rounded-lg bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="text-sm font-bold text-slate-900">
                  {issue.title}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {issue.whyItMatters}
                </p>
                <div className="pt-1">
                  <a
                    href={issue.officialDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline"
                  >
                    <span>{issue.officialDocTitle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maturidade por Categoria */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Maturidade por Categoria de Requisitos
            </h3>
            <p className="text-xs text-slate-500">
              Análise percentual ponderada por complexidade e criticidade
            </p>
          </div>
          <button
            onClick={onNavigateToWizard}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Editar Respostas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(diagnostic.categoryScores).map(([catKey, catVal]) => {
            return (
              <div
                key={catKey}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {catVal.categoryLabel.split('. ')[1]}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-900">
                    {catVal.percentage}%
                  </span>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      catVal.percentage >= 80
                        ? 'bg-emerald-600'
                        : catVal.percentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${catVal.percentage}%` }}
                  />
                </div>

                {/* Métricas Tabulares */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono">
                  <span>Conformes: {catVal.compliantCount}/{catVal.totalCount}</span>
                  <span>Pendentes: {catVal.nonCompliantCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de Pontuação de Conformidade (Recharts BarChart) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Histórico de Pontuação de Conformidade das Auditorias
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evolução do score (0 a 100) ao longo das rodadas de avaliação da empresa
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block"></span>
              <span>≥ 70 Pronto/Avançado</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
              <span>40-69 Em Ajuste</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600 inline-block"></span>
              <span>&lt; 40 Crítico</span>
            </span>
          </div>
        </div>

        {/* Gráfico Recharts */}
        <div className="h-64 w-full pt-2">
          {(() => {
            // Prepara lista ordenada cronologicamente (da mais antiga para a mais recente)
            const rawList = history && history.length > 0 ? [...history] : [diagnostic];
            // Se o diagnóstico atual não estiver na lista, adiciona
            if (!rawList.some((d) => d.id === diagnostic.id)) {
              rawList.push(diagnostic);
            }
            // Ordena cronologicamente
            rawList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            // Limita a até os últimos 10 para visualização limpa
            const recentHistory = rawList.slice(-10);

            const chartData = recentHistory.map((item, index) => {
              const dateObj = new Date(item.createdAt);
              const label = `${dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
              const isCurrent = item.id === diagnostic.id;

              return {
                id: item.id,
                name: label,
                shortLabel: `Auditoria #${index + 1}`,
                score: item.score,
                isCurrent,
                company: item.companyProfile?.tradeName || item.companyProfile?.name || 'Empresa',
                status: item.classification === 'advanced' ? 'Avançado' : item.classification === 'ready' ? 'Pronto' : item.classification === 'in_progress' ? 'Em Preparação' : 'Crítico'
              };
            });

            const getBarColor = (score: number) => {
              if (score >= 90) return '#059669'; // emerald-600
              if (score >= 70) return '#0d9488'; // teal-600
              if (score >= 40) return '#d97706'; // amber-600
              return '#dc2626'; // rose-600
            };

            return (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 16, left: -20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <ReferenceLine y={70} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Meta de Prontidão (70)', fill: '#059669', fontSize: 11, position: 'insideTopLeft' }} />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1 border border-slate-800">
                            <div className="font-bold text-slate-100 flex items-center justify-between gap-3">
                              <span>{data.shortLabel}</span>
                              <span className="font-mono text-emerald-400 font-bold">{data.score}/100</span>
                            </div>
                            <div className="text-slate-300 text-[11px] font-mono">Data: {data.name}</div>
                            <div className="text-slate-300 text-[11px]">Status: {data.status}</div>
                            {data.isCurrent && (
                              <div className="text-emerald-400 font-semibold text-[10px] mt-1 pt-1 border-t border-slate-800">
                                ★ Auditoria Selecionada no Momento
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.score)}
                        stroke={entry.isCurrent ? '#0f172a' : 'transparent'}
                        strokeWidth={entry.isCurrent ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </div>

      {/* Banner de Conversão para Serviços de Automação */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Passo 2: Transforme Conformidade em Máquina de Vendas</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Precisa de ajuda para homologar a Meta e estruturar suas automações?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Nossa equipe projeta e implementa arquiteturas robustas utilizando <strong>Twilio WhatsApp Platform</strong>, orquestração de filas com <strong>n8n</strong>, chatbots inteligentes com <strong>Botpress</strong> e suporte humano com <strong>Chatwoot</strong>.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={onNavigateToQuote}
            className="px-6 py-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors text-center cursor-pointer"
          >
            Solicitar Orçamento de Automação
          </button>
          <button
            onClick={onNavigateToChat}
            className="px-5 py-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-center border border-slate-700 cursor-pointer"
          >
            Falar com Especialista
          </button>
        </div>
      </div>
    </div>
  );
};
