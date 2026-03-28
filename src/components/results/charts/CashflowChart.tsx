import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { YearlyRow } from '../../../types';
import { fmtILSShort } from '../../../utils/formatters';

interface Props {
  yearlyRows: YearlyRow[];
}

export function CashflowChart({ yearlyRows }: Props) {
  const hasRenovations = yearlyRows.some(r => r.renovationCost > 0);
  const data = yearlyRows.map(r => ({
    year: `שנה ${r.year}`,
    'שכירות': Math.round(r.effectiveRentalIncome),
    'משכנתא': -Math.round(r.mortgagePayment),
    'הוצאות נוספות': -Math.round(r.maintenanceCost + r.managementFee + r.insuranceCost),
    'שיפוצים': -Math.round(r.renovationCost),
    'תזרים נטו': Math.round(r.netCashflow),
  }));

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">תזרים מזומנים שנתי</h3>
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
          <ReferenceLine y={0} stroke="#6b7280" />
          <Bar dataKey="שכירות" fill="#10b981" stackId="income" radius={[4, 4, 0, 0]} />
          <Bar dataKey="משכנתא" fill="#ef4444" stackId="expenses" />
          <Bar dataKey="הוצאות נוספות" fill="#f97316" stackId="expenses" radius={hasRenovations ? [0,0,0,0] : [0,0,4,4]} />
          {hasRenovations && <Bar dataKey="שיפוצים" fill="#a78bfa" stackId="expenses" radius={[0, 0, 4, 4]} />}
          <Line dataKey="תזרים נטו" stroke="#60a5fa" strokeWidth={2} dot={false} type="monotone" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
