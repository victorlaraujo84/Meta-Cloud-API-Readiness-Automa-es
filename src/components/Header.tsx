import React from 'react';
import { ShieldCheck, Plus, Download } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNewDiagnostic: () => void;
  onExportReport?: () => void;
  hasActiveDiagnostic: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onNewDiagnostic,
  onExportReport,
  hasActiveDiagnostic
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-left group cursor-pointer"
            >
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                Meta Cloud API Readiness
              </span>
            </button>
          </div>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'dashboard'
                  ? 'text-emerald-700 border-emerald-600 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Dashboard & Score
            </button>
            <button
              onClick={() => onSelectTab('wizard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'wizard'
                  ? 'text-emerald-700 border-emerald-600 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Checklist de Requisitos
            </button>
            <button
              onClick={() => onSelectTab('action_plan')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'action_plan'
                  ? 'text-emerald-700 border-emerald-600 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Plano de Ação
            </button>
            <button
              onClick={() => onSelectTab('automation_quote')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'automation_quote'
                  ? 'text-emerald-700 border-emerald-600 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Orçamento de Automação
            </button>
            <button
              onClick={() => onSelectTab('consulting_chat')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'consulting_chat'
                  ? 'text-emerald-700 border-emerald-600 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Consultoria Especializada
            </button>
            <button
              onClick={() => onSelectTab('history')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'history'
                  ? 'text-emerald-700 border-emerald-600 font-semibold'
                  : 'border-transparent'
              }`}
            >
              Histórico
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {hasActiveDiagnostic && onExportReport && (
              <button
                onClick={onExportReport}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Exportar Relatório"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            )}

            <button
              onClick={onNewDiagnostic}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Diagnóstico</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
