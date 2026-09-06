'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Send,
  ArrowLeft,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SimilarComplaintsCard } from '@/components/SimilarComplaintsCard';
import Link from 'next/link';

const CATEGORIES = [
  'Water Supply',
  'Electricity',
  'Roads',
  'Garbage Collection',
  'Drainage',
  'Street Lights',
  'Sewage',
  'Public Transport',
];

export default function SubmitComplaintPage() {
  const router = useRouter();

  const [complaintText, setComplaintText] = useState('');
  const [ward, setWard] = useState('Ward 38');
  const [manualCategory, setManualCategory] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAnalyze = async () => {
    if (!complaintText.trim()) {
      setErrorMsg('कृपया पहले अपनी शिकायत का विवरण दर्ज करें।');
      return;
    }
    setErrorMsg('');
    setAnalyzing(true);
    try {
      const res = await api.ml.classify(complaintText, ward);
      setAnalysisResult(res);
      if (!manualCategory) {
        setManualCategory(res.category);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'एआई विश्लेषण विफल रहा।');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      setErrorMsg('कृपया शिकायत का विवरण अनिवार्य रूप से दर्ज करें।');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await api.complaints.create({
        complaint_text: complaintText.trim(),
        ward: ward,
        category: manualCategory || (analysisResult?.category ? analysisResult.category : undefined),
      });

      setSuccessMsg(`शिकायत सफलतापूर्वक दर्ज की गई! टोकन सं.: ${res.complaint_code}`);
      setTimeout(() => {
        router.push(`/complaints/${res.id}`);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'शिकायत दर्ज करने में त्रुटि हुई।');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              नई नागरिक शिकायत दर्ज करें (File Complaint)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-7">
            शिकायतAI आपके द्वारा दर्ज हिंदी/हिंग्लिश विवरण का स्वतः विश्लेषण कर उपयुक्त विभाग को प्रेषित करेगा
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Input */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ward Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                वार्ड / क्षेत्र (Municipal Ward) *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                >
                  {Array.from({ length: 50 }, (_, i) => `Ward ${i + 1}`).map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Complaint Text */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  शिकायत का विवरण (Complaint Description in Hindi/Hinglish) *
                </label>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing || !complaintText.trim()}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{analyzing ? 'विश्लेषण...' : 'पूर्वावलोकन करें (Live AI Preview)'}</span>
                </button>
              </div>

              <textarea
                rows={5}
                required
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="अपनी समस्या का पूरा विवरण यहाँ लिखें... (उदा: पिछले 4 दिनों से हमारे वार्ड में पानी नहीं आ रहा है, पाइप लाइन लीक हो रही है)"
                className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                हिंदी (देवनागरी) अथवा हिंग्लिश (रोमन लिपि) दोनों स्वीकार्य हैं।
              </p>
            </div>

            {/* Optional Category Override */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                श्रेणी (Category) — AI स्वतः निर्धारित करेगा, यदि आवश्यक हो तो बदलें:
              </label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              >
                <option value="">-- एआई स्वतः निर्धारित करे (Auto-detect with AI) --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !complaintText.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>एआई जांचें (Test AI)</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>दर्ज हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>शिकायत दर्ज करें (Submit Ticket)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Pane: AI Insights & Recommendation Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>एआई लाइव पूर्वावलोकन (AI Live Assistant)</span>
              </h3>
              {analysisResult && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {analysisResult.confidence_score}% Confidence
                </span>
              )}
            </div>

            {!analysisResult ? (
              <div className="p-8 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  शिकायत का विवरण लिखें और "पूर्वावलोकन करें" पर क्लिक करें ताकि एआई श्रेणी, प्राथमिकता और समाधान की सिफारिश प्रदर्शित कर सके।
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                    वर्गीकृत श्रेणी एवं विभाग
                  </span>
                  <p className="text-base font-extrabold text-sky-950 mt-0.5">
                    {analysisResult.category}
                  </p>
                  <p className="text-xs text-sky-700">
                    जिम्मेदार विभाग: {analysisResult.department}
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                    प्राथमिकता एवं गंभीरता स्तर
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        analysisResult.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : analysisResult.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {analysisResult.priority} Priority
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      स्कोर: {analysisResult.severity_score}/10
                    </span>
                  </div>
                  {analysisResult.explanation && (
                    <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                      {analysisResult.explanation.map((e: string, i: number) => (
                        <div key={i}>• {e}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    सिफारिश की गई मानक कार्रवाई (Action Recommendation)
                  </span>
                  <p className="text-sm font-extrabold text-emerald-950 mt-0.5">
                    {analysisResult.recommended_action}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    अनुमानित समाधान समय: {analysisResult.estimated_resolution_days} दिन
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Similar Complaints Preview */}
          {analysisResult && analysisResult.similar_complaints && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <SimilarComplaintsCard
                similarComplaints={analysisResult.similar_complaints}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
