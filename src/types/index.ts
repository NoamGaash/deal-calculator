// ── Property ────────────────────────────────────────────────────────────────

export type PropertyType = 'first' | 'additional';

export interface PropertyInputs {
  price: number;
  equity: number;
  appreciationRate: number; // % per year
  holdingPeriodYears: number;
  propertyType: PropertyType;
  alternativeYieldPct: number; // % annual return of benchmark investment
}

// ── Cost value (NIS or %) ────────────────────────────────────────────────────

export type CostUnit = 'nis' | 'pct';

export interface CostValue {
  value: number;
  unit: CostUnit;
}

export function resolveCost(cost: CostValue, base: number): number {
  return cost.unit === 'nis' ? cost.value : base * cost.value / 100;
}

export interface PurchaseCosts {
  brokerCommission: CostValue;
  attorney: CostValue;
  mortgageConsultingFee: number;  // always NIS
  appraisalFee: number;           // always NIS
}

// ── Renovation entries ────────────────────────────────────────────────────────

export type TimingUnit = 'days' | 'months' | 'years';

export interface RenovationEntry {
  id: string;
  title: string;
  estimatedCost: number;
  timingValue: number;
  timingUnit: TimingUnit;
  multiplier: number; // value created per ₪1 spent (1.0 = cost equals value, 1.4 = 40% forced equity)
}

// Convert renovation timing to months after purchase
export function renovationToMonths(r: RenovationEntry): number {
  if (r.timingUnit === 'days')   return r.timingValue / 30;
  if (r.timingUnit === 'months') return r.timingValue;
  return r.timingValue * 12;
}

// ── Mortgage ─────────────────────────────────────────────────────────────────

export type MortgageType = 'fixed_unlinked' | 'fixed_cpi' | 'prime' | 'variable';

export interface BoIRatePeriod {
  id: string;
  fromYear: number;
  toYear: number;
  rate: number;
}

export interface MortgageTranche {
  id: string;
  label: string;
  type: MortgageType;
  amount: number;
  interestRate: number;
  durationMonths: number;
  boiRatePeriods: BoIRatePeriod[];
  rateChangeEveryYears: number;
  assumedAnnualCpiPct: number;
}

// ── Ongoing ───────────────────────────────────────────────────────────────────

export interface RentalIncome {
  monthlyRent: number;
  annualIncreaseRate: number;
  vacancyRatePct: number;
}

export interface OngoingExpenses {
  monthlyMaintenance: number;
  propertyManagementPct: number;
  monthlyLifeInsurance: number;
  monthlyPropertyInsurance: number;
}

// ── Scenario ──────────────────────────────────────────────────────────────────

export interface ScenarioData {
  property: PropertyInputs;
  purchaseCosts: PurchaseCosts;
  renovations: RenovationEntry[];
  mortgageTranches: MortgageTranche[];
  rental: RentalIncome;
  expenses: OngoingExpenses;
}

export interface ScenarioMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scenario extends ScenarioMeta {
  data: ScenarioData;
}

// ── Results ───────────────────────────────────────────────────────────────────

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface TrancheSchedule {
  trancheId: string;
  rows: AmortizationRow[];
  totalInterestPaid: number;
  totalPaid: number;
}

export interface YearlyRow {
  year: number;
  grossRentalIncome: number;
  effectiveRentalIncome: number;
  mortgagePayment: number;
  interestPaid: number;
  principalPaid: number;
  maintenanceCost: number;
  managementFee: number;
  insuranceCost: number;
  renovationCost: number;
  totalExpenses: number;
  netCashflow: number;
  propertyValue: number;
  mortgageBalance: number;
  equity: number;
  trancheBalances: Record<string, number>;
  cumulativeNetCashflow: number;
  alternativePortfolioValue: number;
}

export interface SummaryMetrics {
  purchaseTax: number;
  totalPurchaseCosts: number;
  totalInitialRenovations: number;
  totalInvestment: number;
  totalMortgage: number;
  ltvPct: number;
  monthlyMortgagePayment: number;
  initialMonthlyCashflow: number;
  grossYield: number;
  capRate: number;
  projectedSalePrice: number;
  sellingCosts: number;
  remainingMortgageAtSale: number;
  capitalGainsTax: number;
  netSaleProceeds: number;
  totalNetProfit: number;
  totalInterestPaidHolding: number;
  totalCashOutflow: number;
  annualRentalTax10pct: number;
  roi: number;
  irr: number;
  equityMultiple: number;
  breakEvenYear: number | null;
}

export interface CalculationResult {
  summary: SummaryMetrics;
  yearlyRows: YearlyRow[];
  trancheSchedules: TrancheSchedule[];
}
