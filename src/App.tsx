import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScenarioStore } from './store/useScenarioStore';
import { runCalculation } from './calculations/index';
import { ScenarioPanel } from './components/scenarios/ScenarioPanel';
import { PropertySection } from './components/inputs/PropertySection';
import { PurchaseCostsSection } from './components/inputs/PurchaseCostsSection';
import { RenovationSection } from './components/inputs/RenovationSection';
import { MortgageBuilder } from './components/inputs/MortgageBuilder';
import { OngoingSection } from './components/inputs/OngoingSection';
import { ResultsPanel } from './components/results/ResultsPanel';
import { PrintView } from './components/results/PrintView';
import type { ScenarioData } from './types';

export default function App() {
  const { current, updateCurrent, scenarios, activeId } = useScenarioStore();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleLang = () => {
    const next = i18n.language === 'he' ? 'en' : 'he';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  const result = useMemo(() => {
    try {
      return runCalculation(current);
    } catch {
      return null;
    }
  }, [current]);

  const update = <K extends keyof ScenarioData>(key: K, value: ScenarioData[K]) =>
    updateCurrent({ ...current, [key]: value });

  const scenarioName = scenarios.find(s => s.id === activeId)?.name ?? t('scenarios.unsaved');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputsOpen, setInputsOpen] = useState(true);
  const isRtl = i18n.language === 'he';

  return (
    <>
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden print:hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar — scenarios */}
      <aside className={`flex-shrink-0 border-l border-gray-700 flex flex-col min-h-0 transition-all duration-200 ${sidebarOpen ? 'w-52' : 'w-10'}`}>
        {sidebarOpen ? (
          /* Expanded header */
          <div className="px-4 py-3 border-b border-gray-700 flex-shrink-0 flex items-start justify-between">
            <div>
              <h1 className="text-base font-bold text-white">{t('app.title')}</h1>
              <p className="text-xs text-gray-400">{t('app.subtitle')}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={toggleLang}
                className="text-xs px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                {isRtl ? 'EN' : 'עב'}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-200 transition-colors p-0.5"
                title="Collapse"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d={isRtl ? 'M10 3 L5 8 L10 13' : 'M6 3 L11 8 L6 13'} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed — just a toggle button */
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-1 flex items-start justify-center pt-3 text-gray-500 hover:text-gray-200 transition-colors"
            title="Expand"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d={isRtl ? 'M6 3 L11 8 L6 13' : 'M10 3 L5 8 L10 13'} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {sidebarOpen && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScenarioPanel />
          </div>
        )}
      </aside>

      {/* Inputs panel */}
      <div className={`flex-shrink-0 border-l border-gray-700 flex flex-col min-h-0 transition-all duration-200 ${inputsOpen ? 'w-96' : 'w-10'}`}>
        {/* Collapse toggle strip */}
        <div className="flex-shrink-0 border-b border-gray-700 flex items-center justify-between px-2 py-2">
          {inputsOpen && <span className="text-xs font-medium text-gray-400">{t('app.inputsTitle')}</span>}
          <button
            onClick={() => setInputsOpen(o => !o)}
            className={`text-gray-500 hover:text-gray-200 transition-colors ${!inputsOpen ? 'mx-auto' : ''}`}
            title={inputsOpen ? 'Collapse' : 'Expand'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path
                d={inputsOpen
                  ? (isRtl ? 'M10 3 L5 8 L10 13' : 'M6 3 L11 8 L6 13')
                  : (isRtl ? 'M6 3 L11 8 L6 13' : 'M10 3 L5 8 L10 13')}
                stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {inputsOpen && (
          <main className="flex-1 overflow-y-auto min-h-0 space-y-3 p-3">
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
        )}
      </div>

      {/* Results panel */}
      <section className="flex-1 overflow-y-auto min-h-0 p-4">
        {result ? (
          <ResultsPanel
            result={result}
            tranches={current.mortgageTranches}
            holdingYears={current.property.holdingPeriodYears}
            data={current}
            scenarioName={scenarioName}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t('app.calcError')}
          </div>
        )}
      </section>
    </div>
    {result && (
      <PrintView
        result={result}
        tranches={current.mortgageTranches}
        holdingYears={current.property.holdingPeriodYears}
        data={current}
        scenarioName={scenarioName}
      />
    )}
    </>
  );
}
