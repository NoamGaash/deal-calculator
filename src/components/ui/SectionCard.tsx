import { useState, type ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

export function SectionCard({ title, children, defaultOpen = true, badge }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-100 text-sm">{title}</span>
          {badge && (
            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{badge}</span>
          )}
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
