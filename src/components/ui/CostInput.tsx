import { useId } from 'react';
import type { CostValue, CostUnit } from '../../types';

interface Props {
  label: string;
  value: CostValue;
  onChange: (value: CostValue) => void;
  tooltip?: string;
  className?: string;
}

export function CostInput({ label, value, onChange, tooltip, className = '' }: Props) {
  const id = useId();
  const setUnit = (unit: CostUnit) => onChange({ ...value, unit });
  const setValue = (v: number) => onChange({ ...value, value: v });

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-xs font-medium text-gray-400 flex items-center gap-1">
        {label}
        {tooltip && (
          <span title={tooltip} className="cursor-help text-gray-500 hover:text-gray-300">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <text x="8" y="12" textAnchor="middle" fontSize="10" fontWeight="bold">i</text>
            </svg>
          </span>
        )}
      </label>
      <div className="flex items-center bg-gray-700 border border-gray-600 rounded-md focus-within:border-blue-500 transition-colors overflow-hidden">
        {/* Unit toggle */}
        <div className="flex border-r border-gray-600 flex-shrink-0">
          <button
            type="button"
            onClick={() => setUnit('nis')}
            className={`px-2 py-1.5 text-xs font-medium transition-colors ${
              value.unit === 'nis'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ₪
          </button>
          <button
            type="button"
            onClick={() => setUnit('pct')}
            className={`px-2 py-1.5 text-xs font-medium transition-colors border-r border-gray-600 ${
              value.unit === 'pct'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            %
          </button>
        </div>
        <input
          id={id}
          type="number"
          dir="ltr"
          value={value.value}
          onChange={e => setValue(parseFloat(e.target.value) || 0)}
          min={0}
          step={value.unit === 'pct' ? 0.1 : 100}
          className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white outline-none min-w-0"
        />
      </div>
    </div>
  );
}
