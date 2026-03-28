import { useTranslation } from 'react-i18next';
import type { SummaryMetrics } from '../../types';
import { fmtILS, fmtPct, fmtX } from '../../utils/formatters';

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  color?: 'default' | 'green' | 'red' | 'yellow' | 'blue';
}

function Card({ label, value, sub, color = 'default' }: CardProps) {
  const colors = {
    default: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
  };
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex flex-col gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-lg font-bold ${colors[color]}`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

interface Props {
  summary: SummaryMetrics;
  holdingYears: number;
}

export function SummaryCards({ summary: s, holdingYears }: Props) {
  const { t } = useTranslation();
  const irrColor = isNaN(s.irr) ? 'default' : s.irr > 0.08 ? 'green' : s.irr > 0.04 ? 'yellow' : 'red';
  const cashflowColor = s.initialMonthlyCashflow >= 0 ? 'green' : 'red';

  return (
    <div className="flex flex-col gap-3">
      {/* Top row — investment summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card
          label={t('summary.totalInvestment')}
          value={fmtILS(s.totalInvestment)}
          sub={s.totalInitialRenovations > 0 ? t('summary.totalInvestmentSubReno') : t('summary.totalInvestmentSub')}
          color="blue"
        />
        <Card
          label={t('summary.purchaseTax')}
          value={fmtILS(s.purchaseTax)}
          sub={t('summary.purchaseTaxSub', { total: fmtILS(s.totalPurchaseCosts) })}
          color="yellow"
        />
        <Card
          label={t('summary.ltv')}
          value={fmtPct(s.ltvPct)}
          sub={t('summary.ltvSub', { amount: fmtILS(s.totalMortgage) })}
        />
      </div>

      {/* Middle row — cash flow */}
      <div className="grid grid-cols-3 gap-2">
        <Card
          label={t('summary.monthlyPayment')}
          value={fmtILS(s.monthlyMortgagePayment)}
          sub={t('summary.monthlyPaymentSub')}
          color="yellow"
        />
        <Card
          label={t('summary.monthlyCashflow')}
          value={fmtILS(s.initialMonthlyCashflow)}
          sub={t('summary.monthlyCashflowSub')}
          color={cashflowColor}
        />
        <Card
          label={t('summary.grossYield')}
          value={fmtPct(s.grossYield)}
          sub={t('summary.grossYieldSub', { rate: fmtPct(s.capRate) })}
          color="default"
        />
      </div>

      {/* Mortgage + tax row */}
      <div className="grid grid-cols-3 gap-2">
        <Card
          label={t('summary.totalInterest')}
          value={fmtILS(s.totalInterestPaidHolding)}
          sub={t('summary.totalInterestSub', { years: holdingYears })}
          color="yellow"
        />
        <Card
          label={t('summary.totalCashOutflow')}
          value={fmtILS(s.totalCashOutflow)}
          sub={t('summary.totalCashOutflowSub')}
        />
        <Card
          label={t('summary.rentalTax')}
          value={s.rentalTaxTrack === 'exempt' ? t('summary.rentalTaxExempt') : fmtILS(s.annualRentalTax10pct)}
          sub={
            s.rentalTaxTrack === 'exempt' ? t('summary.rentalTaxExemptSub') :
            s.rentalTaxTrack === '10pct' ? t('summary.rentalTaxSub10') :
            t('summary.rentalTaxSubMarginal')
          }
          color={s.rentalTaxTrack === 'exempt' ? 'green' : 'yellow'}
        />
      </div>

      {/* Bottom row — returns */}
      <div className="grid grid-cols-5 gap-2">
        <Card
          label={t('summary.netProfit', { years: holdingYears })}
          value={fmtILS(s.totalNetProfit)}
          sub={t('summary.netProfitSub', { price: fmtILS(s.projectedSalePrice) })}
          color={s.totalNetProfit >= 0 ? 'green' : 'red'}
        />
        <Card
          label={t('summary.capitalGainsTax')}
          value={s.capitalGainsTax > 0 ? fmtILS(s.capitalGainsTax) : t('summary.capitalGainsTaxExempt')}
          sub={s.capitalGainsTax > 0 ? t('summary.capitalGainsTaxSubAdditional') : t('summary.capitalGainsTaxSubFirst')}
          color={s.capitalGainsTax > 0 ? 'red' : 'green'}
        />
        <Card
          label={t('summary.roi')}
          value={fmtPct(s.roi)}
          sub={t('summary.roiSub')}
          color={s.roi >= 0 ? 'green' : 'red'}
        />
        <Card
          label={t('summary.irr')}
          value={isNaN(s.irr) ? '—' : fmtPct(s.irr * 100)}
          sub={t('summary.irrSub')}
          color={irrColor}
        />
        <Card
          label={t('summary.equityMultiple')}
          value={fmtX(s.equityMultiple)}
          sub={s.breakEvenYear ? t('summary.breakEven', { year: s.breakEvenYear }) : t('summary.noBreakEven')}
          color={s.equityMultiple >= 1.5 ? 'green' : 'default'}
        />
      </div>
    </div>
  );
}
