import type { ScenarioData, CalculationResult, YearlyRow, SummaryMetrics, TrancheSchedule } from '../types';
import { resolveCost, renovationToMonths } from '../types';
import { calcPurchaseTax } from '../constants/purchaseTax';
import { amortizeTranche, totalMonthlyPayment, totalMonthlyInterest, totalBalance } from './mortgage';

export function runCalculation(data: ScenarioData): CalculationResult {
  const { property, purchaseCosts, renovations, mortgageTranches, rental, expenses } = data;

  // ── Purchase costs ────────────────────────────────────────────────────────
  const purchaseTax = calcPurchaseTax(property.price, property.propertyType);
  const brokerFee = resolveCost(purchaseCosts.brokerCommission, property.price);
  const attorneyFee = resolveCost(purchaseCosts.attorney, property.price);
  const totalPurchaseCosts =
    purchaseTax + brokerFee + attorneyFee +
    purchaseCosts.mortgageConsultingFee +
    purchaseCosts.appraisalFee;

  // Renovations at month 0 (before purchase / at purchase) add to initial investment
  const totalInitialRenovations = renovations.reduce((s, r) => {
    const months = renovationToMonths(r);
    return months <= 0 ? s + r.estimatedCost : s;
  }, 0);

  const totalInvestment = property.equity + totalPurchaseCosts + totalInitialRenovations;
  const totalMortgage = mortgageTranches.reduce((s, t) => s + t.amount, 0);
  const ltvPct = property.price > 0 ? (totalMortgage / property.price) * 100 : 0;

  // ── Mortgage schedules ────────────────────────────────────────────────────
  const trancheSchedules: TrancheSchedule[] = mortgageTranches.map(amortizeTranche);

  // ── Renovation lookups by year ────────────────────────────────────────────
  // cashflow cost (actual spend, initial renos already counted in totalInvestment)
  const renovationsByYear: Record<number, number> = {};
  // value-add (cost × multiplier, all renovations including initial which land in year 1)
  const renovationValueAddByYear: Record<number, number> = {};

  for (const r of renovations) {
    const months = renovationToMonths(r);
    const year = Math.max(1, Math.ceil(months / 12));

    if (months > 0) {
      // future renos hit the cashflow in the year they occur
      renovationsByYear[year] = (renovationsByYear[year] ?? 0) + r.estimatedCost;
    }

    // all renovations create value-add (initial ones land in year 1)
    renovationValueAddByYear[year] = (renovationValueAddByYear[year] ?? 0) + r.estimatedCost * r.multiplier;
  }

  // ── Year-by-year rows ─────────────────────────────────────────────────────
  const holdingMonths = property.holdingPeriodYears * 12;
  const yearlyRows: YearlyRow[] = [];
  let cumulativeNetCashflow = 0;
  let runningPropertyValue = property.price; // iterative base, updated each year

  for (let year = 1; year <= property.holdingPeriodYears; year++) {
    const startMonth = (year - 1) * 12 + 1;
    const endMonth = Math.min(year * 12, holdingMonths);

    const rentMultiplier = Math.pow(1 + rental.annualIncreaseRate / 100, year - 1);
    const monthlyRent = rental.monthlyRent * rentMultiplier;
    const grossRentalIncome = monthlyRent * 12;
    const effectiveRentalIncome = grossRentalIncome * (1 - rental.vacancyRatePct / 100);

    let mortgagePayment = 0;
    let interestPaid = 0;
    for (let m = startMonth; m <= endMonth; m++) {
      mortgagePayment += totalMonthlyPayment(trancheSchedules, m);
      interestPaid += totalMonthlyInterest(trancheSchedules, m);
    }
    const principalPaid = mortgagePayment - interestPaid;

    const managementFee = effectiveRentalIncome * expenses.propertyManagementPct / 100;
    const maintenanceCost = expenses.monthlyMaintenance * 12;
    const insuranceCost = (expenses.monthlyLifeInsurance + expenses.monthlyPropertyInsurance) * 12;
    const renovationCost = renovationsByYear[year] ?? 0;
    const totalExpenses = mortgagePayment + maintenanceCost + managementFee + insuranceCost + renovationCost;
    const netCashflow = effectiveRentalIncome - totalExpenses;
    cumulativeNetCashflow += netCashflow;

    const valueAdd = renovationValueAddByYear[year] ?? 0;
    runningPropertyValue = runningPropertyValue * (1 + property.appreciationRate / 100) + valueAdd;
    const propertyValue = runningPropertyValue;
    const endOfYearMonth = Math.min(year * 12, holdingMonths);
    const mortgageBalance = totalBalance(trancheSchedules, endOfYearMonth);

    const trancheBalances: Record<string, number> = {};
    for (const s of trancheSchedules) {
      const row = s.rows[endOfYearMonth - 1];
      trancheBalances[s.trancheId] = row ? row.balance : 0;
    }

    yearlyRows.push({
      year,
      grossRentalIncome,
      effectiveRentalIncome,
      mortgagePayment,
      interestPaid,
      principalPaid,
      maintenanceCost,
      managementFee,
      insuranceCost,
      renovationCost,
      totalExpenses,
      netCashflow,
      propertyValue,
      mortgageBalance,
      equity: propertyValue - mortgageBalance,
      trancheBalances,
      cumulativeNetCashflow,
      alternativePortfolioValue: 0, // filled in the alternative portfolio pass below
    });
  }

  // ── Alternative portfolio (shadow investment) ─────────────────────────────
  // Same initial capital + top-up when real estate has negative cashflow,
  // growing at a fixed annual rate (e.g. index fund benchmark).
  {
    const altRate = 1 + property.alternativeYieldPct / 100;
    let altValue = totalInvestment;
    for (const row of yearlyRows) {
      if (row.netCashflow < 0) altValue += Math.abs(row.netCashflow);
      altValue *= altRate;
      row.alternativePortfolioValue = Math.round(altValue);
    }
  }

  // ── Exit metrics ─────────────────────────────────────────────────────────
  const lastYear = yearlyRows[yearlyRows.length - 1];
  const projectedSalePrice = lastYear?.propertyValue ?? property.price;
  const remainingMortgageAtSale = lastYear?.mortgageBalance ?? 0;
  const sellingBrokerFee = projectedSalePrice * 0.02;
  const sellingAttorneyFee = projectedSalePrice * 0.005;
  const sellingCosts = sellingBrokerFee + sellingAttorneyFee;

  // מס שבח — capital gains tax
  // Cost basis: purchase price + all purchase costs + all renovations (initial + future)
  const totalFutureRenovations = renovations.reduce((s, r) => {
    const months = renovationToMonths(r);
    return months > 0 ? s + r.estimatedCost : s;
  }, 0);
  const shevaghCostBasis = property.price + totalPurchaseCosts + totalInitialRenovations + totalFutureRenovations;
  const capitalGain = Math.max(0, projectedSalePrice - sellingCosts - shevaghCostBasis);
  // דירה יחידה (first home) is exempt; additional property pays 25%
  const capitalGainsTax = property.propertyType === 'additional' ? Math.round(capitalGain * 0.25) : 0;

  const netSaleProceeds = projectedSalePrice - remainingMortgageAtSale - sellingCosts - capitalGainsTax;
  const totalNetProfit = (lastYear?.cumulativeNetCashflow ?? 0) + netSaleProceeds - totalInvestment;
  const roi = totalInvestment > 0 ? (totalNetProfit / totalInvestment) * 100 : 0;
  const equityMultiple = totalInvestment > 0 ? (totalNetProfit + totalInvestment) / totalInvestment : 0;

  // ── Yield metrics ─────────────────────────────────────────────────────────
  const annualRent = rental.monthlyRent * 12;
  const grossYield = property.price > 0 ? (annualRent / property.price) * 100 : 0;
  const annualExpensesNoMortgage =
    expenses.monthlyMaintenance * 12 +
    annualRent * (1 - rental.vacancyRatePct / 100) * (expenses.propertyManagementPct / 100) +
    (expenses.monthlyLifeInsurance + expenses.monthlyPropertyInsurance) * 12;
  const noi = annualRent * (1 - rental.vacancyRatePct / 100) - annualExpensesNoMortgage;
  const capRate = property.price > 0 ? (noi / property.price) * 100 : 0;

  // ── Monthly figures (year 1) ──────────────────────────────────────────────
  const monthlyMortgagePayment = totalMonthlyPayment(trancheSchedules, 1);
  const monthlyRentYear1 = rental.monthlyRent * (1 - rental.vacancyRatePct / 100);
  const monthlyExpensesFixed =
    expenses.monthlyMaintenance +
    expenses.monthlyLifeInsurance +
    expenses.monthlyPropertyInsurance;
  const initialMonthlyCashflow =
    monthlyRentYear1 -
    monthlyMortgagePayment -
    monthlyExpensesFixed -
    monthlyRentYear1 * (expenses.propertyManagementPct / 100);

  // ── IRR ───────────────────────────────────────────────────────────────────
  const irrCashflows: number[] = [-totalInvestment];
  for (let i = 0; i < yearlyRows.length - 1; i++) {
    irrCashflows.push(yearlyRows[i].netCashflow);
  }
  irrCashflows.push((yearlyRows[yearlyRows.length - 1]?.netCashflow ?? 0) + netSaleProceeds);
  const irr = calcAnnualIRR(irrCashflows);

  // ── Additional summary metrics ───────────────────────────────────────────
  const totalInterestPaidHolding = yearlyRows.reduce((s, r) => s + r.interestPaid, 0);
  const totalCashOutflow = totalInvestment
    + yearlyRows.reduce((s, r) => s + r.totalExpenses, 0)
    + sellingCosts + capitalGainsTax;
  const MONTHLY_RENT_EXEMPTION = 5_471; // 2024 Israeli rental income exemption threshold
  const annualEffectiveRent = rental.monthlyRent * (1 - rental.vacancyRatePct / 100) * 12;
  const annualRentalTax10pct = rental.monthlyRent > MONTHLY_RENT_EXEMPTION
    ? Math.round(annualEffectiveRent * 0.10)
    : 0;

  // ── Break-even year ───────────────────────────────────────────────────────
  let breakEvenYear: number | null = null;
  for (const row of yearlyRows) {
    const totalReturn = row.cumulativeNetCashflow + (row.propertyValue - row.mortgageBalance) - totalInvestment;
    if (totalReturn >= 0 && breakEvenYear === null) {
      breakEvenYear = row.year;
    }
  }

  const summary: SummaryMetrics = {
    purchaseTax,
    totalPurchaseCosts,
    totalInitialRenovations,
    totalInvestment,
    totalMortgage,
    ltvPct,
    monthlyMortgagePayment,
    initialMonthlyCashflow,
    grossYield,
    capRate,
    projectedSalePrice,
    sellingCosts,
    remainingMortgageAtSale,
    capitalGainsTax,
    netSaleProceeds,
    totalNetProfit,
    totalInterestPaidHolding,
    totalCashOutflow,
    annualRentalTax10pct,
    roi,
    irr,
    equityMultiple,
    breakEvenYear,
  };

  return { summary, yearlyRows, trancheSchedules };
}

function calcAnnualIRR(cashflows: number[]): number {
  let rate = 0.08;
  for (let i = 0; i < 1000; i++) {
    const n = cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
    const dn = cashflows.reduce(
      (acc, cf, t) => acc - (t * cf) / Math.pow(1 + rate, t + 1),
      0
    );
    if (Math.abs(dn) < 1e-12) break;
    const next = rate - n / dn;
    if (Math.abs(next - rate) < 1e-9) return next;
    rate = Math.max(-0.99, next);
  }
  return NaN;
}
