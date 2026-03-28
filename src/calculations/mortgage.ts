import type { MortgageTranche, AmortizationRow, TrancheSchedule, BoIRatePeriod } from '../types';

function pmt(rate: number, nper: number, pv: number): number {
  if (rate === 0) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}

function getBoIRate(boiPeriods: BoIRatePeriod[], year: number): number {
  const sorted = [...boiPeriods].sort((a, b) => a.fromYear - b.fromYear);
  const match = sorted.find(p => year >= p.fromYear && year <= p.toYear);
  return match ? match.rate : sorted[sorted.length - 1]?.rate ?? 4.0;
}

function summarize(trancheId: string, rows: AmortizationRow[]): TrancheSchedule {
  const totalPaid = rows.reduce((s, r) => s + r.payment, 0);
  const totalInterestPaid = rows.reduce((s, r) => s + r.interest, 0);
  return { trancheId, rows, totalPaid, totalInterestPaid };
}

// קבועה לא צמודה — standard French amortization
function amortizeFixedUnlinked(t: MortgageTranche): TrancheSchedule {
  const monthlyRate = t.interestRate / 100 / 12;
  const payment = pmt(monthlyRate, t.durationMonths, t.amount);
  let balance = t.amount;
  const rows: AmortizationRow[] = [];

  for (let m = 1; m <= t.durationMonths; m++) {
    const interest = balance * monthlyRate;
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month: m, payment, principal, interest, balance });
  }
  return summarize(t.id, rows);
}

// קבועה צמודה — principal indexed to CPI monthly, fixed real rate
function amortizeFixedCPI(t: MortgageTranche): TrancheSchedule {
  const realMonthlyRate = t.interestRate / 100 / 12;
  const monthlyInflation = Math.pow(1 + t.assumedAnnualCpiPct / 100, 1 / 12) - 1;
  const n = t.durationMonths;

  // Payment is fixed in real terms; grows nominally with inflation each month
  const basePayment = pmt(realMonthlyRate, n, t.amount);

  let realBalance = t.amount;
  let inflationFactor = 1.0;
  const rows: AmortizationRow[] = [];

  for (let m = 1; m <= n; m++) {
    const prevInflationFactor = inflationFactor;
    inflationFactor *= 1 + monthlyInflation;

    const prevNominalBalance = realBalance * prevInflationFactor;
    const nominalPayment = basePayment * inflationFactor;

    // Linkage: inflation added to the outstanding balance this month
    const linkage = prevNominalBalance * monthlyInflation;
    // Interest on the inflation-adjusted (current) nominal balance at the real rate
    const interest = prevNominalBalance * (1 + monthlyInflation) * realMonthlyRate;
    const principal = nominalPayment - interest - linkage;

    // Real balance amortizes purely at the real rate (standard amortization in real terms)
    realBalance = Math.max(0, realBalance * (1 + realMonthlyRate) - basePayment);

    rows.push({
      month: m,
      payment: nominalPayment,
      principal,
      interest: interest + linkage,  // linkage reported as part of financing cost
      balance: realBalance * inflationFactor,
    });
  }
  return summarize(t.id, rows);
}

// פריים — BoI rate + spread; recalculates payment each month as rate may change
function amortizePrime(t: MortgageTranche): TrancheSchedule {
  let balance = t.amount;
  const rows: AmortizationRow[] = [];

  for (let m = 1; m <= t.durationMonths; m++) {
    const year = Math.ceil(m / 12);
    const boiRate = getBoIRate(t.boiRatePeriods, year);
    const effectiveAnnualRate = boiRate + t.interestRate; // spread stored in interestRate
    const monthlyRate = effectiveAnnualRate / 100 / 12;
    const remaining = t.durationMonths - m + 1;
    const payment = pmt(monthlyRate, remaining, balance);
    const interest = balance * monthlyRate;
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month: m, payment, principal, interest, balance });
  }
  return summarize(t.id, rows);
}

// משתנה — rate resets every N years (payment is fixed between resets)
function amortizeVariable(t: MortgageTranche): TrancheSchedule {
  let balance = t.amount;
  const rows: AmortizationRow[] = [];
  const resetEvery = t.rateChangeEveryYears * 12;
  let currentMonthlyRate = 0;
  let currentPayment = 0;

  for (let m = 1; m <= t.durationMonths; m++) {
    // Recalculate payment only at reset boundaries
    const isReset = m === 1 || (m - 1) % resetEvery === 0;
    if (isReset) {
      const year = Math.ceil(m / 12);
      const boiRate = getBoIRate(t.boiRatePeriods, year);
      currentMonthlyRate = (boiRate + t.interestRate) / 100 / 12;
      const remaining = t.durationMonths - m + 1;
      currentPayment = pmt(currentMonthlyRate, remaining, balance);
    }

    const interest = balance * currentMonthlyRate;
    const principal = currentPayment - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month: m, payment: currentPayment, principal, interest, balance });
  }
  return summarize(t.id, rows);
}

export function amortizeTranche(t: MortgageTranche): TrancheSchedule {
  switch (t.type) {
    case 'fixed_unlinked': return amortizeFixedUnlinked(t);
    case 'fixed_cpi':      return amortizeFixedCPI(t);
    case 'prime':          return amortizePrime(t);
    case 'variable':       return amortizeVariable(t);
  }
}

export function totalMonthlyPayment(schedules: TrancheSchedule[], month: number): number {
  return schedules.reduce((sum, s) => {
    const row = s.rows[month - 1];
    return sum + (row ? row.payment : 0);
  }, 0);
}

export function totalMonthlyInterest(schedules: TrancheSchedule[], month: number): number {
  return schedules.reduce((sum, s) => {
    const row = s.rows[month - 1];
    return sum + (row ? row.interest : 0);
  }, 0);
}

export function totalBalance(schedules: TrancheSchedule[], month: number): number {
  return schedules.reduce((sum, s) => {
    const row = s.rows[month - 1];
    return sum + (row ? row.balance : 0);
  }, 0);
}
