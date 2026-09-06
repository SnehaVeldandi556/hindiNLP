'use client';

import React from 'react';
import { History, CheckCircle2, Clock, MapPin, Tag } from 'lucide-react';

interface SimilarComplaintItem {
  Complaint_ID: string;
  Complaint_Text: string;
  Category: string;
  Department: string;
  Ward: string;
  Status: string;
  Action_Taken?: string;
  Resolution_Time_Days?: number;
  Citizen_Rating?: number;
  similarity_score: number;
}

interface SimilarComplaintsCardProps {
  similarComplaints: SimilarComplaintItem[];
  recommendedAction?: string;
  estimatedDays?: number;
  actionSteps?: string[];
}

export const SimilarComplaintsCard: React.FC<SimilarComplaintsCardProps> = ({
  similarComplaints,
  recommendedAction,
  estimatedDays,
  actionSteps,
}) => {
  return (
    <div className="space-y-6">
      {/* Recommended Resolution Banner */}
      {recommendedAction && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-200/70 px-2 py-0.5 rounded-full">
                ऐतिहासिक डेटा आधारित समाधान सिफारिश (AI Resolution Recommendation)
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-2">
                {recommendedAction}
              </h4>
              {estimatedDays !== undefined && (
                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  अनुमानित समाधान समय (Estimated Time):{' '}
                  <span className="font-bold text-emerald-700">{estimatedDays} दिन (days)</span>
                </p>
              )}
            </div>

            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-emerald-600 text-white items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {actionSteps && actionSteps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-emerald-200/60">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                मानक समाधान प्रक्रिया (Recommended Standard Protocol):
              </p>
              <ul className="space-y-2">
                {actionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Top 3-5 Similar Complaints List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-sky-600" />
            समान ऐतिहासिक शिकायतें (Top {similarComplaints?.length || 0} Similar Historical Cases)
          </h4>
          <span className="text-xs text-slate-500 font-medium">TF-IDF + Cosine Similarity Match</span>
        </div>

        {(!similarComplaints || similarComplaints.length === 0) ? (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
            समान ऐतिहासिक शिकायतें देखने के लिए ऊपर शिकायत दर्ज करें या खोजें।
          </p>
        ) : (
          <div className="space-y-3">
            {similarComplaints.slice(0, 5).map((caseItem, idx) => (
              <div
                key={caseItem.Complaint_ID || idx}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {caseItem.Complaint_ID}
                    </span>
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {caseItem.Ward}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {caseItem.Category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                      {caseItem.similarity_score}% समानता (Match)
                    </span>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-800 mt-2">
                  "{caseItem.Complaint_Text}"
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">कार्रवाई (Resolution Action):</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {caseItem.Action_Taken || 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500">
                    {caseItem.Resolution_Time_Days !== undefined && caseItem.Resolution_Time_Days !== null && (
                      <span>समाधान समय: {caseItem.Resolution_Time_Days} दिन</span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        caseItem.Status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : caseItem.Status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {caseItem.Status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
