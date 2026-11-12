import {
  CategoryScore,
  CompanyProfile,
  DiagnosticClassification,
  DiagnosticResult,
  Requirement,
  RequirementCategory,
  RequirementStatus
} from '../types';
import { META_REQUIREMENTS, REQUIREMENT_CATEGORIES } from '../data/metaRequirements';

export function calculateDiagnosticResult(
  profile: CompanyProfile,
  answers: Record<string, RequirementStatus>,
  notes: Record<string, string> = {},
  existingId?: string
): DiagnosticResult {
  const categoryScores: Record<RequirementCategory, CategoryScore> = {
    legal_corporate: {
      category: 'legal_corporate',
      categoryLabel: REQUIREMENT_CATEGORIES.legal_corporate.label,
      scoredWeight: 0,
      maxWeight: 0,
      percentage: 0,
      compliantCount: 0,
      inProgressCount: 0,
      nonCompliantCount: 0,
      totalCount: 0
    },
    cloud_api_tech: {
      category: 'cloud_api_tech',
      categoryLabel: REQUIREMENT_CATEGORIES.cloud_api_tech.label,
      scoredWeight: 0,
      maxWeight: 0,
      percentage: 0,
      compliantCount: 0,
      inProgressCount: 0,
      nonCompliantCount: 0,
      totalCount: 0
    },
    messaging_compliance: {
      category: 'messaging_compliance',
      categoryLabel: REQUIREMENT_CATEGORIES.messaging_compliance.label,
      scoredWeight: 0,
      maxWeight: 0,
      percentage: 0,
      compliantCount: 0,
      inProgressCount: 0,
      nonCompliantCount: 0,
      totalCount: 0
    },
    architecture_integration: {
      category: 'architecture_integration',
      categoryLabel: REQUIREMENT_CATEGORIES.architecture_integration.label,
      scoredWeight: 0,
      maxWeight: 0,
      percentage: 0,
      compliantCount: 0,
      inProgressCount: 0,
      nonCompliantCount: 0,
      totalCount: 0
    },
    governance: {
      category: 'governance',
      categoryLabel: REQUIREMENT_CATEGORIES.governance.label,
      scoredWeight: 0,
      maxWeight: 0,
      percentage: 0,
      compliantCount: 0,
      inProgressCount: 0,
      nonCompliantCount: 0,
      totalCount: 0
    }
  };

  let totalScoredWeight = 0;
  let totalMaxWeight = 0;
  const blockingIssues: DiagnosticResult['blockingIssues'] = [];
  let mandatoryGapsExist = false;

  const nonCompliantRequirements: Requirement[] = [];

  for (const req of META_REQUIREMENTS) {
    const status = answers[req.id] || 'non_compliant';
    const cat = categoryScores[req.category];

    if (status === 'not_applicable') {
      // Ignored from calculations
      continue;
    }

    cat.totalCount += 1;
    cat.maxWeight += req.weight;
    totalMaxWeight += req.weight;

    let points = 0;
    if (status === 'compliant') {
      points = req.weight;
      cat.compliantCount += 1;
    } else if (status === 'in_progress') {
      points = req.weight * 0.5;
      cat.inProgressCount += 1;
      if (req.criticality === 'mandatory') {
        mandatoryGapsExist = true;
      }
      nonCompliantRequirements.push(req);
    } else {
      // non_compliant
      points = 0;
      cat.nonCompliantCount += 1;
      nonCompliantRequirements.push(req);

      if (req.criticality === 'mandatory') {
        mandatoryGapsExist = true;
        blockingIssues.push({
          id: req.id,
          title: req.title,
          whyItMatters: req.whyItMatters,
          officialDocUrl: req.officialDocUrl,
          officialDocTitle: req.officialDocTitle
        });
      }
    }

    cat.scoredWeight += points;
    totalScoredWeight += points;
  }

  // Calculate percentages per category
  for (const catKey of Object.keys(categoryScores) as RequirementCategory[]) {
    const cat = categoryScores[catKey];
    cat.percentage = cat.maxWeight > 0 ? Math.round((cat.scoredWeight / cat.maxWeight) * 100) : 100;
  }

  // Overall Score (0 - 100)
  const rawScore = totalMaxWeight > 0 ? Math.round((totalScoredWeight / totalMaxWeight) * 100) : 0;
  let score = rawScore;

  // Determine classification
  let classification: DiagnosticClassification = 'critical';

  if (score >= 90) {
    classification = 'advanced';
  } else if (score >= 70) {
    classification = 'ready';
  } else if (score >= 40) {
    classification = 'in_progress';
  } else {
    classification = 'critical';
  }

  // Mandate: If any mandatory requirement is unmet, maximum classification is 'in_progress'
  if (mandatoryGapsExist && (classification === 'ready' || classification === 'advanced')) {
    classification = 'in_progress';
  }

  // If using unofficial API without official WABA, penalize score and flag
  if (profile.currentSolution === 'unofficial_baileys') {
    // Serious operational risk
    if (classification === 'ready' || classification === 'advanced') {
      classification = 'in_progress';
    }
  }

  // Single next high impact step
  let singleNextHighImpactStep: DiagnosticResult['singleNextHighImpactStep'] = null;

  // Sort unmet requirements by weight descending, then mandatory first
  const sortedUnmet = [...nonCompliantRequirements].sort((a, b) => {
    if (a.criticality === 'mandatory' && b.criticality !== 'mandatory') return -1;
    if (b.criticality === 'mandatory' && a.criticality !== 'mandatory') return 1;
    return b.weight - a.weight;
  });

  if (sortedUnmet.length > 0) {
    const topGap = sortedUnmet[0];
    singleNextHighImpactStep = {
      requirementId: topGap.id,
      title: topGap.title,
      whyItMatters: topGap.whyItMatters,
      practicalGuidance: topGap.practicalGuidance,
      officialDocUrl: topGap.officialDocUrl
    };
  }

  const now = new Date().toISOString();

  return {
    id: existingId || `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    companyProfile: profile,
    answers,
    notes,
    score,
    classification,
    hasBlockingIssues: blockingIssues.length > 0,
    blockingIssues,
    categoryScores,
    singleNextHighImpactStep,
    createdAt: now,
    updatedAt: now
  };
}

export function getStatusBadgeData(classification: DiagnosticClassification) {
  switch (classification) {
    case 'advanced':
      return {
        label: 'Avançado (Nível Corporativo)',
        description: 'Pronto para alta volumetria, múltiplos agentes e automação complexa.',
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    case 'ready':
      return {
        label: 'Pronto para Registro',
        description: 'Elegível para submissão imediata na Meta Cloud API.',
        colorClass: 'text-teal-700 bg-teal-50 border-teal-200'
      };
    case 'in_progress':
      return {
        label: 'Em Preparação (Ajustes Necessários)',
        description: 'Identificados requisitos obrigatórios ou técnicos que bloqueiam aprovação.',
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    case 'critical':
      return {
        label: 'Crítico (Alto Risco de Rejeição/Banimento)',
        description: 'Faltam pilares fundamentais societários, técnicos ou de conformidade.',
        colorClass: 'text-rose-700 bg-rose-50 border-rose-200'
      };
  }
}
