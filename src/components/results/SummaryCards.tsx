import type { SummaryMetrics } from '../../types';
import { fmtILS, fmtILSShort, fmtPct, fmtX } from '../../utils/formatters';

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
  const irrColor = isNaN(s.irr) ? 'default' : s.irr > 0.08 ? 'green' : s.irr > 0.04 ? 'yellow' : 'red';
  const cashflowColor = s.initialMonthlyCashflow >= 0 ? 'green' : 'red';

  return (
    <div className="flex flex-col gap-3">
      {/* Top row — investment summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card
          label="השקעה כוללת"
          value={fmtILSShort(s.totalInvestment)}
          sub={s.totalInitialRenovations > 0 ? `הון + עלויות + שיפוצים ראשוניים` : `הון + עלויות רכישה`}
          color="blue"
        />
        <Card
          label="מס רכישה"
          value={fmtILS(s.purchaseTax)}
          sub={`מתוך ${fmtILSShort(s.totalPurchaseCosts)} עלויות`}
          color="yellow"
        />
        <Card
          label="LTV"
          value={fmtPct(s.ltvPct)}
          sub={`משכנתא ${fmtILSShort(s.totalMortgage)}`}
        />
      </div>

      {/* Middle row — cash flow */}
      <div className="grid grid-cols-3 gap-2">
        <Card
          label="תשלום חודשי (שנה 1)"
          value={fmtILS(s.monthlyMortgagePayment)}
          sub="משכנתא בלבד"
          color="yellow"
        />
        <Card
          label="תזרים חודשי נטו"
          value={fmtILS(s.initialMonthlyCashflow)}
          sub="שכירות פחות הכל"
          color={cashflowColor}
        />
        <Card
          label="תשואה ברוטו"
          value={fmtPct(s.grossYield)}
          sub={`Cap Rate ${fmtPct(s.capRate)}`}
          color="default"
        />
      </div>

      {/* Bottom row — returns */}
      <div className="grid grid-cols-4 gap-2">
        <Card
          label={`רווח נטו (${holdingYears} שנה)`}
          value={fmtILSShort(s.totalNetProfit)}
          sub={`מכירה ב-${fmtILSShort(s.projectedSalePrice)}`}
          color={s.totalNetProfit >= 0 ? 'green' : 'red'}
        />
        <Card
          label="ROI"
          value={fmtPct(s.roi)}
          sub={`על ההון שהושקע`}
          color={s.roi >= 0 ? 'green' : 'red'}
        />
        <Card
          label="IRR (שנתי)"
          value={isNaN(s.irr) ? '—' : fmtPct(s.irr * 100)}
          sub="תשואה פנימית"
          color={irrColor}
        />
        <Card
          label="מכפיל הון"
          value={fmtX(s.equityMultiple)}
          sub={s.breakEvenYear ? `שיבר-אבן שנה ${s.breakEvenYear}` : 'לא מגיע לשיבר-אבן'}
          color={s.equityMultiple >= 1.5 ? 'green' : 'default'}
        />
      </div>
    </div>
  );
}
