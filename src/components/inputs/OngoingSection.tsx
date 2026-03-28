import { useTranslation } from 'react-i18next';
import { SectionCard } from '../ui/SectionCard';
import { InputField } from '../ui/InputField';
import type { RentalIncome, OngoingExpenses } from '../../types';

interface Props {
  rental: RentalIncome;
  expenses: OngoingExpenses;
  onRentalChange: (r: RentalIncome) => void;
  onExpensesChange: (e: OngoingExpenses) => void;
}

export function OngoingSection({ rental, expenses, onRentalChange, onExpensesChange }: Props) {
  const { t } = useTranslation();
  const updateRental = <K extends keyof RentalIncome>(key: K, value: RentalIncome[K]) =>
    onRentalChange({ ...rental, [key]: value });
  const updateExpenses = <K extends keyof OngoingExpenses>(key: K, value: OngoingExpenses[K]) =>
    onExpensesChange({ ...expenses, [key]: value });

  const annualRent = rental.monthlyRent * 12;
  const effectiveAnnualRent = annualRent * (1 - rental.vacancyRatePct / 100);

  return (
    <SectionCard title={t('ongoing.title')}>
      <div className="flex flex-col gap-4">
        {/* Rental income */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('ongoing.rentalIncome')}</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={t('ongoing.monthlyRent')}
              value={rental.monthlyRent}
              onChange={v => updateRental('monthlyRent', v)}
              prefix="₪"
              min={0} step={100}
            />
            <InputField
              label={t('ongoing.rentIncrease')}
              value={rental.annualIncreaseRate}
              onChange={v => updateRental('annualIncreaseRate', v)}
              suffix={t('ongoing.rentIncreaseSuffix')}
              min={0} max={20} step={0.5}
            />
            <InputField
              label={t('ongoing.vacancy')}
              value={rental.vacancyRatePct}
              onChange={v => updateRental('vacancyRatePct', v)}
              suffix="%"
              min={0} max={50} step={1}
              tooltip={t('ongoing.vacancyTooltip')}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">{t('ongoing.netAnnual')}</label>
              <div className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-sm text-green-400 font-medium">
                ₪{Math.round(effectiveAnnualRent).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Operating expenses */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t('ongoing.opex')}</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={t('ongoing.maintenance')}
              value={expenses.monthlyMaintenance}
              onChange={v => updateExpenses('monthlyMaintenance', v)}
              prefix="₪"
              min={0} step={50}
            />
            <InputField
              label={t('ongoing.management')}
              value={expenses.propertyManagementPct}
              onChange={v => updateExpenses('propertyManagementPct', v)}
              suffix={t('ongoing.managementSuffix')}
              min={0} max={15} step={0.5}
            />
            <InputField
              label={t('ongoing.lifeInsurance')}
              value={expenses.monthlyLifeInsurance}
              onChange={v => updateExpenses('monthlyLifeInsurance', v)}
              prefix="₪"
              min={0} step={10}
            />
            <InputField
              label={t('ongoing.propertyInsurance')}
              value={expenses.monthlyPropertyInsurance}
              onChange={v => updateExpenses('monthlyPropertyInsurance', v)}
              prefix="₪"
              min={0} step={10}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
