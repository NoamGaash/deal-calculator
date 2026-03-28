import { SectionCard } from '../ui/SectionCard';
import type { RenovationEntry, TimingUnit } from '../../types';
import { fmtILS } from '../../utils/formatters';

interface Props {
  entries: RenovationEntry[];
  onChange: (entries: RenovationEntry[]) => void;
}

const TIMING_UNITS: { value: TimingUnit; label: string }[] = [
  { value: 'days', label: 'ימים' },
  { value: 'months', label: 'חודשים' },
  { value: 'years', label: 'שנים' },
];

export function RenovationSection({ entries, onChange }: Props) {
  const add = () => {
    onChange([
      ...entries,
      {
        id: crypto.randomUUID(),
        title: '',
        estimatedCost: 0,
        timingValue: 0,
        timingUnit: 'months',
      },
    ]);
  };

  const update = (id: string, patch: Partial<RenovationEntry>) => {
    onChange(entries.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const remove = (id: string) => onChange(entries.filter(e => e.id !== id));

  const total = entries.reduce((s, e) => s + e.estimatedCost, 0);

  return (
    <SectionCard title="שיפוצים" badge={entries.length > 0 ? `${entries.length}` : undefined}>
      <div className="flex flex-col gap-3">
        {entries.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">אין שיפוצים מתוכננים</p>
        )}

        {entries.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-2 bg-gray-700 border border-gray-600 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <input
                value={entry.title}
                onChange={e => update(entry.id, { title: e.target.value })}
                placeholder="כותרת שיפוץ"
                className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={() => remove(entry.id)}
                className="text-gray-500 hover:text-red-400 text-sm transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Cost */}
              <div className="flex items-center bg-gray-600 border border-gray-500 rounded overflow-hidden flex-1">
                <span className="px-2 text-gray-400 text-xs border-l border-gray-500 select-none">₪</span>
                <input
                  type="number"
                  value={entry.estimatedCost}
                  onChange={e => update(entry.id, { estimatedCost: parseFloat(e.target.value) || 0 })}
                  placeholder="עלות מוערכת"
                  min={0}
                  step={1000}
                  className="flex-1 bg-transparent px-2 py-1 text-sm text-white outline-none min-w-0"
                />
              </div>

              {/* Timing */}
              <span className="text-xs text-gray-400 flex-shrink-0">לאחר</span>
              <input
                type="number"
                value={entry.timingValue}
                onChange={e => update(entry.id, { timingValue: parseFloat(e.target.value) || 0 })}
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
          </div>
        ))}

        <button
          onClick={add}
          className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
        >
          + הוסף שיפוץ
        </button>

        {total > 0 && (
          <div className="flex items-center justify-between text-sm bg-gray-700 border border-gray-600 rounded-md px-3 py-2">
            <span className="text-gray-400">סה"כ שיפוצים</span>
            <span className="text-orange-400 font-semibold">{fmtILS(total)}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
