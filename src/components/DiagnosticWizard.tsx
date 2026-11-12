import React, { useState } from 'react';
import { CompanyProfile, Criticality, Requirement, RequirementCategory, RequirementStatus } from '../types';
import { META_REQUIREMENTS, REQUIREMENT_CATEGORIES } from '../data/metaRequirements';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Filter,
  ArrowRight,
  ShieldAlert,
  Save
} from 'lucide-react';

interface DiagnosticWizardProps {
  profile: CompanyProfile;
  answers: Record<string, RequirementStatus>;
  notes: Record<string, string>;
  onAnswerChange: (reqId: string, status: RequirementStatus) => void;
  onNoteChange: (reqId: string, note: string) => void;
  onComplete: () => void;
  onSaveProgress: () => void;
  isSaving?: boolean;
}

export const DiagnosticWizard: React.FC<DiagnosticWizardProps> = ({
  profile,
  answers,
  notes,
  onAnswerChange,
  onNoteChange,
  onComplete,
  onSaveProgress,
  isSaving
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RequirementCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unmet' | 'mandatory'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtragem dos requisitos
  const filteredRequirements = META_REQUIREMENTS.filter((req) => {
    if (selectedCategory !== 'all' && req.category !== selectedCategory) {
      return false;
    }
    const currentStatus = answers[req.id] || 'non_compliant';
    if (filterStatus === 'unmet') {
      return currentStatus === 'non_compliant' || currentStatus === 'in_progress';
    }
    if (filterStatus === 'mandatory') {
      return req.criticality === 'mandatory';
    }
    return true;
  });

  // Contadores
  const totalReqs = META_REQUIREMENTS.length;
  const answeredCount = Object.keys(answers).length;
  const compliantCount = Object.values(answers).filter((s) => s === 'compliant').length;
  const progressPercent = Math.round((answeredCount / totalReqs) * 100);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCriticalityBadge = (crit: Criticality) => {
    switch (crit) {
      case 'mandatory':
        return (
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Mandatório (Bloqueante)
          </span>
        );
      case 'recommended':
        return (
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Recomendado
          </span>
        );
      case 'desirable':
        return (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Desejável
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner de Contexto da Empresa e Progresso */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Diagnóstico Ativo</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-900">{profile.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-600">CNPJ: {profile.cnpj}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Auditoria de Requisitos Oficiais da Meta
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Avalie cada critério oficial para emissão do score de conformidade e liberação do plano de ação.
          </p>
        </div>

        {/* Resumo de Respostas e Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 min-w-[180px]">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Progresso da Auditoria</span>
              <span className="font-mono font-bold text-slate-900">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-mono">
              <span>{compliantCount} conformes</span>
              <span>{totalReqs} requisitos</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSaveProgress}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Salvar no banco"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>

            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Ver Score & Relatório</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegação por Categoria e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Abas de Categoria */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Todos ({META_REQUIREMENTS.length})
          </button>
          {Object.entries(REQUIREMENT_CATEGORIES).map(([catKey, catVal]) => {
            const count = META_REQUIREMENTS.filter((r) => r.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey as RequirementCategory)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === catKey
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {catVal.label.split('. ')[1]} ({count})
              </button>
            );
          })}
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtro:</span>
          </span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('unmet')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              filterStatus === 'unmet'
                ? 'bg-rose-100 text-rose-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilterStatus('mandatory')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              filterStatus === 'mandatory'
                ? 'bg-amber-100 text-amber-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Obrigatórios
          </button>
        </div>
      </div>

      {/* Lista de Requisitos */}
      <div className="space-y-4">
        {filteredRequirements.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">Nenhum requisito corresponde ao filtro selecionado.</p>
          </div>
        ) : (
          filteredRequirements.map((req) => {
            const currentStatus: RequirementStatus = answers[req.id] || 'non_compliant';
            const isExpanded = expandedId === req.id;
            const currentNote = notes[req.id] || '';

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 transition-all hover:border-slate-300 overflow-hidden"
              >
                {/* Linha Principal do Requisito */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCriticalityBadge(req.criticality)}
                      <span className="text-xs text-slate-500 font-mono">
                        Peso: {req.weight}/5
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {REQUIREMENT_CATEGORIES[req.category].label.split('. ')[1]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {req.title}
                      </h3>

                      {/* Tooltip Informativa de Importância */}
                      <div className="relative group inline-flex items-center">
                        <button
                          type="button"
                          aria-label={`Ver importância do requisito: ${req.title}`}
                          className="text-slate-400 hover:text-emerald-700 transition-colors p-0.5 rounded cursor-help focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                        {/* Balão da Tooltip */}
                        <div
                          role="tooltip"
                          className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 absolute left-0 bottom-full mb-2 z-30 w-72 sm:w-80 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700"
                        >
                          <div className="font-semibold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Importância na Meta Cloud API</span>
                          </div>
                          <p className="text-slate-200 text-[11px] leading-relaxed">
                            {req.whyItMatters}
                          </p>
                          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                            <span>Criticidade: {req.criticality === 'mandatory' ? 'Bloqueante' : req.criticality === 'recommended' ? 'Recomendada' : 'Desejável'}</span>
                            <span>Tempo: {req.resolutionTimeEstimate}</span>
                          </div>
                          <div className="absolute left-3 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {req.question}
                    </p>

                    {/* Link Oficial da Meta Obrigatório */}
                    <div className="pt-1 flex items-center gap-3">
                      <a
                        href={req.officialDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors group"
                      >
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>Ver documentação oficial: {req.officialDocTitle}</span>
                      </a>
                    </div>
                  </div>

                  {/* Seletor de Status (Controle Interativo) */}
                  <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => onAnswerChange(req.id, 'compliant')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                          currentStatus === 'compliant'
                            ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        Atendido
                      </button>

                      <button
                        type="button"
                        onClick={() => onAnswerChange(req.id, 'in_progress')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                          currentStatus === 'in_progress'
                            ? 'bg-amber-500 text-white shadow-xs font-semibold'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        Em Ajuste
                      </button>

                      <button
                        type="button"
                        onClick={() => onAnswerChange(req.id, 'non_compliant')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                          currentStatus === 'non_compliant'
                            ? 'bg-rose-600 text-white shadow-xs font-semibold'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        Pendente
                      </button>

                      <button
                        type="button"
                        onClick={() => onAnswerChange(req.id, 'not_applicable')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                          currentStatus === 'not_applicable'
                            ? 'bg-slate-700 text-white shadow-xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        N/A
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(req.id)}
                      className="inline-flex items-center justify-center p-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title={isExpanded ? 'Recolher detalhes técnicos' : 'Expandir orientações técnicas'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bloco Expansível de Orientação Prática & Auditoria */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 p-5 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Por que importa */}
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                          <AlertCircle className="w-4 h-4 text-emerald-600" />
                          <span>Por que a Meta exige este item?</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {req.whyItMatters}
                        </p>
                      </div>

                      {/* Como resolver */}
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Passo a Passo de Resolução</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {req.practicalGuidance}
                        </p>
                      </div>
                    </div>

                    {/* Armadilhas e Tempo estimado */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                      {req.commonPitfalls && (
                        <div className="flex items-center gap-1.5 text-rose-700">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>
                            <strong>Armadilha Comum:</strong> {req.commonPitfalls}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 shrink-0 font-mono text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resolução: {req.resolutionTimeEstimate}</span>
                      </div>
                    </div>

                    {/* Campo de Anotações Internas do Usuário */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Anotações da sua Auditoria Interna (Ex: número do protocolo, link de documento, responsável):
                      </label>
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) => onNoteChange(req.id, e.target.value)}
                        placeholder="Ex: Cartão CNPJ baixado em 16/10, aguardando alteração do e-mail no Business Manager..."
                        className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Barra Inferior de Finalização */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold text-slate-900 block">
            Pronto para ver o diagnóstico completo?
          </span>
          <span className="text-xs text-slate-500">
            O motor de pontuação calculará o score ponderado e identificará as lacunas bloqueantes da sua conta.
          </span>
        </div>

        <button
          onClick={onComplete}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <span>Gerar Score & Plano de Ação</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
