import { useState } from 'react';
import type { MortgageTranche as MortgageTrancheType, MortgageType } from '../../types';
import { InputField } from '../ui/InputField';
import { SelectField } from '../ui/SelectField';
import { BoIRatePeriods } from './BoIRatePeriods';
import { fmtILS, fmtMonths } from '../../utils/formatters';

const TYPE_OPTIONS: { value: MortgageType; label: string }[] = [
  { value: 'prime', label: 'פריים' },
  { value: 'fixed_unlinked', label: 'קבועה לא צמודה' },
  { value: 'fixed_cpi', label: 'קבועה צמודה' },
  { value: 'variable', label: 'משתנה כל X שנים' },
];

interface Props {
  tranche: MortgageTrancheType;
  index: number;
  onChange: (t: MortgageTrancheType) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function MortgancheTranche({ tranche: t, index, onChange, onRemove, canRemove }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const update = <K extends keyof MortgageTrancheType>(key: K, value: MortgageTrancheType[K]) =>
    onChange({ ...t, [key]: value });

  const durationYears = Math.ceil(t.durationMonths / 12);
  const isPrimeOrVariable = t.type === 'prime' || t.type === 'variable';

  const rateLabel =
    t.type === 'prime' ? 'מרווח מפריים' :
    t.type === 'variable' ? 'מרווח מבסיס' :
    'ריבית שנתית';

  const spreadHint = isPrimeOrVariable
    ? `P${t.interestRate >= 0 ? '+' : ''}${t.interestRate}%`
    : undefined;

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-700">
        <span className="text-xs text-gray-400 w-5">{index + 1}</span>
        <input
          value={t.label}
          onChange={e => update('label', e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium text-gray-100 outline-none"
          placeholder="שם המסלול"
        />
        <span className="text-xs text-gray-400">{fmtILS(t.amount)} · {fmtMonths(t.durationMonths)}</span>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-xs text-gray-400 hover:text-gray-200 w-5"
        >
          {collapsed ? '▼' : '▲'}
        </button>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-400 w-5"
          >
            ✕
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pb-3 pt-2 bg-gray-750 bg-gray-800 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="סוג המסלול"
              value={t.type}
              options={TYPE_OPTIONS}
              onChange={v => update('type', v)}
            />
            <InputField
              label="סכום"
              value={t.amount}
              onChange={v => update('amount', v)}
              prefix="₪"
              min={0} step={10000}
            />
            <InputField
              label={rateLabel}
              value={t.interestRate}
              onChange={v => update('interestRate', v)}
              suffix="%"
              min={isPrimeOrVariable ? -5 : 0} max={20} step={0.1}
              hint={spreadHint}
            />
            <InputField
              label="תקופה"
              value={t.durationMonths}
              onChange={v => update('durationMonths', Math.round(v))}
              suffix="חודשים"
              min={12} max={480} step={12}
            />
            {t.type === 'variable' && (
              <InputField
                label="שינוי ריבית כל"
                value={t.rateChangeEveryYears}
                onChange={v => update('rateChangeEveryYears', Math.round(v))}
                suffix="שנים"
                min={1} max={10} step={1}
              />
            )}
            {t.type === 'fixed_cpi' && (
              <InputField
                label="אינפלציה שנתית נניחה"
                value={t.assumedAnnualCpiPct}
                onChange={v => update('assumedAnnualCpiPct', v)}
                suffix="%"
                min={0} max={10} step={0.25}
              />
            )}
          </div>

          {isPrimeOrVariable && (
            <BoIRatePeriods
              periods={t.boiRatePeriods}
              durationYears={durationYears}
              onChange={periods => update('boiRatePeriods', periods)}
              label={t.type === 'prime' ? 'ריבית בנק ישראל לפי תקופה' : 'ריבית בסיס לפי תקופה'}
            />
          )}

          <button
            onClick={onRemove}
            disabled={!canRemove}
            className="w-full py-1.5 text-xs rounded border border-dashed border-red-800 text-red-500 hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            הסר מסלול
          </button>
        </div>
      )}
    </div>
  );
}
