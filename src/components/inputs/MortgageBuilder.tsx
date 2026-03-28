import { SectionCard } from '../ui/SectionCard';
import { MortgancheTranche } from './MortgageTranche';
import type { MortgageTranche } from '../../types';
import { newTranche } from '../../constants/defaults';
import { fmtILS } from '../../utils/formatters';

interface Props {
  tranches: MortgageTranche[];
  propertyPrice: number;
  equity: number;
  onChange: (tranches: MortgageTranche[]) => void;
}

export function MortgageBuilder({ tranches, propertyPrice, equity, onChange }: Props) {
  const totalMortgage = tranches.reduce((s, t) => s + t.amount, 0);
  const maxMortgage = propertyPrice - equity;
  const overLimit = totalMortgage > maxMortgage * 1.01;

  const addTranche = () => {
    const remaining = Math.max(0, maxMortgage - totalMortgage);
    onChange([...tranches, newTranche({ label: `מסלול ${tranches.length + 1}`, amount: remaining })]);
  };

  const updateTranche = (id: string, updated: MortgageTranche) => {
    onChange(tranches.map(t => t.id === id ? updated : t));
  };

  const removeTranche = (id: string) => {
    onChange(tranches.filter(t => t.id !== id));
  };

  return (
    <SectionCard title="מבנה המשכנתא" badge={`${tranches.length} מסלולים`}>
      <div className="flex flex-col gap-3">
        {/* Summary bar */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">סה"כ משכנתא:</span>
          <span className={`font-semibold ${overLimit ? 'text-red-400' : 'text-white'}`}>
            {fmtILS(totalMortgage)}
            {overLimit && <span className="text-red-400 text-xs mr-1">(חורג!)</span>}
          </span>
        </div>
        {overLimit && (
          <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-2 py-1">
            סה"כ המשכנתא ({fmtILS(totalMortgage)}) חורג מהמימון הנדרש ({fmtILS(maxMortgage)})
          </div>
        )}

        {tranches.map((t, i) => (
          <MortgancheTranche
            key={t.id}
            tranche={t}
            index={i}
            onChange={updated => updateTranche(t.id, updated)}
            onRemove={() => removeTranche(t.id)}
            canRemove={tranches.length > 1}
          />
        ))}

        <button
          onClick={addTranche}
          className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
        >
          + הוסף מסלול
        </button>
      </div>
    </SectionCard>
  );
}
