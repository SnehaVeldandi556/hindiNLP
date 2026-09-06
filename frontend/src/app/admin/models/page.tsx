'use client';

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Trophy,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  BarChart2,
  Cpu,
  Layers,
  FileCheck,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ModelComparisonChart } from '@/components/Charts';
import { ConfusionMatrix } from '@/components/ConfusionMatrix';

export default function ModelPerformancePage() {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState('');

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.ml.metrics();
      setMetricsData(data);
    } catch (err) {
      console.error('Failed to load ML metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainMsg('');
    try {
      const res = await api.ml.retrain();
      setRetrainMsg(res.message || 'मॉडल सफलतापूर्वक पुनः प्रशिक्षित किए गए!');
      loadMetrics();
    } catch (err: any) {
      setRetrainMsg(err?.response?.data?.detail || 'पुनः प्रशिक्षण में त्रुटि हुई।');
    } finally {
      setRetraining(false);
    }
  };

  if (loading || !metricsData) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs font-semibold">मशीन लर्निंग मॉडल मेट्रिक्स लोड हो रहे हैं...</span>
      </div>
    );
  }

  const { best_model, comparison, confusion_matrix } = metricsData;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-emerald-600" />
              <span>मशीन लर्निंग मॉडल प्रदर्शन एवं मूल्यांकन (ML Performance)</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            2,000 वास्तविक नगर निगम शिकायतों पर 3 मॉडलों का कठोर तुलनात्मक विश्लेषण (80/20 स्प्लिट, शून्य डेटा रिसाव)
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? 'प्रशिक्षण जारी है...' : 'मॉडल पुनः प्रशिक्षित करें (Retrain)'}</span>
        </button>
      </div>

      {retrainMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{retrainMsg}</span>
        </div>
      )}

      {/* Best Model Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>सर्वश्रेष्ठ चयनित मॉडल (Selected Best Model)</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">{best_model}</h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Accuracy, Precision, Recall, F1 और Macro-F1 के समग्र मूल्यांकन के आधार पर उत्पादन परिनियोजन के लिए सक्रिय।
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 text-center shrink-0">
          <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
            Macro-F1 Score
          </span>
          <span className="text-3xl font-black">
            {((comparison?.find((m: any) => m.model === best_model)?.f1_macro || 1.0) * 100).toFixed(1)}%
          </span>
          <p className="text-[10px] text-emerald-100 mt-0.5">8 नगर निगम श्रेणियां</p>
        </div>
      </div>

      {/* Model Comparison Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>मॉडल तुलना लीडरबोर्ड (Candidate Models Evaluation Leaderboard)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              400 होल्डआउट टेस्ट नमूनों पर वास्तविक स्कोर (Accuracy, Macro-Precision, Macro-Recall, Weighted-F1, Macro-F1)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-6">मॉडल नाम (Model Architecture)</th>
                <th className="py-3.5 px-4 text-center">Accuracy</th>
                <th className="py-3.5 px-4 text-center">Macro Precision</th>
                <th className="py-3.5 px-4 text-center">Macro Recall</th>
                <th className="py-3.5 px-4 text-center">Macro F1</th>
                <th className="py-3.5 px-4 text-center">Weighted F1</th>
                <th className="py-3.5 px-4 text-center">स्थिति (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {comparison.map((item: any) => (
                <tr
                  key={item.model}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.is_best ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                    {item.is_best && <Trophy className="w-4 h-4 text-amber-500 shrink-0" />}
                    <span>TF-IDF + {item.model}</span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                    {(item.accuracy * 100).toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-slate-700">
                    {(item.precision * 100).toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-slate-700">
                    {(item.recall * 100).toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-emerald-700">
                    {(item.f1_macro * 100).toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-slate-700">
                    {(item.f1_weighted * 100).toFixed(2)}%
                  </td>
                  <td className="py-4 px-4 text-center">
                    {item.is_best ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        सर्वश्रेष्ठ (Active)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        मूल्यांकित
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharts Model Comparison Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-600" />
              <span>मेट्रिक्स तुलना बार चार्ट (Model Metrics Comparison Visualizer)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Logistic Regression vs Linear SVM vs Naive Bayes
            </p>
          </div>
        </div>
        <ModelComparisonChart data={comparison} />
      </div>

      {/* Interactive Confusion Matrix Heatmap */}
      {confusion_matrix && (
        <ConfusionMatrix
          categories={confusion_matrix.categories || []}
          matrix={confusion_matrix.matrix || []}
          bestModelName={best_model}
          totalSamples={confusion_matrix.total_test_samples || 400}
        />
      )}

      {/* NLP Architecture & Pipeline Information */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <span>एनएलपी प्रीप्रोसेसिंग एवं फीचर पाइपलाइन (NLP Preprocessing & Feature Engineering)</span>
          </h3>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
            Pipeline Spec
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
              1. यूनिकोड सामान्यीकरण
            </span>
            <p className="text-slate-600">
              Devanagari Unicode NFC Normalization, stripping trailing zero-width joiners and danda (।)
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
              2. हिंग्लिश मैपिंग (Phonetics)
            </span>
            <p className="text-slate-600">
              Phonetic dictionary converts romanized civic words ('paani' → 'पानी', 'bijli' → 'बिजली') seamlessly.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
              3. हिंदी विराम शब्द
            </span>
            <p className="text-slate-600">
              Curated Hindi stopwords removal ('है', 'की', 'के', 'में', 'से', 'पर', etc.) to isolate grievance keywords.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
              4. TF-IDF n-grams (1, 2)
            </span>
            <p className="text-slate-600">
              Sublinear TF scaling with unigrams & bigrams capturing key compound phrases ('पाइप लाइन', 'स्ट्रीट लाइट').
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
