import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { YearlyRow, MortgageTranche } from '../../../types';
import { fmtILSShort } from '../../../utils/formatters';

const COLORS = ['#60a5fa', '#34d399', '#f97316', '#a78bfa', '#fb7185', '#facc15'];

interface Props {
  yearlyRows: YearlyRow[];
  tranches: MortgageTranche[];
}

export function MortgageBalanceChart({ yearlyRows, tranches }: Props) {
  const { t } = useTranslation();

  const keyTotal = t('charts.total');

  const data = yearlyRows.map(r => {
    const point: Record<string, number | string> = { year: t('charts.yearLabel', { year: r.year }) };
    for (const tr of tranches) {
      point[tr.label] = Math.round(r.trancheBalances[tr.id] ?? 0);
    }
    point[keyTotal] = Math.round(r.mortgageBalance);
    return point;
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">{t('charts.mortgageTitle')}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <YAxis tickFormatter={v => fmtILSShort(v)} tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#f3f4f6' }}
            formatter={(v: unknown) => [fmtILSShort(Number(v)), '']}
          />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
          {tranches.map((tr, i) => (
            <Area
              key={tr.id}
              type="monotone"
              dataKey={tr.label}
              stackId="1"
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
