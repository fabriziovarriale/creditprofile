/**
 * Servizio per la gestione dei Credit Score con analisi avanzata
 */

import { supabase } from '@/lib/supabaseClient';

export interface CreditScoreReport {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  creditScore?: number;
  rating?: string; // C1, C2, B1, B2, A1, A2, etc.
  riskScore?: string; // ROSSO, GIALLO, VERDE
  riskDescription?: string;
  operativeLimit?: number;
  protesti?: boolean;
  pregiudizievoli?: boolean;
  procedureConcorsuali?: boolean;
  negativeReports?: Array<{
    type: 'protesti' | 'pregiudizievoli' | 'procedure_concorsuali';
    date: string;
    amount: number;
    description?: string;
  }>;
  reportPdfUrl?: string;
  analysis?: CreditScoreAnalysis;
}

export interface CreditScoreAnalysis {
  riskLevel: 'BASSO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  riskFactors: string[];
  recommendations: string[];
  creditworthiness: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
  approvalRecommendation: 'APPROVE' | 'APPROVE_WITH_CONDITIONS' | 'REVIEW' | 'REJECT';
  conditions?: string[];
  maxRecommendedLimit?: number;
}

/**
 * Analizza un credit score e fornisce insights automatici
 */
export function analyzeCreditScore(report: CreditScoreReport): CreditScoreAnalysis {
  const score = report.creditScore || 0;
  const hasProtesti = report.protesti || false;
  const hasPregiudizievoli = report.pregiudizievoli || false;
  const hasProcedureConcorsuali = report.procedureConcorsuali || false;
  const negativeReportsCount = report.negativeReports?.length || 0;

  // Determina il livello di rischio
  let riskLevel: CreditScoreAnalysis['riskLevel'] = 'BASSO';
  let creditworthiness: CreditScoreAnalysis['creditworthiness'] = 'EXCELLENT';
  let approvalRecommendation: CreditScoreAnalysis['approvalRecommendation'] = 'APPROVE';

  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  const conditions: string[] = [];

  // Analisi score
  if (score >= 750) {
    creditworthiness = 'EXCELLENT';
    riskLevel = 'BASSO';
    recommendations.push('Cliente con profilo creditizio eccellente');
  } else if (score >= 650) {
    creditworthiness = 'GOOD';
    riskLevel = 'BASSO';
    recommendations.push('Cliente con buon profilo creditizio');
  } else if (score >= 550) {
    creditworthiness = 'FAIR';
    riskLevel = 'MEDIO';
    riskFactors.push('Credit score nella media');
    recommendations.push('Valutare documentazione aggiuntiva');
  } else if (score >= 450) {
    creditworthiness = 'POOR';
    riskLevel = 'ALTO';
    riskFactors.push('Credit score basso');
    recommendations.push('Richiedere garanzie aggiuntive');
    approvalRecommendation = 'REVIEW';
  } else if (score > 0) {
    creditworthiness = 'VERY_POOR';
    riskLevel = 'CRITICO';
    riskFactors.push('Credit score molto basso');
    recommendations.push('Sconsigliata l\'approvazione senza garanzie sostanziali');
    approvalRecommendation = 'REJECT';
  }

  // Analisi elementi negativi
  if (hasProtesti) {
    riskLevel = riskLevel === 'BASSO' ? 'MEDIO' : riskLevel === 'MEDIO' ? 'ALTO' : 'CRITICO';
    riskFactors.push('Presenza di protesti');
    recommendations.push('Verificare natura e importo dei protesti');
    if (approvalRecommendation === 'APPROVE') {
      approvalRecommendation = 'APPROVE_WITH_CONDITIONS';
      conditions.push('Analisi dettagliata protesti');
    }
  }

  if (hasPregiudizievoli) {
    riskLevel = riskLevel === 'BASSO' ? 'MEDIO' : riskLevel === 'MEDIO' ? 'ALTO' : 'CRITICO';
    riskFactors.push('Presenza di informazioni pregiudizievoli');
    recommendations.push('Valutare attentamente le informazioni pregiudizievoli');
    if (approvalRecommendation === 'APPROVE') {
      approvalRecommendation = 'APPROVE_WITH_CONDITIONS';
      conditions.push('Verifica informazioni pregiudizievoli');
    }
  }

  if (hasProcedureConcorsuali) {
    riskLevel = 'CRITICO';
    riskFactors.push('Presenza di procedure concorsuali');
    recommendations.push('ATTENZIONE: Cliente con procedure concorsuali in corso');
    approvalRecommendation = 'REJECT';
    conditions.push('Non approvare senza analisi legale approfondita');
  }

  // Analisi dettagli negativi
  if (negativeReportsCount > 0) {
    riskFactors.push(`${negativeReportsCount} segnalazioni negative registrate`);
    
    report.negativeReports?.forEach(neg => {
      if (neg.amount > 10000) {
        riskFactors.push(`${neg.type}: importo elevato (€${neg.amount.toLocaleString()})`);
        if (riskLevel !== 'CRITICO') riskLevel = 'ALTO';
      }
    });
  }

  // Raccomandazioni limite operativo
  let maxRecommendedLimit = report.operativeLimit || 0;
  
  if (riskLevel === 'CRITICO') {
    maxRecommendedLimit = 0;
    recommendations.push('Limite operativo: €0 - Non concedere credito');
  } else if (riskLevel === 'ALTO') {
    maxRecommendedLimit = Math.min(maxRecommendedLimit * 0.3, 5000);
    recommendations.push(`Limite operativo ridotto: €${maxRecommendedLimit.toLocaleString()}`);
  } else if (riskLevel === 'MEDIO') {
    maxRecommendedLimit = Math.min(maxRecommendedLimit * 0.7, 15000);
    recommendations.push(`Limite operativo moderato: €${maxRecommendedLimit.toLocaleString()}`);
  }

  return {
    riskLevel,
    riskFactors,
    recommendations,
    creditworthiness,
    approvalRecommendation,
    conditions: conditions.length > 0 ? conditions : undefined,
    maxRecommendedLimit
  };
}

/**
 * Recupera tutti i credit score per un broker
 */
export async function getBrokerCreditScores(brokerId: string): Promise<CreditScoreReport[]> {
  try {
    console.log('🔍 Recupero credit scores per broker:', brokerId);

    // Per ora utilizziamo i dati dal localStorage (mock)
    // In futuro questo sarà sostituito con una query Supabase
    const mockReports = JSON.parse(localStorage.getItem('creditScoreReports') || '[]');
    
    // Filtra per broker (per ora tutti i mock reports)
    const reports: CreditScoreReport[] = mockReports.map((report: any) => ({
      ...report,
      analysis: analyzeCreditScore(report)
    }));

    console.log(`✅ Recuperati ${reports.length} credit scores`);
    return reports;

  } catch (error) {
    console.error('❌ Errore recupero credit scores:', error);
    return [];
  }
}

/**
 * Ottiene statistiche aggregate sui credit score
 */
export function getCreditScoreStats(reports: CreditScoreReport[]) {
  const total = reports.length;
  const completed = reports.filter(r => r.status === 'completed').length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const rejected = reports.filter(r => r.status === 'rejected').length;

  const completedReports = reports.filter(r => r.status === 'completed' && r.creditScore);
  const avgScore = completedReports.length > 0 
    ? Math.round(completedReports.reduce((sum, r) => sum + (r.creditScore || 0), 0) / completedReports.length)
    : 0;

  // Statistiche rischio
  const withProtesti = reports.filter(r => r.protesti).length;
  const withPregiudizievoli = reports.filter(r => r.pregiudizievoli).length;
  const withProcedureConcorsuali = reports.filter(r => r.procedureConcorsuali).length;
  
  // Analisi livelli di rischio
  const analysisStats = completedReports.reduce((acc, report) => {
    const analysis = report.analysis || analyzeCreditScore(report);
    acc[analysis.riskLevel] = (acc[analysis.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Raccomandazioni approvazione
  const approvalStats = completedReports.reduce((acc, report) => {
    const analysis = report.analysis || analyzeCreditScore(report);
    acc[analysis.approvalRecommendation] = (acc[analysis.approvalRecommendation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    completed,
    pending,
    rejected,
    avgScore,
    withProtesti,
    withPregiudizievoli,
    withProcedureConcorsuali,
    riskLevels: analysisStats,
    approvalRecommendations: approvalStats,
    highRiskCount: (analysisStats.ALTO || 0) + (analysisStats.CRITICO || 0),
    lowRiskCount: analysisStats.BASSO || 0
  };
}

/**
 * Genera un riassunto testuale di un credit score per l'AI
 */
export function generateCreditScoreSummary(report: CreditScoreReport): string {
  const analysis = report.analysis || analyzeCreditScore(report);
  
  let summary = `Credit Score ${report.clientName || report.clientId}: `;
  
  if (report.status === 'completed') {
    summary += `Score ${report.creditScore} (Rating: ${report.rating || 'N/A'}) - `;
    summary += `Rischio ${analysis.riskLevel} - `;
    summary += `Raccomandazione: ${analysis.approvalRecommendation}`;
    
    if (analysis.riskFactors.length > 0) {
      summary += ` | Fattori di rischio: ${analysis.riskFactors.join(', ')}`;
    }
    
    if (analysis.maxRecommendedLimit) {
      summary += ` | Limite consigliato: €${analysis.maxRecommendedLimit.toLocaleString()}`;
    }
  } else {
    summary += `Status: ${report.status}`;
  }
  
  return summary;
}

