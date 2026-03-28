import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { YearlyRow } from '../../../types';
import { fmtILSShort } from '../../../utils/formatters';

interface Props {
  yearlyRows: YearlyRow[];
}

export function CashflowChart({ yearlyRows }: Props) {
  const { t } = useTranslation();
  const hasRenovations = yearlyRows.some(r => r.renovationCost > 0);

  const keyRent = t('charts.rent');
  const keyMortgage = t('charts.mortgagePayment');
  const keyOtherExpenses = t('charts.otherExpenses');
  const keyRenovations = t('charts.renovations');
  const keyNetCashflow = t('charts.netCashflow');

  const data = yearlyRows.map(r => ({
    year: t('charts.yearLabel', { year: r.year }),
    [keyRent]: Math.round(r.effectiveRentalIncome),
    [keyMortgage]: -Math.round(r.mortgagePayment),
    [keyOtherExpenses]: -Math.round(r.maintenanceCost + r.managementFee + r.insuranceCost),
    [keyRenovations]: -Math.round(r.renovationCost),
    [keyNetCashflow]: Math.round(r.netCashflow),
  }));

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-4">{t('charts.cashflowTitle')}</h3>
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
          <Bar dataKey={keyRent} fill="#10b981" stackId="income" radius={[4, 4, 0, 0]} />
          <Bar dataKey={keyMortgage} fill="#ef4444" stackId="expenses" />
          <Bar dataKey={keyOtherExpenses} fill="#f97316" stackId="expenses" radius={hasRenovations ? [0,0,0,0] : [0,0,4,4]} />
          {hasRenovations && <Bar dataKey={keyRenovations} fill="#a78bfa" stackId="expenses" radius={[0, 0, 4, 4]} />}
          <Line dataKey={keyNetCashflow} stroke="#60a5fa" strokeWidth={2} dot={false} type="monotone" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
