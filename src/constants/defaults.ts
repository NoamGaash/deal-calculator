import type { ScenarioData, MortgageTranche } from '../types';

export function newTranche(overrides?: Partial<MortgageTranche>): MortgageTranche {
  return {
    id: crypto.randomUUID(),
    label: 'מסלול',
    type: 'prime',
    amount: 0,
    interestRate: 0,
    durationMonths: 240,
    boiRatePeriods: [
      { id: crypto.randomUUID(), fromYear: 1, toYear: 20, rate: 0 },
    ],
    rateChangeEveryYears: 5,
    assumedAnnualCpiPct: 0,
    ...overrides,
  };
}

export const DEFAULT_SCENARIO: ScenarioData = {
  property: {
    price: 0,
    equity: 0,
    appreciationRate: 0,
    holdingPeriodYears: 10,
    propertyType: 'additional',
  },
  purchaseCosts: {
    brokerCommission: { value: 2, unit: 'pct' },
    attorney: { value: 0.5, unit: 'pct' },
    mortgageConsultingFee: 0,
    appraisalFee: 0,
  },
  renovations: [],
  mortgageTranches: [newTranche()],
  rental: {
    monthlyRent: 0,
    annualIncreaseRate: 0,
    vacancyRatePct: 0,
  },
  expenses: {
    monthlyMaintenance: 0,
    propertyManagementPct: 0,
    monthlyLifeInsurance: 0,
    monthlyPropertyInsurance: 0,
  },
};
