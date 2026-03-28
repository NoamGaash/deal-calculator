import { useMemo } from 'react';
import { useScenarioStore } from './store/useScenarioStore';
import { runCalculation } from './calculations/index';
import { ScenarioPanel } from './components/scenarios/ScenarioPanel';
import { PropertySection } from './components/inputs/PropertySection';
import { PurchaseCostsSection } from './components/inputs/PurchaseCostsSection';
import { RenovationSection } from './components/inputs/RenovationSection';
import { MortgageBuilder } from './components/inputs/MortgageBuilder';
import { OngoingSection } from './components/inputs/OngoingSection';
import { ResultsPanel } from './components/results/ResultsPanel';
import type { ScenarioData } from './types';

export default function App() {
  const { current, updateCurrent } = useScenarioStore();

  const result = useMemo(() => {
    try {
      return runCalculation(current);
    } catch {
      return null;
    }
  }, [current]);

  const update = <K extends keyof ScenarioData>(key: K, value: ScenarioData[K]) =>
    updateCurrent({ ...current, [key]: value });

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden" dir="rtl">
      {/* Sidebar — scenarios */}
      <aside className="w-52 flex-shrink-0 border-l border-gray-700 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-base font-bold text-white">מחשבון עסקה</h1>
          <p className="text-xs text-gray-400">נדל"ן להשקעה</p>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScenarioPanel />
        </div>
      </aside>

      {/* Inputs panel */}
      <main className="w-80 flex-shrink-0 border-l border-gray-700 overflow-y-auto min-h-0 space-y-3 p-3">
        <PropertySection
          data={current.property}
          onChange={v => update('property', v)}
        />
        <PurchaseCostsSection
          data={current.purchaseCosts}
          property={current.property}
          onChange={v => update('purchaseCosts', v)}
        />
        <RenovationSection
          entries={current.renovations}
          onChange={v => update('renovations', v)}
        />
        <MortgageBuilder
          tranches={current.mortgageTranches}
          propertyPrice={current.property.price}
          equity={current.property.equity}
          onChange={v => update('mortgageTranches', v)}
        />
        <OngoingSection
          rental={current.rental}
          expenses={current.expenses}
          onRentalChange={v => update('rental', v)}
          onExpensesChange={v => update('expenses', v)}
        />
      </main>

      {/* Results panel */}
      <section className="flex-1 overflow-y-auto min-h-0 p-4">
        {result ? (
          <ResultsPanel
            result={result}
            tranches={current.mortgageTranches}
            holdingYears={current.property.holdingPeriodYears}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            שגיאה בחישוב — אנא בדוק את הנתונים
          </div>
        )}
      </section>
    </div>
  );
}
