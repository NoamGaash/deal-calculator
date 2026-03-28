import { useTranslation } from 'react-i18next';
import type { MortgageType, MortgageTranche, TrancheSchedule } from '../../types';
import { fmtILS, fmtILSShort } from '../../utils/formatters';

const TYPE_KEY: Record<MortgageType, string> = {
  prime: 'mortgage.typePrime',
  fixed_unlinked: 'mortgage.typeFixed',
  fixed_cpi: 'mortgage.typeFixedCpi',
  variable: 'mortgage.typeVariable',
};

interface Props {
  trancheSchedules: TrancheSchedule[];
  tranches: MortgageTranche[];
  holdingMonths: number;
}

export function TrancheSummaryTable({ trancheSchedules, tranches, holdingMonths }: Props) {
  const { t } = useTranslation();

  if (tranches.length === 0) return null;

  const rows = tranches.map(tranche => {
    const schedule = trancheSchedules.find(s => s.trancheId === tranche.id);
    const month1Payment = schedule?.rows[0]?.payment ?? 0;
    const cappedMonths = Math.min(holdingMonths, schedule?.rows.length ?? 0);
    const interestHolding = schedule
      ? schedule.rows.slice(0, cappedMonths).reduce((s, r) => s + r.interest, 0)
      : 0;
    const totalPaidHolding = schedule
      ? schedule.rows.slice(0, cappedMonths).reduce((s, r) => s + r.payment, 0)
      : 0;
    return { tranche, month1Payment, interestHolding, totalPaidHolding };
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-200 px-4 py-3 border-b border-gray-700">
        {t('trancheTable.title')}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-700 text-gray-400">
              <th className="px-3 py-2 text-right font-medium">{t('trancheTable.label')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('trancheTable.type')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('trancheTable.amount')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('trancheTable.monthlyPayment')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('trancheTable.interestHolding')}</th>
              <th className="px-3 py-2 text-right font-medium">{t('trancheTable.totalPaidHolding')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ tranche, month1Payment, interestHolding, totalPaidHolding }) => (
              <tr key={tranche.id} className="border-t border-gray-700 hover:bg-gray-700/40 transition-colors">
                <td className="px-3 py-2 text-gray-200 font-medium">{tranche.label}</td>
                <td className="px-3 py-2 text-gray-400">{t(TYPE_KEY[tranche.type])}</td>
                <td className="px-3 py-2 text-blue-400">{fmtILSShort(tranche.amount)}</td>
                <td className="px-3 py-2 text-gray-200">{fmtILS(month1Payment)}</td>
                <td className="px-3 py-2 text-orange-400">{fmtILSShort(interestHolding)}</td>
                <td className="px-3 py-2 text-gray-200">{fmtILSShort(totalPaidHolding)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
