import { useTranslation } from 'react-i18next';
import { SectionCard } from '../ui/SectionCard';
import type { RenovationEntry, TimingUnit } from '../../types';
import { renovationToMonths } from '../../types';
import { fmtILS } from '../../utils/formatters';

interface Props {
  entries: RenovationEntry[];
  onChange: (entries: RenovationEntry[]) => void;
}

export function RenovationSection({ entries, onChange }: Props) {
  const { t } = useTranslation();

  const TIMING_UNITS: { value: TimingUnit; label: string }[] = [
    { value: 'days', label: t('renovations.days') },
    { value: 'months', label: t('renovations.months') },
    { value: 'years', label: t('renovations.years') },
  ];

  const add = () => {
    onChange([
      ...entries,
      {
        id: crypto.randomUUID(),
        title: '',
        estimatedCost: 0,
        timingValue: 0,
        timingUnit: 'months',
        multiplier: 1.4,
      },
    ]);
  };

  const update = (id: string, patch: Partial<RenovationEntry>) => {
    onChange(entries.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const remove = (id: string) => onChange(entries.filter(e => e.id !== id));

  const total = entries.reduce((s, e) => s + e.estimatedCost, 0);

  return (
    <SectionCard title={t('renovations.title')} badge={entries.length > 0 ? `${entries.length}` : undefined}>
      <div className="flex flex-col gap-3">
        {entries.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">{t('renovations.empty')}</p>
        )}

        {entries.map((entry) => {
          const isInitial = renovationToMonths(entry) <= 0;
          return (
          <div key={entry.id} className={`flex flex-col gap-2 border rounded-lg p-2.5 ${isInitial ? 'bg-blue-900/20 border-blue-800' : 'bg-gray-700 border-gray-600'}`}>
            <div className="flex items-center gap-2">
              <input
                value={entry.title}
                onChange={e => update(entry.id, { title: e.target.value })}
                aria-label={t('renovations.titleLabel')}
                placeholder={t('renovations.titleLabel')}
                className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={() => remove(entry.id)}
                className="text-gray-500 hover:text-red-400 text-sm transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Cost — full width */}
            <div className="flex items-center bg-gray-600 border border-gray-500 rounded overflow-hidden">
              <span className="px-2 text-gray-400 text-xs border-l border-gray-500 select-none">₪</span>
              <input
                type="number"
                dir="ltr"
                value={entry.estimatedCost}
                onChange={e => update(entry.id, { estimatedCost: parseFloat(e.target.value) || 0 })}
                aria-label={t('renovations.cost')}
                placeholder={t('renovations.cost')}
                min={0}
                step={1000}
                className="flex-1 bg-transparent px-2 py-1 text-sm text-white outline-none min-w-0"
              />
            </div>

            {/* Value multiplier */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 flex-shrink-0">{t('renovations.multiplierLabel')}</span>
              <input
                type="number"
                dir="ltr"
                value={entry.multiplier}
                onChange={e => update(entry.id, { multiplier: parseFloat(e.target.value) || 1 })}
                aria-label={t('renovations.multiplierLabel')}
                min={0}
                max={5}
                step={0.1}
                className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white outline-none text-center"
              />
              <span className="text-xs text-gray-400">×</span>
              {entry.multiplier > 1 && (
                <span className="text-xs text-green-400">
                  +{fmtILS(entry.estimatedCost * (entry.multiplier - 1))} {t('renovations.forcedEquity')}
                </span>
              )}
            </div>

            {/* Timing */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 flex-shrink-0">{t('renovations.after')}</span>
              <input
                type="number"
                dir="ltr"
                value={entry.timingValue}
                onChange={e => update(entry.id, { timingValue: parseFloat(e.target.value) || 0 })}
                aria-label={t('renovations.timing')}
                min={0}
                step={1}
                className="w-14 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white outline-none text-center"
              />
              <select
                value={entry.timingUnit}
                onChange={e => update(entry.id, { timingUnit: e.target.value as TimingUnit })}
                className="bg-gray-600 border border-gray-500 rounded px-1.5 py-1 text-sm text-white outline-none focus:border-blue-500"
              >
                {TIMING_UNITS.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            {isInitial && (
              <span className="text-xs text-blue-400">{t('renovations.initialBadge')}</span>
            )}
          </div>
          );
        })}

        <button
          onClick={add}
          className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
        >
          {t('renovations.add')}
        </button>

        {total > 0 && (
          <div className="flex items-center justify-between text-sm bg-gray-700 border border-gray-600 rounded-md px-3 py-2">
            <span className="text-gray-400">{t('renovations.total')}</span>
            <span className="text-orange-400 font-semibold">{fmtILS(total)}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
