'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Send,
  User,
  Star,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import { SimilarComplaintsCard } from '@/components/SimilarComplaintsCard';

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin update form state
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [officer, setOfficer] = useState('');
  const [resDays, setResDays] = useState<number | ''>('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    if (complaintId) {
      loadComplaint();
    }
  }, [complaintId]);

  const loadComplaint = async () => {
    setLoading(true);
    try {
      const data = await api.complaints.get(complaintId);
      setComplaint(data);
      setNewStatus(data.status);
      setActionTaken(data.action_taken || '');
      setOfficer(data.assigned_officer || '');
      setResDays(data.resolution_time_days || '');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'शिकायत विवरण लोड करने में विफल।');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess('');
    try {
      const updated = await api.complaints.updateStatus(complaintId, {
        status: newStatus,
        action_taken: actionTaken,
        assigned_officer: officer,
        resolution_time_days: typeof resDays === 'number' ? resDays : undefined,
      });
      setComplaint(updated);
      setUpdateSuccess('शिकायत की स्थिति सफलतापूर्वक अद्यतन की गई!');
    } catch (err: any) {
      setErrorMsg('स्थिति अद्यतन करने में त्रुटि हुई।');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs font-semibold">शिकायत विवरण लोड हो रहा है...</span>
      </div>
    );
  }

  if (errorMsg && !complaint) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200">
          {errorMsg}
        </div>
        <Link href="/complaints" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>शिकायत सूची पर वापस जाएं</span>
        </Link>
      </div>
    );
  }

  const prediction = complaint.prediction;
  const resolution = complaint.resolution;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-slate-900">
                {complaint.complaint_code}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  complaint.status === 'Closed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : complaint.status === 'In Progress'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {complaint.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              पंजीकरण तिथि: {complaint.complaint_date || 'N/A'} • {complaint.ward}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {complaint.department}
          </span>
        </div>
      </div>

      {/* Lifecycle Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4">
          शिकायत निवारण प्रगति चक्र (Lifecycle Progress):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">चरण 1 (Step 1)</span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">शिकायत दर्ज</p>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">✓ संपन्‍न</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">चरण 2 (Step 2)</span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">एआई वर्गीकरण</p>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">✓ संपन्‍न ({prediction ? `${prediction.confidence_score}%` : 'Done'})</span>
          </div>

          <div
            className={`p-3 rounded-2xl text-center border ${
              complaint.status === 'In Progress' || complaint.status === 'Closed'
                ? 'bg-purple-50 border-purple-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <span className="text-[10px] font-bold text-purple-700 uppercase">चरण 3 (Step 3)</span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">अधिकारी को प्रेषित</p>
            <span className="text-[10px] text-slate-500 block mt-1">
              {complaint.assigned_officer || 'अधिशासी अभियंता'}
            </span>
          </div>

          <div
            className={`p-3 rounded-2xl text-center border ${
              complaint.status === 'Closed'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-700 uppercase">चरण 4 (Step 4)</span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">समाधान एवं सत्यापन</p>
            <span className="text-[10px] text-slate-500 block mt-1">
              {complaint.status === 'Closed' ? '✓ बंद (Closed)' : 'लंबित (Pending)'}
            </span>
          </div>
        </div>
      </div>

      {/* Complaint Text & Quick Attributes */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          नागरिक द्वारा दर्ज शिकायत विवरण (Complaint Description):
        </span>
        <blockquote className="p-4 rounded-2xl bg-slate-50 border-l-4 border-emerald-600 text-slate-800 text-base font-medium leading-relaxed">
          "{complaint.complaint_text}"
        </blockquote>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">श्रेणी (Category)</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{complaint.category}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">वार्ड (Ward)</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{complaint.ward}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">प्राथमिकता (Priority)</span>
            <span
              className={`inline-block font-extrabold uppercase mt-0.5 px-2 py-0.5 rounded text-[10px] ${
                complaint.priority === 'High'
                  ? 'bg-red-100 text-red-800'
                  : complaint.priority === 'Medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {complaint.priority} ({complaint.severity_score}/10)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">कार्रवाई स्थिति (Action)</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-0.5">
              {complaint.action_taken || 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Prediction & Severity Insights */}
      {prediction && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>एआई भविष्यवाणी एवं तर्क (AI Prediction & Severity Breakdown)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {prediction.confidence_score}% Confidence ({prediction.model_name})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-100">
              <span className="text-[10px] font-bold text-sky-800 uppercase block">पूर्वानुमानित श्रेणी</span>
              <p className="text-lg font-bold text-sky-950 mt-0.5">{prediction.predicted_category}</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">विश्वसनीयता प्रतिशत</span>
              <p className="text-lg font-bold text-emerald-950 mt-0.5">{prediction.confidence_score}%</p>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">प्राथमिकता स्तर</span>
              <p className="text-lg font-bold text-amber-950 mt-0.5">
                {prediction.priority_assigned} ({prediction.calculated_severity}/10)
              </p>
            </div>
          </div>

          {prediction.explanation && prediction.explanation.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                पारदर्शी प्राथमिकता निर्धारण तर्क:
              </span>
              <ul className="space-y-1 text-xs text-slate-600">
                {prediction.explanation.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI Resolution Recommendation & Similar Historical Complaints */}
      {resolution && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <SimilarComplaintsCard
            similarComplaints={resolution.similar_complaints || []}
            recommendedAction={resolution.recommended_action}
            estimatedDays={resolution.estimated_resolution_days}
            actionSteps={resolution.action_steps}
          />
        </div>
      )}

      {/* Admin Quick Action Box */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>प्रशासनिक कार्रवाई (Admin Status Control)</span>
            </h3>
            <span className="text-xs text-slate-400">Admin Privileges Active</span>
          </div>

          {updateSuccess && (
            <div className="p-3 bg-emerald-900/50 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{updateSuccess}</span>
            </div>
          )}

          <form onSubmit={handleStatusUpdate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">स्थिति (Status)</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">कार्रवाई (Action Taken)</label>
              <input
                type="text"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="उदा. Pipeline repaired"
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">अधिकारी (Officer)</label>
              <input
                type="text"
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                placeholder="OFF012"
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50"
              >
                {updating ? 'अद्यतन...' : 'अद्यतन करें (Update)'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
