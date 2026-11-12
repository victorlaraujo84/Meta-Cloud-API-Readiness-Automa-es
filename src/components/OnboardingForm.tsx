import React, { useState } from 'react';
import { CompanyProfile, CurrentSolution, MonthlyVolume, PreviousMetaAttempt } from '../types';
import { AlertTriangle, Building2, CheckCircle2, Globe, Mail, ShieldAlert, Sparkles } from 'lucide-react';

interface OnboardingFormProps {
  initialProfile?: CompanyProfile | null;
  onSubmit: (profile: CompanyProfile) => void;
  onCancel?: () => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  initialProfile,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    name: initialProfile?.name || '',
    tradeName: initialProfile?.tradeName || '',
    cnpj: initialProfile?.cnpj || '',
    corporateEmail: initialProfile?.corporateEmail || '',
    websiteUrl: initialProfile?.websiteUrl || '',
    segment: initialProfile?.segment || 'Serviços & SaaS',
    monthlyMessageVolume: initialProfile?.monthlyMessageVolume || '1k_10k',
    currentSolution: initialProfile?.currentSolution || 'none',
    previousMetaAttempt: initialProfile?.previousMetaAttempt || 'never',
    hasDedicatedNumber: initialProfile?.hasDedicatedNumber ?? true,
    contactPerson: initialProfile?.contactPerson || '',
    contactPhone: initialProfile?.contactPhone || '',
    notes: initialProfile?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Razão Social é obrigatória';
    if (!formData.cnpj?.trim()) newErrors.cnpj = 'CNPJ é obrigatório para validação Meta';
    if (!formData.corporateEmail?.trim()) {
      newErrors.corporateEmail = 'E-mail corporativo é obrigatório';
    } else if (
      formData.corporateEmail.includes('@gmail') ||
      formData.corporateEmail.includes('@hotmail') ||
      formData.corporateEmail.includes('@yahoo') ||
      formData.corporateEmail.includes('@outlook')
    ) {
      newErrors.corporateEmail = 'A Meta exige domínio corporativo próprio (@suaempresa.com.br). E-mails genéricos são reprovados.';
    }
    if (!formData.websiteUrl?.trim()) newErrors.websiteUrl = 'Website com HTTPS é obrigatório para validação';
    if (!formData.contactPerson?.trim()) newErrors.contactPerson = 'Nome do responsável é obrigatório';
    if (!formData.contactPhone?.trim()) newErrors.contactPhone = 'Telefone/WhatsApp de contato é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fullProfile: CompanyProfile = {
      id: initialProfile?.id || `comp_${Date.now()}`,
      name: formData.name!,
      tradeName: formData.tradeName || formData.name!,
      cnpj: formData.cnpj!,
      corporateEmail: formData.corporateEmail!,
      websiteUrl: formData.websiteUrl!,
      segment: formData.segment || 'Geral',
      monthlyMessageVolume: formData.monthlyMessageVolume as MonthlyVolume,
      currentSolution: formData.currentSolution as CurrentSolution,
      previousMetaAttempt: formData.previousMetaAttempt as PreviousMetaAttempt,
      hasDedicatedNumber: !!formData.hasDedicatedNumber,
      contactPerson: formData.contactPerson!,
      contactPhone: formData.contactPhone!,
      notes: formData.notes || ''
    };

    onSubmit(fullProfile);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner informativo */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>Perfil Corporativo & Diagnóstico Preliminar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Auditoria de Elegibilidade WhatsApp Cloud API
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Cadastre os dados cadastrais da sua empresa para verificar a conformidade com as diretrizes do Meta Business Suite e mapear previamente qualquer risco de recusa ou banimento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Alerta de Risco Baileys se selecionado */}
          {formData.currentSolution === 'unofficial_baileys' && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold block text-sm mb-1 text-amber-950">
                  Alerta Técnico Crítico: Uso de API Não Oficial (Baileys / Evolution)
                </span>
                Sua empresa corre risco de bloqueio definitivo da linha telefônica a qualquer momento. A Meta identifica assinaturas de conexão reversa. O diagnóstico estruturará seu plano de migração para a API oficial sem perda do histórico de clientes.
              </div>
            </div>
          )}

          {/* Grupo 1: Dados Cadastrais */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>01. Identificação Jurídica & Presença Digital</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Razão Social (idêntica ao cartão CNPJ) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Minha Empresa Tecnologia Ltda"
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Fantasia (Marca do WhatsApp)
                </label>
                <input
                  type="text"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  placeholder="Ex: Minha Empresa Pay"
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                />
                {errors.cnpj && <p className="text-rose-600 text-xs mt-1">{errors.cnpj}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Segmento de Atuação
                </label>
                <select
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="Serviços & SaaS">Serviços & SaaS / Software</option>
                  <option value="E-commerce & Varejo">E-commerce & Varejo</option>
                  <option value="Educação & Cursos">Educação & EdTech</option>
                  <option value="Saúde & Clínicas">Saúde, Clínicas & Bem-estar</option>
                  <option value="Finanças & FinTech">Finanças, Contabilidade & FinTech</option>
                  <option value="Imobiliário & Construção">Imobiliário & Construção</option>
                  <option value="Indústria & Logística">Indústria & Logística</option>
                  <option value="Outro">Outro segmento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>E-mail Corporativo (com domínio próprio) *</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.corporateEmail}
                    onChange={(e) => setFormData({ ...formData, corporateEmail: e.target.value })}
                    placeholder="contato@suaempresa.com.br"
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                {errors.corporateEmail ? (
                  <p className="text-rose-600 text-xs mt-1">{errors.corporateEmail}</p>
                ) : (
                  <p className="text-slate-500 text-[11px] mt-1">
                    Não utilize @gmail ou @hotmail. A Meta exige domínio corporativo.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website Oficial (com HTTPS) *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://suaempresa.com.br"
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                {errors.websiteUrl && <p className="text-rose-600 text-xs mt-1">{errors.websiteUrl}</p>}
              </div>
            </div>
          </div>

          {/* Grupo 2: Cenário Operacional & WhatsApp Atual */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100">
              <span>02. Cenário Operacional & Automação Atual</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Solução Atual de WhatsApp na Empresa
                </label>
                <select
                  value={formData.currentSolution}
                  onChange={(e) => setFormData({ ...formData, currentSolution: e.target.value as CurrentSolution })}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="none">Apenas atendimento manual em celular</option>
                  <option value="whatsapp_business_app">WhatsApp Business App tradicional no aparelho</option>
                  <option value="unofficial_baileys">API Não Oficial (Baileys / Evolution API / Z-API / Venom)</option>
                  <option value="official_waba">Já possui WhatsApp Cloud API Oficial homologada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Histórico de Tentativa no Meta Business
                </label>
                <select
                  value={formData.previousMetaAttempt}
                  onChange={(e) => setFormData({ ...formData, previousMetaAttempt: e.target.value as PreviousMetaAttempt })}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="never">Nunca tentamos verificar a empresa na Meta</option>
                  <option value="approved">Empresa já verificada com sucesso</option>
                  <option value="rejected">Tentamos e foi REJEITADA pela Meta</option>
                  <option value="pending">Solicitação em análise pendente na Meta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Volume Mensal Estimado de Mensagens
                </label>
                <select
                  value={formData.monthlyMessageVolume}
                  onChange={(e) => setFormData({ ...formData, monthlyMessageVolume: e.target.value as MonthlyVolume })}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white font-mono text-xs"
                >
                  <option value="under_1k">Até 1.000 mensagens/mês (Tier Inicial)</option>
                  <option value="1k_10k">1.000 a 10.000 mensagens/mês (Operação Pequena)</option>
                  <option value="10k_50k">10.000 a 50.000 mensagens/mês (Escala Média)</option>
                  <option value="50k_100k">50.000 a 100.000 mensagens/mês (Alta Demanda)</option>
                  <option value="over_100k">Mais de 100.000 mensagens/mês (Enterprise)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disponibilidade de Linha Telefônica Dedicada
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="dedicatedNumber"
                      checked={formData.hasDedicatedNumber === true}
                      onChange={() => setFormData({ ...formData, hasDedicatedNumber: true })}
                      className="text-emerald-600 focus:ring-emerald-500 mr-2"
                    />
                    <span>Sim, linha exclusiva e capaz de receber SMS/Voz</span>
                  </label>
                  <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="dedicatedNumber"
                      checked={formData.hasDedicatedNumber === false}
                      onChange={() => setFormData({ ...formData, hasDedicatedNumber: false })}
                      className="text-emerald-600 focus:ring-emerald-500 mr-2"
                    />
                    <span>Não, ainda precisamos adquirir</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Grupo 3: Responsável pelo Projeto */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100">
              <span>03. Responsável Técnico ou de Negócios</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Seu nome ou do líder do projeto"
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.contactPerson && <p className="text-rose-600 text-xs mt-1">{errors.contactPerson}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                />
                {errors.contactPhone && <p className="text-rose-600 text-xs mt-1">{errors.contactPhone}</p>}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Iniciar Auditoria de Requisitos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
