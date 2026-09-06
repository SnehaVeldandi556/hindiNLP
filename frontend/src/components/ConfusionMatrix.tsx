'use client';

import React from 'react';

interface ConfusionMatrixProps {
  categories: string[];
  matrix: number[][];
  bestModelName: string;
  totalSamples: number;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  categories,
  matrix,
  bestModelName,
  totalSamples,
}) => {
  if (!categories || !matrix || matrix.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        No confusion matrix data available.
      </div>
    );
  }

  // Find max value in matrix for heatmap scaling
  const maxVal = Math.max(...matrix.map((row) => Math.max(...row)), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            कन्फ्यूजन मैट्रिक्स (Confusion Matrix Heatmap)
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              {bestModelName}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Holdout Test Evaluation on {totalSamples} Stratified Citizen Complaints (8 Municipal Categories)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-50 border border-slate-200 inline-block" /> 0
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-300 inline-block" /> Mid
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> High Match ({maxVal})
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
            Predicted Category →
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-semibold text-slate-500 border border-slate-200 bg-slate-50 w-36">
                  Actual ↓ / Pred →
                </th>
                {categories.map((cat) => (
                  <th
                    key={cat}
                    className="p-2 text-center text-[11px] font-semibold text-slate-700 border border-slate-200 bg-slate-50 max-w-[80px] truncate"
                    title={cat}
                  >
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((actualCat, rIdx) => (
                <tr key={actualCat}>
                  <td className="p-2 text-xs font-semibold text-slate-800 border border-slate-200 bg-slate-50 truncate max-w-[140px]" title={actualCat}>
                    {actualCat}
                  </td>
                  {categories.map((predCat, cIdx) => {
                    const count = matrix[rIdx] ? matrix[rIdx][cIdx] || 0 : 0;
                    const isDiagonal = rIdx === cIdx;
                    
                    // Heatmap color calculation
                    let cellBg = 'bg-slate-50/50 text-slate-400';
                    if (count > 0) {
                      const ratio = count / maxVal;
                      if (ratio > 0.8) {
                        cellBg = 'bg-emerald-600 text-white font-bold';
                      } else if (ratio > 0.5) {
                        cellBg = 'bg-emerald-500 text-white font-bold';
                      } else if (ratio > 0.2) {
                        cellBg = 'bg-emerald-300 text-slate-900 font-semibold';
                      } else {
                        cellBg = 'bg-emerald-100 text-emerald-900 font-medium';
                      }
                    }

                    return (
                      <td
                        key={predCat}
                        className={`p-2.5 text-center text-xs border border-slate-200 transition-colors cursor-default ${cellBg} ${
                          isDiagonal ? 'ring-1 ring-inset ring-emerald-600/30' : ''
                        }`}
                        title={`Actual: ${actualCat} | Predicted: ${predCat} | Count: ${count}`}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
