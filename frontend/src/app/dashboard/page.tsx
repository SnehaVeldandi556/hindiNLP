'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Eye,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';

export default function UserDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadComplaints();
    }
  }, [isAuthenticated, authLoading]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      // First try to load complaints filed by current user
      const res = await api.complaints.list({ limit: 10, my_only: true });
      if (res.items && res.items.length > 0) {
        setComplaints(res.items);
        setTotalCount(res.total);
      } else {
        // If user has no personal complaints yet, fetch latest general complaints for demo
        const generalRes = await api.complaints.list({ limit: 8 });
        setComplaints(generalRes.items || []);
        setTotalCount(generalRes.total || 0);
      }
    } catch (err) {
      console.error('Failed to load user complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const openCount = complaints.filter((c) => c.status === 'Open').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const closedCount = complaints.filter((c) => c.status === 'Closed').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-700/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>वार्ड: {user?.ward || 'Ward 38'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            नमस्ते, {user?.name || 'नागरिक'}!
          </h1>
          <p className="text-sm text-emerald-100 max-w-xl">
            शिकायतAI नागरिक डैशबोर्ड में आपका स्वागत है। आप अपनी दर्ज शिकायतों की स्थिति, AI विश्लेषण और समाधान की प्रगति यहाँ देख सकते हैं।
          </p>
        </div>

        <Link
          href="/submit"
          className="px-5 py-3 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto group"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>नई शिकायत दर्ज करें</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          hindiTitle="कुल शिकायतें"
          value={totalCount}
          subtitle="पंजीकृत मामले"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Open / Pending"
          hindiTitle="लंबित"
          value={openCount}
          subtitle="समीक्षाधीन शिकायतें"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="In Progress"
          hindiTitle="प्रगति पर"
          value={inProgressCount}
          subtitle="कार्यवाही जारी है"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Resolved"
          hindiTitle="हल की गई"
          value={closedCount}
          subtitle="सफलतापूर्वक बंद"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>हालिया शिकायतें (Recent Complaints)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक शिकायत के साथ AI द्वारा पूर्वानुमानित श्रेणी एवं समाधान संलग्न है
            </p>
          </div>

          <Link
            href="/complaints"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>सभी देखें (View All)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">लोड हो रहा है...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-slate-500 text-sm">अभी तक कोई शिकायत दर्ज नहीं की गई है।</p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>पहली शिकायत दर्ज करें</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">टोकन सं. (ID)</th>
                  <th className="py-3 px-4">विवरण (Complaint Text)</th>
                  <th className="py-3 px-4">श्रेणी (Category)</th>
                  <th className="py-3 px-4">प्राथमिकता (Priority)</th>
                  <th className="py-3 px-4">स्थिति (Status)</th>
                  <th className="py-3 px-4">कार्रवाई (Action Taken)</th>
                  <th className="py-3 px-4 text-right">विवरण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {c.complaint_code}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800">
                      {c.complaint_text}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : c.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {c.priority} ({c.severity_score}/10)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'In Progress'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {c.action_taken || 'Pending'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>देखें</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
