import { useTranslation } from 'react-i18next';
import type { CalculationResult, MortgageTranche, ScenarioData } from '../../types';
import { fmtILS, fmtILSShort, fmtPct, fmtX } from '../../utils/formatters';

interface Props {
  result: CalculationResult;
  tranches: MortgageTranche[];
  holdingYears: number;
  data: ScenarioData;
  scenarioName: string;
}

const TYPE_LABEL: Record<string, string> = {
  prime: 'פריים',
  fixed_unlinked: 'קבועה לא צמודה',
  fixed_cpi: 'קבועה צמודה',
  variable: 'משתנה',
};
const TYPE_LABEL_EN: Record<string, string> = {
  prime: 'Prime',
  fixed_unlinked: 'Fixed (unlinked)',
  fixed_cpi: 'Fixed (CPI-linked)',
  variable: 'Variable',
};

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-gray-300 rounded p-2">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-base font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export function PrintView({ result, tranches, holdingYears, data, scenarioName }: Props) {
  const { t, i18n } = useTranslation();
  const s = result.summary;
  const isHe = i18n.language === 'he';
  const date = new Date().toLocaleDateString(isHe ? 'he-IL' : 'en-US');
  const typeLabel = (type: string) => isHe ? TYPE_LABEL[type] ?? type : TYPE_LABEL_EN[type] ?? type;

  const lastRow = result.yearlyRows[result.yearlyRows.length - 1];

  return (
    <div className="hidden print:block bg-white text-black p-8 text-sm font-sans">
      {/* ── Header ── */}
      <div className="border-b-2 border-gray-800 pb-3 mb-5">
        <h1 className="text-xl font-bold text-gray-900">{scenarioName}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {t('app.subtitle')} — {t('app.title')} — {date}
        </p>
      </div>

      {/* ── Investment ── */}
      <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        {isHe ? 'השקעה' : 'Investment'}
      </h2>
      <div className="grid grid-cols-4 gap-2 mb-5">
        <Metric label={t('summary.totalInvestment')} value={fmtILSShort(s.totalInvestment)}
          sub={`${isHe ? 'מחיר' : 'Price'} ${fmtILSShort(data.property.price)}`} />
        <Metric label={t('summary.ltv')} value={fmtPct(s.ltvPct)}
          sub={`${isHe ? 'משכנתא' : 'Mortgage'} ${fmtILSShort(s.totalMortgage)}`} />
        <Metric label={t('summary.purchaseTax')} value={fmtILS(s.purchaseTax)}
          sub={`${isHe ? 'סה"כ עלויות' : 'Total costs'} ${fmtILSShort(s.totalPurchaseCosts)}`} />
        <Metric label={t('summary.monthlyPayment')} value={fmtILS(s.monthlyMortgagePayment)}
          sub={t('summary.monthlyPaymentSub')} />
      </div>

      {/* ── Cash Flow & Yield ── */}
      <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        {isHe ? 'תזרים ותשואה' : 'Cash Flow & Yield'}
      </h2>
      <div className="grid grid-cols-4 gap-2 mb-5">
        <Metric label={t('summary.monthlyCashflow')} value={fmtILS(s.initialMonthlyCashflow)}
          sub={t('summary.monthlyCashflowSub')} />
        <Metric label={t('summary.grossYield')} value={fmtPct(s.grossYield)}
          sub={`Cap Rate ${fmtPct(s.capRate)}`} />
        <Metric label={t('summary.totalInterest')} value={fmtILSShort(s.totalInterestPaidHolding)}
          sub={t('summary.totalInterestSub', { years: holdingYears })} />
        <Metric label={t('summary.rentalTax')}
          value={s.annualRentalTax10pct > 0 ? fmtILS(s.annualRentalTax10pct) : t('summary.rentalTaxExempt')}
          sub={s.annualRentalTax10pct > 0 ? t('summary.rentalTaxSub') : t('summary.rentalTaxExemptSub')} />
      </div>

      {/* ── Exit & Returns ── */}
      <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        {isHe ? `יציאה ותשואות (${holdingYears} שנה)` : `Exit & Returns (${holdingYears} yr)`}
      </h2>
      <div className="grid grid-cols-5 gap-2 mb-5">
        <Metric label={t('summary.netProfit', { years: holdingYears })}
          value={fmtILSShort(s.totalNetProfit)}
          sub={`${isHe ? 'מכירה' : 'Sale'} ${fmtILSShort(lastRow?.propertyValue ?? 0)}`} />
        <Metric label={t('summary.capitalGainsTax')}
          value={s.capitalGainsTax > 0 ? fmtILSShort(s.capitalGainsTax) : t('summary.capitalGainsTaxExempt')}
          sub={s.capitalGainsTax > 0 ? t('summary.capitalGainsTaxSubAdditional') : t('summary.capitalGainsTaxSubFirst')} />
        <Metric label={t('summary.roi')} value={fmtPct(s.roi)} sub={t('summary.roiSub')} />
        <Metric label={t('summary.irr')}
          value={isNaN(s.irr) ? '—' : fmtPct(s.irr * 100)}
          sub={t('summary.irrSub')} />
        <Metric label={t('summary.equityMultiple')} value={fmtX(s.equityMultiple)}
          sub={s.breakEvenYear ? t('summary.breakEven', { year: s.breakEvenYear }) : t('summary.noBreakEven')} />
      </div>

      {/* ── Mortgage Tranches ── */}
      {tranches.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            {t('trancheTable.title')}
          </h2>
          <table className="w-full text-xs border border-gray-300 mb-5">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-right">{t('trancheTable.label')}</th>
                <th className="border border-gray-300 px-2 py-1 text-right">{t('trancheTable.type')}</th>
                <th className="border border-gray-300 px-2 py-1 text-right">{t('trancheTable.amount')}</th>
                <th className="border border-gray-300 px-2 py-1 text-right">{t('trancheTable.monthlyPayment')}</th>
                <th className="border border-gray-300 px-2 py-1 text-right">{t('trancheTable.interestHolding')}</th>
                <th className="border border-gray-300 px-2 py-1 text-right">{t('trancheTable.totalPaidHolding')}</th>
              </tr>
            </thead>
            <tbody>
              {tranches.map(tranche => {
                const schedule = result.trancheSchedules.find(sc => sc.trancheId === tranche.id);
                const month1Payment = schedule?.rows[0]?.payment ?? 0;
                const cappedMonths = Math.min(holdingYears * 12, schedule?.rows.length ?? 0);
                const interestHolding = schedule
                  ? schedule.rows.slice(0, cappedMonths).reduce((sum, r) => sum + r.interest, 0)
                  : 0;
                const totalPaidHolding = schedule
                  ? schedule.rows.slice(0, cappedMonths).reduce((sum, r) => sum + r.payment, 0)
                  : 0;
                return (
                  <tr key={tranche.id}>
                    <td className="border border-gray-300 px-2 py-1 font-medium">{tranche.label}</td>
                    <td className="border border-gray-300 px-2 py-1">{typeLabel(tranche.type)}</td>
                    <td className="border border-gray-300 px-2 py-1">{fmtILSShort(tranche.amount)}</td>
                    <td className="border border-gray-300 px-2 py-1">{fmtILS(month1Payment)}</td>
                    <td className="border border-gray-300 px-2 py-1">{fmtILSShort(interestHolding)}</td>
                    <td className="border border-gray-300 px-2 py-1">{fmtILSShort(totalPaidHolding)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {/* ── Yearly Detail ── */}
      <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        {t('table.title')}
      </h2>
      <table className="w-full text-xs border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.year')}</th>
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.grossRent')}</th>
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.mortgagePayment')}</th>
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.interest')}</th>
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.netCashflow')}</th>
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.propertyValue')}</th>
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.mortgageBalance')}</th>
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.equity')}</th>
            <th className="border border-gray-300 px-2 py-1 text-right">{t('table.cumulativeCashflow')}</th>
          </tr>
        </thead>
        <tbody>
          {result.yearlyRows.map(r => (
            <tr key={r.year} className={r.netCashflow < 0 ? 'bg-red-50' : ''}>
              <td className="border border-gray-300 px-2 py-1 font-medium text-center">{r.year}</td>
              <td className="border border-gray-300 px-2 py-1">{fmtILS(r.grossRentalIncome)}</td>
              <td className="border border-gray-300 px-2 py-1">{fmtILS(r.mortgagePayment)}</td>
              <td className="border border-gray-300 px-2 py-1">{fmtILS(r.interestPaid)}</td>
              <td className={`border border-gray-300 px-2 py-1 font-semibold ${r.netCashflow < 0 ? 'text-red-700' : 'text-green-700'}`}>
                {fmtILS(r.netCashflow)}
              </td>
              <td className="border border-gray-300 px-2 py-1">{fmtILS(r.propertyValue)}</td>
              <td className="border border-gray-300 px-2 py-1">{fmtILS(r.mortgageBalance)}</td>
              <td className="border border-gray-300 px-2 py-1">{fmtILS(r.equity)}</td>
              <td className={`border border-gray-300 px-2 py-1 font-semibold ${r.cumulativeNetCashflow < 0 ? 'text-red-700' : 'text-green-700'}`}>
                {fmtILS(r.cumulativeNetCashflow)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Footer ── */}
      <div className="mt-4 pt-3 border-t border-gray-300 text-xs text-gray-400 text-center">
        {t('app.title')} — {date}
      </div>
    </div>
  );
}
