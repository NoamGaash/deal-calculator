import { useTranslation } from 'react-i18next';
import type { BoIRatePeriod } from '../../types';

interface Props {
  periods: BoIRatePeriod[];
  durationYears: number;
  onChange: (periods: BoIRatePeriod[]) => void;
  label?: string;
}

export function BoIRatePeriods({ periods, durationYears, onChange, label }: Props) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('mortgage.boiRates');

  const addPeriod = () => {
    const last = periods[periods.length - 1];
    const fromYear = last ? last.toYear + 1 : 1;
    onChange([
      ...periods,
      { id: crypto.randomUUID(), fromYear, toYear: durationYears, rate: 3.5 },
    ]);
  };

  const update = (id: string, key: keyof BoIRatePeriod, value: number) => {
    onChange(periods.map(p => p.id === id ? { ...p, [key]: value } : p));
  };

  const remove = (id: string) => {
    onChange(periods.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-400">{resolvedLabel}</label>
        <button
          onClick={addPeriod}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {t('mortgage.addPeriod')}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {periods.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 bg-gray-700 rounded-md px-2 py-1.5">
            <span className="text-xs text-gray-500 w-4">{i + 1}.</span>
            <div className="flex items-center gap-1 flex-1">
              <span className="text-xs text-gray-400">{t('mortgage.year')}</span>
              <input
                type="number"
                value={p.fromYear}
                onChange={e => update(p.id, 'fromYear', parseInt(e.target.value) || 1)}
                min={1}
                max={durationYears}
                className="w-12 bg-gray-600 rounded px-1 py-0.5 text-xs text-white text-center"
              />
              <span className="text-xs text-gray-400">–</span>
              <input
                type="number"
                value={p.toYear}
                onChange={e => update(p.id, 'toYear', parseInt(e.target.value) || 1)}
                min={1}
                max={durationYears}
                className="w-12 bg-gray-600 rounded px-1 py-0.5 text-xs text-white text-center"
              />
              <span className="text-xs text-gray-400">:</span>
              <input
                type="number"
                value={p.rate}
                onChange={e => update(p.id, 'rate', parseFloat(e.target.value) || 0)}
                min={0}
                max={20}
                step={0.25}
                className="w-16 bg-gray-600 rounded px-1 py-0.5 text-xs text-white text-center"
              />
              <span className="text-xs text-gray-400">%</span>
            </div>
            {periods.length > 1 && (
              <button
                onClick={() => remove(p.id)}
                className="text-red-500 hover:text-red-400 text-xs ml-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
