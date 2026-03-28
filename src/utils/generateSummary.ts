import type { ScenarioData, CalculationResult } from '../types';
import { resolveCost, renovationToMonths } from '../types';
import { fmtILS, fmtILSShort, fmtPct, fmtMonths } from './formatters';

// ── Label dictionaries ──────────────────────────────────────────────────────

const HE = {
  input: '[קלט]',
  calc: '[מחושב]',
  assumption: '[קלט — הנחה]',
  field: 'שדה', value: 'ערך', method: 'שיטת חישוב', source: 'מקור', note: 'הערה', item: 'סעיף',
  property: '🏠 נכס',
  price: 'מחיר נכס', equity: 'הון עצמי', reqMortgage: 'משכנתא נדרשת',
  ltv: 'LTV', propType: 'סוג נכס', appreciation: 'עליית ערך שנתית',
  holdingPeriod: 'תקופת החזקה', endValue: 'ערך נכס בסוף תקופה',
  first: 'דירה ראשונה', additional: 'דירה להשקעה (נוספת)',
  purchaseCosts: '💸 עלויות רכישה',
  purchaseTax: 'מס רכישה', broker: 'עמלת מתווך', attorney: 'שכ"ט עו"ד',
  consulting: 'ייעוץ משכנתא', appraisal: 'שמאות', totalCosts: 'סה"כ עלויות',
  renovations: '🔨 שיפוצים',
  renoTitle: 'כותרת', renoCost: 'עלות', renoTiming: 'תזמון', renoEffect: 'השפעה',
  atPurchase: 'ביום הרכישה', afterN: 'לאחר', inInitial: 'נכלל בהשקעה הראשונית', fromCashflow: 'מופחת מתזרים השוטף',
  mortgage: '🏦 מבנה המשכנתא',
  totalMortgage: 'סה"כ משכנתא', monthlyPayment: 'תשלום חודשי ראשוני',
  tranche: 'מסלול', type: 'סוג', amount: 'סכום', rate: 'ריבית', duration: 'תקופה', month1: 'תשלום חודשי (חודש 1)',
  prime: 'פריים', fixedUnlinked: 'קבועה לא צמודה', fixedCpi: 'קבועה צמודה', variable: 'משתנה',
  ongoing: '📊 הכנסות והוצאות שוטפות',
  rentalIncome: 'הכנסות (קלטי משתמש)', monthlyRent: 'שכ"ד חודשי',
  rentIncrease: 'עליית שכ"ד שנתית', vacancy: 'ריקנות', effectiveRent: 'שכ"ד יעיל (שנה 1)',
  opex: 'הוצאות תפעוליות (קלטי משתמש)', maintenance: 'תחזוקה חודשית',
  management: 'ניהול נכס', lifeIns: 'ביטוח חיים', propIns: 'ביטוח נכס',
  yields: 'תשואות (מחושב)', grossYield: 'תשואה ברוטו', capRate: 'Cap Rate',
  netMonthlyCashflow: 'תזרים חודשי נטו (שנה 1)',
  results: '📈 תוצאות פיננסיות',
  investmentAndExit: 'השקעה ויציאה',
  initialInv: 'השקעה ראשונית', endPropertyValue: 'ערך נכס בסוף תקופה',
  remainingMortgage: 'יתרת משכנתא בסוף', sellingCosts: 'עלויות מכירה',
  capitalGainsTax: 'מס שבח', netSaleProceeds: 'תמורת מכירה נטו',
  totalReturns: 'תשואות כוללות', totalNetProfit: 'רווח נטו כולל',
  roi: 'ROI', irr: 'IRR שנתי', equityMultiple: 'מכפיל הון',
  breakEven: 'שנת איזון תפעולי', totalInterest: 'ריבית כוללת ששולמה', totalOutflow: 'סה"כ תזרים יוצא',
  na: 'לא זמין', noBreakEven: 'לא הגיע',
  rentalTax: '🧾 מס הכנסה על שכ"ד',
  monthlyRentGross: 'שכ"ד חודשי ברוטו', exemptionThreshold: 'תקרת פטור',
  annualTax: 'מס שנתי מוערך (מסלול 10%)', exempt: 'פטור',
  yearlyDetail: '📅 פירוט שנתי',
  year: 'שנה', effRent: 'שכ"ד יעיל', mortgagePayment: 'משכנתא', expenses: 'הוצאות',
  netCashflow: 'תזרים נטו', propertyValue: 'ערך נכס', equityInProp: 'הון בנכס', cumulative: 'תזרים מצטבר',
  methodology: '⚙️ מתודולוגיה והנחות',
  generated: 'נוצר',
  headerNote: '⚠️ ערכים מסומנים *[קלט]* הוזנו על ידי המשתמש. ערכים מסומנים *[מחושב]* חושבו על ידי המערכת.',
  purchaseTaxNote: '**הנחת מס רכישה:** מחושב לפי מדרגות רשות המיסים 2024. לדירה ראשונה: 0% עד ₪1,978,745 | 3.5% עד ₪2,347,210 | 5% עד ₪6,055,070. לדירה נוספת: 8% עד ₪5,872,725 | 10% מעלה.',
  mortgageNotes: ['פריים = ריבית בנק ישראל + 1.5% (קבועה בחוק)', 'קבועה לא צמודה: שיטת ליר"פ (amortization צרפתי), תשלום חודשי קבוע', 'קבועה צמודה: אמורטיזציה בריבית ריאלית; הקרן צמודה למדד; תשלום נומינלי עולה עם האינפלציה', 'משתנה: תשלום מחושב מחדש בכל N שנים לפי יתרת חוב ושיעור ריבית עדכני'],
  rentalTaxNote: '**מסלול 10%:** אם שכ"ד חודשי > ₪5,471 (תקרת פטור 2024) — 10% על ההכנסה השנתית הכוללת. מסלולים חלופיים (מדרגות, 60% הכרת הוצאות) לא מחושבים — תלויים בנתוני הנישום.',
  capitalGainsTaxNote: '**מס שבח:** 25% על רווח נומינלי (ללא הצמדה). בסיס עלות = מחיר + עלויות רכישה + כל השיפוצים. דירה יחידה פטורה.',
  sellingCostsNote: '**עלויות מכירה:** 2% עמלת מתווך + 0.5% שכ"ט עו"ד = 2.5% ממחיר המכירה (הנחה קבועה).',
  irrNote: 'IRR: Newton-Raphson על תזרים שנתי; שנה 0 = −השקעה ראשונית; שנה אחרונה כוללת תמורת מכירה.',
  breakEvenNote: 'איזון תפעולי: שנה בה (תזרים מצטבר + הון עצמי בנכס) ≥ השקעה ראשונית.',
};

const EN = {
  input: '[input]',
  calc: '[calculated]',
  assumption: '[input — assumption]',
  field: 'Field', value: 'Value', method: 'Calculation Method', source: 'Source', note: 'Note', item: 'Item',
  property: '🏠 Property',
  price: 'Property Price', equity: 'Equity', reqMortgage: 'Required Mortgage',
  ltv: 'LTV', propType: 'Property Type', appreciation: 'Annual Appreciation',
  holdingPeriod: 'Holding Period', endValue: 'Property Value at End',
  first: 'First Home', additional: 'Investment Property (Additional)',
  purchaseCosts: '💸 Purchase Costs',
  purchaseTax: 'Purchase Tax', broker: 'Broker Commission', attorney: 'Attorney Fee',
  consulting: 'Mortgage Consulting', appraisal: 'Appraisal', totalCosts: 'Total Costs',
  renovations: '🔨 Renovations',
  renoTitle: 'Title', renoCost: 'Cost', renoTiming: 'Timing', renoEffect: 'Effect',
  atPurchase: 'At purchase', afterN: 'After', inInitial: 'Included in initial investment', fromCashflow: 'Deducted from cashflow',
  mortgage: '🏦 Mortgage Structure',
  totalMortgage: 'Total Mortgage', monthlyPayment: 'Initial Monthly Payment',
  tranche: 'Tranche', type: 'Type', amount: 'Amount', rate: 'Rate', duration: 'Duration', month1: 'Monthly Payment (Month 1)',
  prime: 'Prime', fixedUnlinked: 'Fixed (unlinked)', fixedCpi: 'Fixed (CPI-linked)', variable: 'Variable',
  ongoing: '📊 Income & Operating Expenses',
  rentalIncome: 'Rental Income (user inputs)', monthlyRent: 'Monthly Rent',
  rentIncrease: 'Annual Rent Increase', vacancy: 'Vacancy', effectiveRent: 'Effective Rent (Year 1)',
  opex: 'Operating Expenses (user inputs)', maintenance: 'Monthly Maintenance',
  management: 'Property Management', lifeIns: 'Life Insurance', propIns: 'Property Insurance',
  yields: 'Yields (calculated)', grossYield: 'Gross Yield', capRate: 'Cap Rate',
  netMonthlyCashflow: 'Net Monthly Cashflow (Year 1)',
  results: '📈 Financial Results',
  investmentAndExit: 'Investment & Exit',
  initialInv: 'Initial Investment', endPropertyValue: 'Property Value at End',
  remainingMortgage: 'Remaining Mortgage at Sale', sellingCosts: 'Selling Costs',
  capitalGainsTax: 'Capital Gains Tax', netSaleProceeds: 'Net Sale Proceeds',
  totalReturns: 'Total Returns', totalNetProfit: 'Total Net Profit',
  roi: 'ROI', irr: 'IRR (annual)', equityMultiple: 'Equity Multiple',
  breakEven: 'Break-even Year', totalInterest: 'Total Interest Paid', totalOutflow: 'Total Cash Outflow',
  na: 'N/A', noBreakEven: 'Not reached',
  rentalTax: '🧾 Rental Income Tax',
  monthlyRentGross: 'Monthly Rent (gross)', exemptionThreshold: 'Exemption Threshold',
  annualTax: 'Estimated Annual Tax (10% track)', exempt: 'Exempt',
  yearlyDetail: '📅 Year-by-Year Detail',
  year: 'Year', effRent: 'Eff. Rent', mortgagePayment: 'Mortgage', expenses: 'Expenses',
  netCashflow: 'Net Cashflow', propertyValue: 'Property Value', equityInProp: 'Equity', cumulative: 'Cumulative',
  methodology: '⚙️ Methodology & Assumptions',
  generated: 'Generated',
  headerNote: '⚠️ Values marked *[input]* were provided by the user. Values marked *[calculated]* were computed by the system.',
  purchaseTaxNote: '**Purchase tax assumption:** Calculated using 2024 Israeli tax authority brackets. First home: 0% up to ₪1,978,745 | 3.5% up to ₪2,347,210 | 5% up to ₪6,055,070. Additional: 8% up to ₪5,872,725 | 10% above.',
  mortgageNotes: ['Prime = Bank of Israel rate + 1.5% (regulatory)', 'Fixed unlinked: French amortization, constant monthly payment', 'Fixed CPI-linked: real-rate amortization; principal indexed to CPI; nominal payment rises with inflation', 'Variable: payment recalculated every N years based on remaining balance and updated rate'],
  rentalTaxNote: '**10% flat track:** If monthly rent > ₪5,471 (2024 exemption ceiling) — 10% on full annual income. Alternative tracks (marginal rate, 60% expense recognition) not calculated — depend on individual tax situation.',
  capitalGainsTaxNote: '**Capital gains tax (מס שבח):** 25% on nominal gain (not inflation-adjusted). Cost basis = purchase price + purchase costs + all renovation costs. First/only home is exempt.',
  sellingCostsNote: '**Selling costs assumption:** 2% broker + 0.5% attorney = 2.5% of sale price (fixed assumption).',
  irrNote: 'IRR: Newton-Raphson on annual cashflows; year 0 = −initial investment; final year includes net sale proceeds.',
  breakEvenNote: 'Break-even: year when (cumulative cashflow + equity in property) ≥ initial investment.',
};

// ── Helper ──────────────────────────────────────────────────────────────────

function tbl(headers: string[], rows: string[][]): string {
  return [
    '| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...rows.map(r => '| ' + r.join(' | ') + ' |'),
  ].join('\n');
}

// ── Main export ─────────────────────────────────────────────────────────────

export function generateSummaryMarkdown(
  data: ScenarioData,
  result: CalculationResult,
  scenarioName: string,
  language: 'he' | 'en' = 'he',
): string {
  const L = language === 'he' ? HE : EN;
  const s = result.summary;
  const { property, purchaseCosts, mortgageTranches, rental, expenses, renovations } = data;
  const lastRow = result.yearlyRows[result.yearlyRows.length - 1];
  const date = new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US');

  const parts: string[] = [];
  const push = (text: string) => parts.push(text);

  const typeLabel = (type: string) => ({ prime: L.prime, fixed_unlinked: L.fixedUnlinked, fixed_cpi: L.fixedCpi, variable: L.variable }[type] ?? type);

  // ── Header ──
  push(`# ${scenarioName}`);
  push(`> **${L.generated}:** ${date}  \n> ${L.headerNote}`);

  // ── Property ──
  push(`## ${L.property}`);
  push(tbl(
    [L.field, L.value, L.source],
    [
      [L.price, fmtILS(property.price), L.input],
      [L.equity, fmtILS(property.equity), L.input],
      [L.reqMortgage, fmtILS(s.totalMortgage), `${L.calc} price − equity`],
      [L.ltv, fmtPct(s.ltvPct), `${L.calc} mortgage ÷ price`],
      [L.propType, property.propertyType === 'first' ? L.first : L.additional, L.input],
      [L.appreciation, fmtPct(property.appreciationRate), L.assumption],
      [L.holdingPeriod, `${property.holdingPeriodYears} ${language === 'he' ? 'שנים' : 'years'}`, L.input],
      [L.endValue, fmtILSShort(lastRow?.propertyValue ?? property.price), `${L.calc} price × (1 + ${property.appreciationRate}%)^${property.holdingPeriodYears}`],
    ]
  ));

  // ── Purchase Costs ──
  push(`## ${L.purchaseCosts}`);
  const brokerFee = resolveCost(purchaseCosts.brokerCommission, property.price);
  const attyFee = resolveCost(purchaseCosts.attorney, property.price);
  push(tbl(
    [L.item, L.value, L.source],
    [
      [L.purchaseTax, fmtILS(s.purchaseTax), `${L.calc} 2024 brackets`],
      [L.broker, fmtILS(brokerFee), `${L.input} ${purchaseCosts.brokerCommission.unit === 'pct' ? purchaseCosts.brokerCommission.value + '% of price' : 'fixed amount'}`],
      [L.attorney, fmtILS(attyFee), `${L.input} ${purchaseCosts.attorney.unit === 'pct' ? purchaseCosts.attorney.value + '% of price' : 'fixed amount'}`],
      [L.consulting, fmtILS(purchaseCosts.mortgageConsultingFee), L.input],
      [L.appraisal, fmtILS(purchaseCosts.appraisalFee), L.input],
      [`**${L.totalCosts}**`, `**${fmtILS(s.totalPurchaseCosts)}**`, `${L.calc} sum`],
    ]
  ));
  push(`> ${L.purchaseTaxNote}`);

  // ── Renovations ──
  if (renovations.length > 0) {
    push(`## ${L.renovations}`);
    push(tbl(
      [L.renoTitle, L.renoCost, L.renoTiming, L.renoEffect],
      renovations.map(r => {
        const months = renovationToMonths(r);
        const isInitial = months <= 0;
        const timingStr = isInitial
          ? L.atPurchase
          : `${L.afterN} ${r.timingValue} ${language === 'he' ? (r.timingUnit === 'days' ? 'ימים' : r.timingUnit === 'months' ? 'חודשים' : 'שנים') : r.timingUnit}`;
        return [r.title || '—', fmtILS(r.estimatedCost), timingStr, isInitial ? L.inInitial : L.fromCashflow];
      })
    ));
    if (s.totalInitialRenovations > 0) {
      push(`> ${language === 'he' ? `שיפוצים ראשוניים (${fmtILSShort(s.totalInitialRenovations)}) נכללים בהשקעה הראשונית ומגדילים את בסיס העלות לצורך מס שבח.` : `Initial renovations (${fmtILSShort(s.totalInitialRenovations)}) are included in the initial investment and increase the cost basis for capital gains tax.`}`);
    }
  }

  // ── Mortgage ──
  push(`## ${L.mortgage}`);
  push(`**${L.totalMortgage}:** ${fmtILS(s.totalMortgage)} | **LTV:** ${fmtPct(s.ltvPct)} | **${L.monthlyPayment}:** ${fmtILS(s.monthlyMortgagePayment)}`);
  push(tbl(
    [L.tranche, L.type, L.amount, L.rate, L.duration, L.month1],
    mortgageTranches.map(t => {
      const sched = result.trancheSchedules.find(sc => sc.trancheId === t.id);
      const isPrime = t.type === 'prime' || t.type === 'variable';
      const rateStr = isPrime ? `P${t.interestRate >= 0 ? '+' : ''}${t.interestRate}%` : `${t.interestRate}%`;
      return [t.label, typeLabel(t.type), fmtILS(t.amount), rateStr, fmtMonths(t.durationMonths), fmtILS(sched?.rows[0]?.payment ?? 0)];
    })
  ));
  push(L.mortgageNotes.map(n => `> - ${n}`).join('\n'));
  const cpiAssumption = mortgageTranches[0]?.assumedAnnualCpiPct ?? 2.5;
  push(`> - ${language === 'he' ? `CPI מניחה ${cpiAssumption}% שנתי` : `Assumed CPI: ${cpiAssumption}% annually`}`);

  // ── Rental & Expenses ──
  push(`## ${L.ongoing}`);
  push(`### ${L.rentalIncome}`);
  push(tbl(
    [L.field, L.value, L.source],
    [
      [L.monthlyRent, fmtILS(rental.monthlyRent), L.input],
      [L.rentIncrease, fmtPct(rental.annualIncreaseRate), L.assumption],
      [L.vacancy, fmtPct(rental.vacancyRatePct), L.assumption],
      [L.effectiveRent, fmtILS(rental.monthlyRent * (1 - rental.vacancyRatePct / 100)), `${L.calc} rent × (1 − vacancy%)`],
    ]
  ));
  push(`### ${L.opex}`);
  push(tbl(
    [L.field, L.value],
    [
      [L.maintenance, fmtILS(expenses.monthlyMaintenance)],
      [L.management, `${expenses.propertyManagementPct}% ${language === 'he' ? 'משכ"ד' : 'of rent'}`],
      [L.lifeIns, fmtILS(expenses.monthlyLifeInsurance)],
      [L.propIns, fmtILS(expenses.monthlyPropertyInsurance)],
    ]
  ));
  push(`### ${L.yields}`);
  push(tbl(
    [L.field, L.value, L.method],
    [
      [L.grossYield, fmtPct(s.grossYield), `${language === 'he' ? 'שכ"ד שנתי ÷ מחיר נכס' : 'annual rent ÷ property price'}`],
      [L.capRate, fmtPct(s.capRate), `NOI ÷ price (NOI = ${language === 'he' ? 'שכ"ד יעיל − הוצאות ללא משכנתא' : 'effective rent − non-mortgage expenses'})`],
      [L.netMonthlyCashflow, fmtILS(s.initialMonthlyCashflow), `${language === 'he' ? 'שכ"ד יעיל − משכנתא − הוצאות קבועות' : 'effective rent − mortgage − fixed expenses'}`],
    ]
  ));

  // ── Results ──
  push(`## ${L.results} (${property.holdingPeriodYears} ${language === 'he' ? 'שנים' : 'years'})`);
  push(`### ${L.investmentAndExit}`);
  push(tbl(
    [L.field, L.value, L.method],
    [
      [L.initialInv, fmtILS(s.totalInvestment), `equity + costs${s.totalInitialRenovations > 0 ? (language === 'he' ? ' + שיפוצים ראשוניים' : ' + initial renovations') : ''}`],
      [L.endPropertyValue, fmtILSShort(lastRow?.propertyValue ?? 0), `price × (1 + ${property.appreciationRate}%)^${property.holdingPeriodYears}`],
      [L.remainingMortgage, fmtILS(s.remainingMortgageAtSale), language === 'he' ? 'לפי לוח סילוקין' : 'amortization schedule'],
      [L.sellingCosts, fmtILS(s.sellingCosts), '2% broker + 0.5% attorney'],
      [L.capitalGainsTax, fmtILS(s.capitalGainsTax), property.propertyType === 'first' ? (language === 'he' ? 'פטור — דירה יחידה' : 'Exempt — primary home') : `25% × (sale price − selling costs − cost basis)`],
      [L.netSaleProceeds, fmtILS(s.netSaleProceeds), language === 'he' ? 'ערך − משכנתא − עלויות מכירה − מס שבח' : 'value − mortgage − selling costs − tax'],
    ]
  ));
  push(`> ${L.capitalGainsTaxNote}`);
  push(`> ${L.sellingCostsNote}`);
  push(`### ${L.totalReturns}`);
  push(tbl(
    [L.field, L.value, L.method],
    [
      [L.totalNetProfit, fmtILSShort(s.totalNetProfit), language === 'he' ? 'תזרים מצטבר + תמורת מכירה − השקעה' : 'cumulative cashflow + sale proceeds − investment'],
      [L.roi, fmtPct(s.roi), 'net profit ÷ initial investment'],
      [L.irr, isNaN(s.irr) ? L.na : fmtPct(s.irr * 100), 'Newton-Raphson, annual cashflows'],
      [L.equityMultiple, `${s.equityMultiple.toFixed(2)}x`, '(profit + investment) ÷ investment'],
      [L.breakEven, s.breakEvenYear ? `${language === 'he' ? 'שנה' : 'Year'} ${s.breakEvenYear}` : L.noBreakEven, language === 'he' ? 'תזרים מצטבר + הון בנכס ≥ השקעה' : 'cumulative cashflow + equity ≥ investment'],
      [L.totalInterest, fmtILSShort(s.totalInterestPaidHolding), language === 'he' ? 'סכום ריבית כל המסלולים בתקופת ההחזקה' : 'sum of all tranche interest during holding period'],
      [L.totalOutflow, fmtILSShort(s.totalCashOutflow), language === 'he' ? 'השקעה + הוצאות שוטפות + עלויות יציאה' : 'investment + running expenses + exit costs'],
    ]
  ));
  push(`> ${L.irrNote}`);
  push(`> ${L.breakEvenNote}`);

  // ── Rental Tax ──
  push(`## ${L.rentalTax}`);
  push(tbl(
    [L.field, L.value],
    [
      [L.monthlyRentGross, fmtILS(rental.monthlyRent)],
      [L.exemptionThreshold, '₪5,471 / month (2024)'],
      [L.annualTax, s.annualRentalTax10pct > 0 ? fmtILS(s.annualRentalTax10pct) : L.exempt],
    ]
  ));
  push(`> ${L.rentalTaxNote}`);

  // ── Year-by-year ──
  push(`## ${L.yearlyDetail}`);
  push(tbl(
    [L.year, L.effRent, L.mortgagePayment, L.expenses, L.netCashflow, L.propertyValue, L.equityInProp, L.cumulative],
    result.yearlyRows.map(r => [
      String(r.year),
      fmtILSShort(r.effectiveRentalIncome),
      fmtILSShort(r.mortgagePayment),
      fmtILSShort(r.maintenanceCost + r.managementFee + r.insuranceCost + r.renovationCost),
      fmtILSShort(r.netCashflow),
      fmtILSShort(r.propertyValue),
      fmtILSShort(r.equity),
      fmtILSShort(r.cumulativeNetCashflow),
    ])
  ));

  // ── Methodology ──
  push(`## ${L.methodology}`);
  const rows: string[][] = [
    [language === 'he' ? 'עליית ערך' : 'Appreciation', `${property.appreciationRate}% ${language === 'he' ? 'שנתי, ריבית דריבית' : 'annual, compound'}`],
    [language === 'he' ? 'שכ"ד' : 'Rent', `+${rental.annualIncreaseRate}%/yr, ${rental.vacancyRatePct}% vacancy`],
    [language === 'he' ? 'עלויות מכירה' : 'Selling costs', '2.5% of sale price (fixed assumption)'],
    [language === 'he' ? 'מס שבח' : 'Capital gains tax', property.propertyType === 'first' ? (language === 'he' ? 'פטור — דירה יחידה' : 'Exempt — primary home') : '25% nominal gain'],
    [language === 'he' ? 'בסיס עלות לשבח' : 'Cost basis (CGT)', language === 'he' ? 'מחיר + עלויות רכישה + שיפוצים' : 'price + purchase costs + renovations'],
    ['Prime rate', `BoI rate + 1.5%`],
    ['CPI', `${cpiAssumption}% annual (assumption)`],
    ['IRR', `Newton-Raphson, annual cashflows`],
    [language === 'he' ? 'איזון תפעולי' : 'Break-even', language === 'he' ? 'תזרים מצטבר + הון בנכס ≥ השקעה' : 'cumulative CF + property equity ≥ investment'],
    [language === 'he' ? 'מס שכירות' : 'Rental tax', `10% track, threshold ₪5,471/mo (2024)`],
  ];
  push(tbl([language === 'he' ? 'נושא' : 'Topic', language === 'he' ? 'הנחה / שיטה' : 'Assumption / Method'], rows));

  return parts.join('\n\n');
}
