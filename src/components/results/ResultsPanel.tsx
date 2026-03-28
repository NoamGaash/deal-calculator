import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CalculationResult, MortgageTranche, ScenarioData } from '../../types';
import { generateSummaryMarkdown } from '../../utils/generateSummary';
import { SummaryCards } from './SummaryCards';
import { CashflowChart } from './charts/CashflowChart';
import { MortgageBalanceChart } from './charts/MortgageBalanceChart';
import { EquityChart } from './charts/EquityChart';
import { ComparisonChart } from './charts/ComparisonChart';
import { YearlyTable } from './YearlyTable';
import { TrancheSummaryTable } from './TrancheSummaryTable';
import { SummaryModal } from './SummaryModal';

type Tab = 'summary' | 'charts' | 'table';

interface Props {
  result: CalculationResult;
  tranches: MortgageTranche[];
  holdingYears: number;
  data: ScenarioData;
  scenarioName: string;
}

export function ResultsPanel({ result, tranches, holdingYears, data, scenarioName }: Props) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>('summary');
  const [modalMarkdown, setModalMarkdown] = useState<string | null>(null);

  const handlePrint = () => window.print();

  const handleOpenModal = () => {
    const md = generateSummaryMarkdown(data, result, scenarioName, i18n.language as 'he' | 'en');
    setModalMarkdown(md);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: t('results.tabSummary') },
    { id: 'charts', label: t('results.tabCharts') },
    { id: 'table', label: t('results.tabYearly') },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Tab bar + action buttons */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1 flex-1">
          {tabs.map(tb => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === tb.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleOpenModal}
          title={t('results.copy')}
          className="px-2.5 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          {t('results.copy')}
        </button>
        <button
          onClick={handlePrint}
          title={t('results.print')}
          className="px-2.5 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        >
          {t('results.print')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {tab === 'summary' && (
          <>
            <SummaryCards summary={result.summary} holdingYears={holdingYears} />
            <TrancheSummaryTable
              trancheSchedules={result.trancheSchedules}
              tranches={tranches}
              holdingMonths={holdingYears * 12}
            />
          </>
        )}
        {tab === 'charts' && (
          <>
            <ComparisonChart
              yearlyRows={result.yearlyRows}
              totalInvestment={result.summary.totalInvestment}
              alternativeYieldPct={data.property.alternativeYieldPct}
            />
            <CashflowChart yearlyRows={result.yearlyRows} />
            <MortgageBalanceChart yearlyRows={result.yearlyRows} tranches={tranches} />
            <EquityChart yearlyRows={result.yearlyRows} totalInvestment={result.summary.totalInvestment} />
          </>
        )}
        {tab === 'table' && (
          <YearlyTable rows={result.yearlyRows} />
        )}
      </div>

      {modalMarkdown !== null && (
        <SummaryModal
          markdown={modalMarkdown}
          onClose={() => setModalMarkdown(null)}
        />
      )}
    </div>
  );
}
