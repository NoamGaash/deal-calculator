import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { YearlyRow } from '../../../types';
import { fmtILSShort } from '../../../utils/formatters';

interface Props {
  yearlyRows: YearlyRow[];
  totalInvestment: number;
}

export function EquityChart({ yearlyRows, totalInvestment }: Props) {
  const data = yearlyRows.map(r => ({
    year: `שנה ${r.year}`,
    'ערך הנכס': Math.round(r.propertyValue),
    'יתרת משכנתא': Math.round(r.mortgageBalance),
    'הון עצמי בנכס': Math.round(r.equity),
    'רווח מצטבר': Math.round(r.cumulativeNetCashflow + r.equity - totalInvestment),
  }));

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">הון עצמי ורווח מצטבר</h3>
      <ResponsiveContainer width="100%" height={280}>
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
          <Area type="monotone" dataKey="ערך הנכס" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.15} />
          <Area type="monotone" dataKey="יתרת משכנתא" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
          <Line type="monotone" dataKey="הון עצמי בנכס" stroke="#34d399" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="רווח מצטבר" stroke="#facc15" strokeWidth={2} dot={false} strokeDasharray="5 5" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
