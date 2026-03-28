import { useId } from 'react';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function SelectField<T extends string>({ label, value, options, onChange, className = '' }: Props<T>) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-xs font-medium text-gray-400">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-sm text-white outline-none focus:border-blue-500 transition-colors"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
