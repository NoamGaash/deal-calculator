import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { YearlyRow } from '../../../types';
import { fmtILSShort } from '../../../utils/formatters';

interface Props {
  yearlyRows: YearlyRow[];
  totalInvestment: number;
  alternativeYieldPct: number;
}

export function ComparisonChart({ yearlyRows, totalInvestment, alternativeYieldPct }: Props) {
  const { t } = useTranslation();

  const keyRealEstate = t('charts.realEstateWealth');
  const keyAlternative = t('charts.alternativeWealth', { pct: alternativeYieldPct });

  // Year 0: both lines start at totalInvestment
  const year0 = {
    year: t('charts.yearLabel', { year: 0 }),
    [keyRealEstate]: totalInvestment,
    [keyAlternative]: totalInvestment,
  };

  const data = [
    year0,
    ...yearlyRows.map(r => ({
      year: t('charts.yearLabel', { year: r.year }),
      // Real estate total wealth = equity in property + all cashflows received
      [keyRealEstate]: Math.round(r.equity + r.cumulativeNetCashflow),
      [keyAlternative]: r.alternativePortfolioValue,
    })),
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-1">{t('charts.comparisonTitle')}</h3>
      <p className="text-xs text-gray-500 mb-4">{t('charts.comparisonSubtitle')}</p>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tickFormatter={v => fmtILSShort(v)} tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(v: unknown) => [fmtILSShort(Number(v)), '']}
          />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
          <ReferenceLine
            y={totalInvestment}
            stroke="#4b5563"
            strokeDasharray="4 4"
            label={{ value: t('charts.initialInvestment'), fill: '#6b7280', fontSize: 10, position: 'insideBottomRight' }}
          />
          <Line
            type="monotone"
            dataKey={keyRealEstate}
            stroke="#60a5fa"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey={keyAlternative}
            stroke="#f97316"
            strokeWidth={2.5}
            dot={false}
            strokeDasharray="6 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
