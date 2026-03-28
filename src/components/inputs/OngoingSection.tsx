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
  const updateRental = <K extends keyof RentalIncome>(key: K, value: RentalIncome[K]) =>
    onRentalChange({ ...rental, [key]: value });
  const updateExpenses = <K extends keyof OngoingExpenses>(key: K, value: OngoingExpenses[K]) =>
    onExpensesChange({ ...expenses, [key]: value });

  const annualRent = rental.monthlyRent * 12;
  const effectiveAnnualRent = annualRent * (1 - rental.vacancyRatePct / 100);

  return (
    <SectionCard title="הכנסות והוצאות שוטפות">
      <div className="flex flex-col gap-4">
        {/* Rental income */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">הכנסה משכירות</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="שכר דירה חודשי"
              value={rental.monthlyRent}
              onChange={v => updateRental('monthlyRent', v)}
              prefix="₪"
              min={0} step={100}
            />
            <InputField
              label="עליית שכר דירה"
              value={rental.annualIncreaseRate}
              onChange={v => updateRental('annualIncreaseRate', v)}
              suffix="% / שנה"
              min={0} max={20} step={0.5}
            />
            <InputField
              label="ריקנות"
              value={rental.vacancyRatePct}
              onChange={v => updateRental('vacancyRatePct', v)}
              suffix="%"
              min={0} max={50} step={1}
              tooltip="% מהזמן שהדירה ריקה"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">הכנסה שנתית נטו</label>
              <div className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-sm text-green-400 font-medium">
                ₪{Math.round(effectiveAnnualRent).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Operating expenses */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">הוצאות תפעוליות</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="תחזוקה חודשית"
              value={expenses.monthlyMaintenance}
              onChange={v => updateExpenses('monthlyMaintenance', v)}
              prefix="₪"
              min={0} step={50}
            />
            <InputField
              label="ניהול נכס"
              value={expenses.propertyManagementPct}
              onChange={v => updateExpenses('propertyManagementPct', v)}
              suffix="% משכ״ד"
              min={0} max={15} step={0.5}
            />
            <InputField
              label="ביטוח חיים"
              value={expenses.monthlyLifeInsurance}
              onChange={v => updateExpenses('monthlyLifeInsurance', v)}
              prefix="₪"
              min={0} step={10}
            />
            <InputField
              label="ביטוח נכס"
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
