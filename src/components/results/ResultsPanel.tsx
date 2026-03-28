import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CalculationResult, MortgageTranche } from '../../types';
import { SummaryCards } from './SummaryCards';
import { CashflowChart } from './charts/CashflowChart';
import { MortgageBalanceChart } from './charts/MortgageBalanceChart';
import { EquityChart } from './charts/EquityChart';
import { YearlyTable } from './YearlyTable';

type Tab = 'summary' | 'charts' | 'table';

interface Props {
  result: CalculationResult;
  tranches: MortgageTranche[];
  holdingYears: number;
}

export function ResultsPanel({ result, tranches, holdingYears }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('summary');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary', label: t('results.tabSummary') },
    { id: 'charts', label: t('results.tabCharts') },
    { id: 'table', label: t('results.tabYearly') },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {tab === 'summary' && (
          <SummaryCards summary={result.summary} holdingYears={holdingYears} />
        )}
        {tab === 'charts' && (
          <>
            <CashflowChart yearlyRows={result.yearlyRows} />
            <MortgageBalanceChart yearlyRows={result.yearlyRows} tranches={tranches} />
            <EquityChart yearlyRows={result.yearlyRows} totalInvestment={result.summary.totalInvestment} />
          </>
        )}
        {tab === 'table' && (
          <YearlyTable rows={result.yearlyRows} />
        )}
      </div>
    </div>
  );
}
