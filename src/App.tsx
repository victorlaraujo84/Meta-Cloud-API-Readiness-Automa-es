import React, { useState, useEffect } from 'react';
import { CompanyProfile, DiagnosticResult, RequirementStatus } from './types';
import { META_REQUIREMENTS } from './data/metaRequirements';
import { calculateDiagnosticResult } from './utils/scoreEngine';
import { deleteDiagnostic, getDiagnostics, saveDiagnostic } from './services/api';
import { Header } from './components/Header';
import { OnboardingForm } from './components/OnboardingForm';
import { DiagnosticWizard } from './components/DiagnosticWizard';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ActionPlanView } from './components/ActionPlanView';
import { FunnelQuoteModal } from './components/FunnelQuoteModal';
import { ConsultingChatWidget } from './components/ConsultingChatWidget';
import { HistoryView } from './components/HistoryView';
import { AlertCircle, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';

const DEFAULT_PROFILE: CompanyProfile = {
  id: 'comp_demo_initial',
  name: 'Nexus Logística & Comércio Ltda',
  tradeName: 'Nexus Express',
  cnpj: '12.345.678/0001-90',
  corporateEmail: 'operacoes@nexusexpress.com.br',
  websiteUrl: 'https://nexusexpress.com.br',
  segment: 'Indústria & Logística',
  monthlyMessageVolume: '10k_50k',
  currentSolution: 'whatsapp_business_app',
  previousMetaAttempt: 'never',
  hasDedicatedNumber: true,
  contactPerson: 'Victor Araújo',
  contactPhone: '(11) 98765-4321',
  notes: 'Empresa busca automatizar rastreamento e notificações de entrega via WhatsApp oficial.'
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentProfile, setCurrentProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [answers, setAnswers] = useState<Record<string, RequirementStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [currentDiagnostic, setCurrentDiagnostic] = useState<DiagnosticResult | null>(null);
  const [diagnosticsHistory, setDiagnosticsHistory] = useState<DiagnosticResult[]>([]);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Inicializa respostas padrão se estiver vazio
  const initializeDefaultAnswers = (profile: CompanyProfile) => {
    const initialAnswers: Record<string, RequirementStatus> = {};
    for (const req of META_REQUIREMENTS) {
      if (req.id === 'req_legal_cnpj' || req.id === 'req_legal_corp_email' || req.id === 'req_legal_website') {
        initialAnswers[req.id] = 'compliant';
      } else if (req.id === 'req_tech_clean_number') {
        initialAnswers[req.id] = profile.hasDedicatedNumber ? 'compliant' : 'in_progress';
      } else if (req.id === 'req_tech_webhook_https' || req.id === 'req_tech_system_user_token') {
        initialAnswers[req.id] = 'in_progress';
      } else {
        initialAnswers[req.id] = 'in_progress';
      }
    }
    return initialAnswers;
  };

  // Carrega histórico do backend
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const history = await getDiagnostics();
        setDiagnosticsHistory(history);

        if (history.length > 0) {
          const latest = history[0];
          setCurrentDiagnostic(latest);
          setCurrentProfile(latest.companyProfile);
          setAnswers(latest.answers);
          setNotes(latest.notes || {});
        } else {
          // Criar diagnóstico inicial pré-calculado com o DEFAULT_PROFILE
          const initialAnswers = initializeDefaultAnswers(DEFAULT_PROFILE);
          const initialDiag = calculateDiagnosticResult(DEFAULT_PROFILE, initialAnswers, {});
          setCurrentDiagnostic(initialDiag);
          setAnswers(initialAnswers);
          // Persistir no backend
          saveDiagnostic({
            companyProfile: DEFAULT_PROFILE,
            answers: initialAnswers,
            notes: {},
            id: initialDiag.id
          }).catch(console.error);
        }
      } catch (err) {
        console.error('Erro ao conectar ao backend:', err);
        // Fallback local
        const initialAnswers = initializeDefaultAnswers(DEFAULT_PROFILE);
        const initialDiag = calculateDiagnosticResult(DEFAULT_PROFILE, initialAnswers, {});
        setCurrentDiagnostic(initialDiag);
        setAnswers(initialAnswers);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Recalcular diagnóstico sempre que respostas mudam
  const handleAnswerChange = (reqId: string, status: RequirementStatus) => {
    const newAnswers = { ...answers, [reqId]: status };
    setAnswers(newAnswers);

    if (currentProfile) {
      const updatedDiag = calculateDiagnosticResult(
        currentProfile,
        newAnswers,
        notes,
        currentDiagnostic?.id
      );
      setCurrentDiagnostic(updatedDiag);
    }
  };

  const handleNoteChange = (reqId: string, noteText: string) => {
    const newNotes = { ...notes, [reqId]: noteText };
    setNotes(newNotes);
    if (currentDiagnostic) {
      setCurrentDiagnostic({ ...currentDiagnostic, notes: newNotes });
    }
  };

  const handleSaveProgress = async () => {
    if (!currentProfile || !currentDiagnostic) return;
    setIsSaving(true);
    try {
      const saved = await saveDiagnostic({
        companyProfile: currentProfile,
        answers,
        notes,
        id: currentDiagnostic.id
      });
      setCurrentDiagnostic(saved);
      showToast('Auditoria salva com sucesso no banco de dados!');

      // Atualiza histórico
      const history = await getDiagnostics();
      setDiagnosticsHistory(history);
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar no banco');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOnboardingSubmit = async (newProfile: CompanyProfile) => {
    setCurrentProfile(newProfile);
    setShowOnboarding(false);

    const initialAnswers = initializeDefaultAnswers(newProfile);
    setAnswers(initialAnswers);
    setNotes({});

    const newDiag = calculateDiagnosticResult(newProfile, initialAnswers, {});
    setCurrentDiagnostic(newDiag);

    try {
      await saveDiagnostic({
        companyProfile: newProfile,
        answers: initialAnswers,
        notes: {},
        id: newDiag.id
      });
      const history = await getDiagnostics();
      setDiagnosticsHistory(history);
      showToast('Empresa cadastrada! Auditoria iniciada.');
      setCurrentTab('wizard');
    } catch (err) {
      console.error(err);
      setCurrentTab('wizard');
    }
  };

  const handleSelectHistoryDiagnostic = (diag: DiagnosticResult) => {
    setCurrentDiagnostic(diag);
    setCurrentProfile(diag.companyProfile);
    setAnswers(diag.answers);
    setNotes(diag.notes || {});
    setCurrentTab('dashboard');
    showToast(`Diagnóstico de ${diag.companyProfile.name} carregado.`);
  };

  const handleDeleteDiagnostic = async (id: string) => {
    if (!confirm('Deseja realmente excluir este diagnóstico do histórico?')) return;
    try {
      await deleteDiagnostic(id);
      const updated = diagnosticsHistory.filter((d) => d.id !== id);
      setDiagnosticsHistory(updated);
      showToast('Diagnóstico removido.');
      if (currentDiagnostic?.id === id) {
        if (updated.length > 0) {
          handleSelectHistoryDiagnostic(updated[0]);
        } else {
          setShowOnboarding(true);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir diagnóstico.');
    }
  };

  const handleExportReport = () => {
    setCurrentTab('action_plan');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-800">
            Carregando ecossistema de validação Meta Cloud API...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar Contract (1 linha, 3 zonas) */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setShowOnboarding(false);
          setCurrentTab(tab);
        }}
        onNewDiagnostic={() => setShowOnboarding(true)}
        onExportReport={currentDiagnostic ? handleExportReport : undefined}
        hasActiveDiagnostic={!!currentDiagnostic}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 pb-16">
        {showOnboarding ? (
          <OnboardingForm
            initialProfile={currentProfile}
            onSubmit={handleOnboardingSubmit}
            onCancel={currentDiagnostic ? () => setShowOnboarding(false) : undefined}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && currentDiagnostic && (
              <ScoreDashboard
                diagnostic={currentDiagnostic}
                history={diagnosticsHistory}
                onNavigateToWizard={() => setCurrentTab('wizard')}
                onNavigateToActionPlan={() => setCurrentTab('action_plan')}
                onNavigateToQuote={() => setCurrentTab('automation_quote')}
                onNavigateToChat={() => setCurrentTab('consulting_chat')}
              />
            )}

            {currentTab === 'wizard' && currentProfile && (
              <DiagnosticWizard
                profile={currentProfile}
                answers={answers}
                notes={notes}
                onAnswerChange={handleAnswerChange}
                onNoteChange={handleNoteChange}
                onComplete={() => {
                  handleSaveProgress();
                  setCurrentTab('dashboard');
                }}
                onSaveProgress={handleSaveProgress}
                isSaving={isSaving}
              />
            )}

            {currentTab === 'action_plan' && currentDiagnostic && (
              <ActionPlanView
                diagnostic={currentDiagnostic}
                onNavigateToQuote={() => setCurrentTab('automation_quote')}
                onNavigateToWizard={() => setCurrentTab('wizard')}
              />
            )}

            {currentTab === 'automation_quote' && (
              <FunnelQuoteModal
                diagnostic={currentDiagnostic}
                onSuccess={() => {
                  showToast('Proposta comercial enviada com sucesso!');
                }}
              />
            )}

            {currentTab === 'consulting_chat' && (
              <ConsultingChatWidget
                profile={currentProfile}
                currentScore={currentDiagnostic?.score}
                onNavigateToQuote={() => setCurrentTab('automation_quote')}
                onNavigateToWizard={() => setCurrentTab('wizard')}
              />
            )}

            {currentTab === 'history' && (
              <HistoryView
                diagnostics={diagnosticsHistory}
                onSelectDiagnostic={handleSelectHistoryDiagnostic}
                onDeleteDiagnostic={handleDeleteDiagnostic}
                onNewDiagnostic={() => setShowOnboarding(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Rodapé Corporativo e Transparência de Políticas */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-semibold text-slate-800 flex items-center justify-center md:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Meta WhatsApp Cloud API Readiness & Automações</span>
            </div>
            <p>
              Plataforma independente de consultoria técnica e conformidade de diretrizes oficiais do Meta Business Suite.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600">
            <a
              href="https://developers.facebook.com/docs/whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            >
              <span>Meta Developers WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="https://www.facebook.com/policies_center/commerce"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            >
              <span>Políticas de Comércio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentTab('consulting_chat')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Suporte Técnico
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
