'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Brain,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SimilarComplaintsCard } from '@/components/SimilarComplaintsCard';

const SAMPLE_COMPLAINTS = [
  { label: 'नल/पानी (Water)', text: 'पानी की पाइप लाइन टूट गई है और 4 दिनों से पानी नहीं आ रहा है।' },
  { label: 'बिजली/ट्रांसफार्मर (Power)', text: 'पिछले 6 घंटों से ट्रांसफार्मर खराब है और बार-बार बिजली जा रही है।' },
  { label: 'सड़क/गड्ढे (Roads)', text: 'सड़क पर बड़े गड्ढे हैं और भारी दुर्घटना का खतरा बना हुआ है।' },
  { label: 'सीवर/नाली (Drainage)', text: 'नाली जाम हो गई है और गंदा पानी सड़क पर फैल रहा है।' },
  { label: 'हिंग्लिश कचरा (Hinglish)', text: 'hamare area me 3 dino se kachra nahi uthaya gaya aur safai nahi hui' },
];

export default function LandingPage() {
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : inputText;
    if (!text.trim()) {
      setErrorMsg('कृपया विश्लेषण के लिए शिकायत का विवरण दर्ज करें।');
      return;
    }
    setErrorMsg('');
    setAnalyzing(true);
    try {
      const res = await api.ml.classify(text);
      setAnalysisResult(res);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    handleAnalyze(sampleText);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-4 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>सत्यापित 2,000 नगर निगम शिकायतों पर प्रशिक्षित एआई मॉडल</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          शिकायत<span className="text-emerald-600">AI</span> : हिंदी स्मार्ट शिकायत वर्गीकरण एवं समाधान विश्लेषण
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          नागरिकों की हिंदी और हिंग्लिश शिकायतों का सटीक एनएलपी वर्गीकरण, पारदर्शी प्राथमिकता मूल्यांकन, तथा ऐतिहासिक डेटा-आधारित समाधान सिफारिश।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/submit"
            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 group"
          >
            <span>शिकायत दर्ज करें (File Complaint)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm transition-all flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>प्रशासनिक डैशबोर्ड (Admin Portal)</span>
          </Link>
        </div>
      </section>

      {/* Interactive Live AI Playground */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl font-bold text-slate-900">
                लाइव एआई परीक्षण प्रयोगशाला (Live NLP Playground)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              हिंदी या हिंग्लिश में कोई भी नागरिक शिकायत लिखें और तुरंत वास्तविक समय में वर्गीकरण एवं समाधान देखें
            </p>
          </div>

          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full self-start sm:self-auto">
            Zero Hallucination • Data-Backed
          </span>
        </div>

        {/* Sample Prompt Chips */}
        <div className="mt-5">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            त्वरित उदाहरण चुनें (Try Quick Examples):
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_COMPLAINTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample.text)}
                className="text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200/80 px-3 py-1.5 rounded-lg transition-colors text-slate-700 text-left"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Input */}
        <div className="mt-4 space-y-3">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="यहाँ अपनी शिकायत लिखें... (जैसे: पानी की पाइप लाइन टूट गई है, या street light band hai raat me andhera rehta hai)"
            className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 text-sm transition-all resize-none"
          />

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => handleAnalyze()}
              disabled={analyzing}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>विश्लेषण हो रहा है...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>एआई से विश्लेषण करें (Analyze with AI)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Analysis Output Card */}
        {analysisResult && (
          <div className="mt-8 pt-6 border-t border-slate-200 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                  पूर्वानुमानित श्रेणी (Predicted Category)
                </span>
                <p className="text-xl font-extrabold text-sky-950 mt-1">
                  {analysisResult.category}
                </p>
                <p className="text-xs text-sky-700 mt-1">
                  विभाग: {analysisResult.department}
                </p>
              </div>

              {/* Confidence Score */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  विश्वास स्कोर (Confidence Score)
                </span>
                <p className="text-xl font-extrabold text-emerald-950 mt-1">
                  {analysisResult.confidence_score}%
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  मॉडल: {analysisResult.model_name}
                </p>
              </div>

              {/* Priority */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  प्राथमिकता (Assigned Priority)
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                      analysisResult.priority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : analysisResult.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {analysisResult.priority}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    गंभीरता: {analysisResult.severity_score}/10
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  पारदर्शी नियम आधारित मूल्यांकन
                </p>
              </div>

              {/* Resolution Action Preview */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                  सिफारिश की गई कार्रवाई (Action)
                </span>
                <p className="text-sm font-extrabold text-purple-950 mt-1 line-clamp-1">
                  {analysisResult.recommended_action}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  औसत समय: {analysisResult.estimated_resolution_days} दिन
                </p>
              </div>
            </div>

            {/* Severity Logic Explanation Box */}
            {analysisResult.explanation && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  पारदर्शी प्राथमिकता गणना तर्क (Explainable Severity Breakdown):
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.explanation.map((reason: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Similar Complaints and Resolution Card */}
            <SimilarComplaintsCard
              similarComplaints={analysisResult.similar_complaints}
              recommendedAction={analysisResult.recommended_action}
              estimatedDays={analysisResult.estimated_resolution_days}
              actionSteps={analysisResult.action_steps}
            />
          </div>
        )}
      </section>

      {/* Platform Core Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            हिंदी एवं हिंग्लिश एनएलपी (Bilingual NLP)
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            देवनागरी और रोमन हिंग्लिश दोनों में नागरिक बोलचाल को पहचानता है। विराम चिह्न, विराम शब्द और ध्वन्यात्मक रूपांतरण के साथ त्रुटिहीन समझ।
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            पारदर्शी प्राथमिकता स्कोर (Transparent Severity)
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            ब्लैक-बॉक्स अनुमान नहीं; अवधि ('4 दिनों से'), सुरक्षा संकट ('शॉर्ट सर्किट', 'गंदा पानी') के आधार पर स्पष्ट 1–10 स्कोर और Low/Medium/High प्राथमिकता।
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            ऐतिहासिक डेटा से समाधान (Zero Fabrication)
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            TF-IDF कोसाइन समानता द्वारा 2,000 वास्तविक ऐतिहासिक मामलों से समान शिकायतें और उन पर पहले की गई वास्तविक कार्रवाई सिफारिश की जाती है।
          </p>
        </div>
      </section>

      {/* Dataset & System Metric Highlights */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            OPERATIONAL CAPACITY & DATASET PROFILE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            नगर निगम शिकायत निवारण आँकड़े
          </h2>
          <p className="text-slate-400 text-sm">
            वास्तविक पोस्टग्रेएसक्यूएल डेटाबेस और मशीन लर्निंग मॉडल से संचालित लाइव प्रदर्शन।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-800">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">2,000</div>
            <p className="text-xs font-medium text-slate-400 mt-1">प्रमाणित शिकायत डेटासेट</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">8</div>
            <p className="text-xs font-medium text-slate-400 mt-1">संबद्ध नगर निगम विभाग</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-sky-400">99%+</div>
            <p className="text-xs font-medium text-slate-400 mt-1">मॉडल वर्गीकरण सटीकता (F1)</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">7.5 दिन</div>
            <p className="text-xs font-medium text-slate-400 mt-1">औसत ऐतिहासिक समाधान समय</p>
          </div>
        </div>
      </section>
    </div>
  );
}
