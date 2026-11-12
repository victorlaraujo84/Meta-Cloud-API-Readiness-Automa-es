import React from 'react';
import { DiagnosticResult } from '../types';
import { getStatusBadgeData } from '../utils/scoreEngine';
import {
  Calendar,
  Clock,
  Trash2,
  Eye,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface HistoryViewProps {
  diagnostics: DiagnosticResult[];
  onSelectDiagnostic: (diag: DiagnosticResult) => void;
  onDeleteDiagnostic: (id: string) => void;
  onNewDiagnostic: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  diagnostics,
  onSelectDiagnostic,
  onDeleteDiagnostic,
  onNewDiagnostic
}) => {
  if (diagnostics.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 text-center">
        <div className="bg-white rounded-xl border border-slate-200 p-12 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Nenhum Diagnóstico Armazenado
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Realize sua primeira avaliação técnica para salvar o histórico e acompanhar a evolução da prontidão da sua empresa.
          </p>
          <div className="pt-2">
            <button
              onClick={onNewDiagnostic}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Iniciar Novo Diagnóstico</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Auditorias Salvas no Backend</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Histórico & Evolução de Conformidade
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Acompanhe o progresso de saneamento das lacunas obrigatórias da Meta ao longo do tempo.
          </p>
        </div>

        <button
          onClick={onNewDiagnostic}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Auditoria</span>
        </button>
      </div>

      {/* Grid de Auditorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diagnostics.map((diag) => {
          const badge = getStatusBadgeData(diag.classification);
          const dateStr = new Date(diag.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={diag.id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {diag.companyProfile.name}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${badge.colorClass}`}>
                    {diag.score}/100
                  </span>
                </div>

                <div>
                  <div className="text-xs font-mono text-slate-500">
                    CNPJ: {diag.companyProfile.cnpj}
                  </div>
                  <div className="text-xs font-medium text-slate-700 mt-1">
                    {badge.label}
                  </div>
                </div>

                {/* Avisos */}
                {diag.hasBlockingIssues ? (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>{diag.blockingIssues.length} bloqueios mandatórios</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Nenhum bloqueio obrigatório</span>
                  </div>
                )}
              </div>

              {/* Ações e Data */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  {dateStr}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDeleteDiagnostic(diag.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Excluir diagnóstico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectDiagnostic(diag)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
