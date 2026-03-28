import { useId } from 'react';

interface Props {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  stepper?: boolean;
  tooltip?: string;
  hint?: string;
  className?: string;
}

export function InputField({ label, value, onChange, suffix, prefix, min, max, step = 1, stepper = false, tooltip, hint, className = '' }: Props) {
  const id = useId();
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  const decrement = () => {
    const next = Math.round((num - step) * 1e9) / 1e9;
    onChange(min !== undefined ? Math.max(min, next) : next);
  };
  const increment = () => {
    const next = Math.round((num + step) * 1e9) / 1e9;
    onChange(max !== undefined ? Math.min(max, next) : next);
  };

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
      <div className="flex items-center bg-gray-700 border border-gray-600 rounded-md focus-within:border-blue-500 transition-colors">
        {prefix && (
          <span className="px-2 text-gray-400 text-sm border-r border-gray-600 select-none">{prefix}</span>
        )}
        {stepper && (
          <button type="button" onClick={decrement} className="px-2 py-1.5 text-gray-400 hover:text-white text-sm border-r border-gray-600 select-none leading-none">−</button>
        )}
        <input
          id={id}
          type="number"
          dir="ltr"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white outline-none min-w-0"
        />
        {stepper && (
          <button type="button" onClick={increment} className="px-2 py-1.5 text-gray-400 hover:text-white text-sm border-l border-gray-600 select-none leading-none">+</button>
        )}
        {suffix && (
          <span className="px-2 text-gray-400 text-sm border-l border-gray-600 select-none whitespace-nowrap">{suffix}</span>
        )}
      </div>
      {hint && <span className="text-xs text-blue-400">{hint}</span>}
    </div>
  );
}
