import React, { useState } from 'react';
import type { YearlyRow } from '../../types';
import { fmtILS } from '../../utils/formatters';

interface Props {
  rows: YearlyRow[];
}

export function YearlyTable({ rows }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (year: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-200 px-4 py-3 border-b border-gray-700">
        פירוט שנתי
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-750 bg-gray-700 text-gray-400">
              <th className="px-3 py-2 text-right font-medium">שנה</th>
              <th className="px-3 py-2 text-right font-medium">שכירות ברוטו</th>
              <th className="px-3 py-2 text-right font-medium">תשלום משכנתא</th>
              <th className="px-3 py-2 text-right font-medium">ריבית</th>
              <th className="px-3 py-2 text-right font-medium">תזרים נטו</th>
              <th className="px-3 py-2 text-right font-medium">ערך נכס</th>
              <th className="px-3 py-2 text-right font-medium">יתרת חוב</th>
              <th className="px-3 py-2 text-right font-medium">הון עצמי</th>
              <th className="px-3 py-2 text-right font-medium">תזרים מצטבר</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <React.Fragment key={r.year}>
                <tr
                  className={`border-t border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                    r.netCashflow >= 0 ? '' : 'text-red-400/80'
                  }`}
                  onClick={() => toggle(r.year)}
                >
                  <td className="px-3 py-2 font-medium text-gray-200">{r.year}</td>
                  <td className="px-3 py-2 text-green-400">{fmtILS(r.grossRentalIncome)}</td>
                  <td className="px-3 py-2 text-red-400">{fmtILS(r.mortgagePayment)}</td>
                  <td className="px-3 py-2 text-orange-400">{fmtILS(r.interestPaid)}</td>
                  <td className={`px-3 py-2 font-semibold ${r.netCashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {fmtILS(r.netCashflow)}
                  </td>
                  <td className="px-3 py-2 text-blue-400">{fmtILS(r.propertyValue)}</td>
                  <td className="px-3 py-2 text-gray-300">{fmtILS(r.mortgageBalance)}</td>
                  <td className="px-3 py-2 text-purple-400">{fmtILS(r.equity)}</td>
                  <td className={`px-3 py-2 font-semibold ${r.cumulativeNetCashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {fmtILS(r.cumulativeNetCashflow)}
                  </td>
                </tr>
                {expanded.has(r.year) && (
                  <tr className="bg-gray-700/30 border-t border-gray-700/50">
                    <td colSpan={9} className="px-6 py-3">
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400">שכ"ד יעיל (לאחר ריקנות): </span>
                          <span className="text-gray-200">{fmtILS(r.effectiveRentalIncome)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">החזר קרן: </span>
                          <span className="text-gray-200">{fmtILS(r.principalPaid)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">תחזוקה: </span>
                          <span className="text-gray-200">{fmtILS(r.maintenanceCost)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">ביטוחים: </span>
                          <span className="text-gray-200">{fmtILS(r.insuranceCost)}</span>
                        </div>
                        {r.managementFee > 0 && (
                          <div>
                            <span className="text-gray-400">ניהול: </span>
                            <span className="text-gray-200">{fmtILS(r.managementFee)}</span>
                          </div>
                        )}
                        {r.renovationCost > 0 && (
                          <div>
                            <span className="text-gray-400">שיפוצים: </span>
                            <span className="text-orange-400">{fmtILS(r.renovationCost)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
