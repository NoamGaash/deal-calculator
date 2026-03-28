import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { YearlyRow, MortgageTranche } from '../../../types';
import { fmtILSShort } from '../../../utils/formatters';

const COLORS = ['#60a5fa', '#34d399', '#f97316', '#a78bfa', '#fb7185', '#facc15'];

interface Props {
  yearlyRows: YearlyRow[];
  tranches: MortgageTranche[];
}

export function MortgageBalanceChart({ yearlyRows, tranches }: Props) {
  const data = yearlyRows.map(r => {
    const point: Record<string, number | string> = { year: `שנה ${r.year}` };
    for (const t of tranches) {
      point[t.label] = Math.round(r.trancheBalances[t.id] ?? 0);
    }
    point['סה"כ'] = Math.round(r.mortgageBalance);
    return point;
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">יתרת משכנתא לאורך זמן</h3>
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
          {tranches.map((t, i) => (
            <Area
              key={t.id}
              type="monotone"
              dataKey={t.label}
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
