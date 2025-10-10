import { updateCreditScore } from './creditScoresService';

type Scenario = 'completed_clean' | 'completed_with_flags' | 'pending';

export async function simulateCreditScore(id: number, scenario: Scenario) {
  if (scenario === 'pending') {
    return updateCreditScore(id, {
      status: 'pending',
      credit_score: null,
      protesti: false,
      pregiudizievoli: false,
      procedure_concorsuali: false,
      provider: 'Mock Provider',
      raw_response: { scenario },
      completed_at: null,
      error_message: null,
    });
  }

  const isClean = scenario === 'completed_clean';
  const score = isClean ? 740 : 610;

  return updateCreditScore(id, {
    status: 'completed',
    credit_score: score,
    protesti: !isClean && Math.random() < 0.5,
    pregiudizievoli: !isClean && Math.random() < 0.5,
    procedure_concorsuali: !isClean && Math.random() < 0.2,
    provider: 'Mock Provider',
    raw_response: { scenario, generatedAt: new Date().toISOString() },
    completed_at: new Date().toISOString(),
    error_message: null,
  });
}


