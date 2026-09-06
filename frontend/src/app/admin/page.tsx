'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  ListOrdered,
  Building2,
  RefreshCw,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import {
  CategoryDonutChart,
  PriorityDistributionChart,
  ResolutionTrendChart,
  DepartmentResolutionDaysChart,
} from '@/components/Charts';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      loadDashboard();
    }
  }, [isAuthenticated, authLoading]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.analytics.dashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs font-semibold">नगर निगम एनालिटिक्स लोड हो रहा है...</span>
      </div>
    );
  }

  const { overview, categories, priorities, trends, top_wards } = dashboardData;

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span>प्रशासनिक विश्लेषण केंद्र (Municipal Control Hub)</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            2,000 वास्तविक नगर निगम शिकायतों और पोस्टग्रेएसक्यूएल डेटाबेस पर आधारित लाइव अंतर्दृष्टि
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadDashboard}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>रिफ्रेश</span>
          </button>
          <Link
            href="/admin/complaints"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>शिकायत प्रबंधन (Registry)</span>
          </Link>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Cases"
          hindiTitle="कुल शिकायतें"
          value={overview.total_complaints}
          subtitle="डेटाबेस में कुल मामले"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Open Complaints"
          hindiTitle="लंबित"
          value={overview.open_complaints}
          subtitle="तत्काल ध्यान अपेक्षित"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="In Progress"
          hindiTitle="प्रगति पर"
          value={overview.in_progress_complaints}
          subtitle="सक्रिय फील्ड कार्य"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Resolved"
          hindiTitle="हल की गई"
          value={overview.closed_complaints}
          subtitle="सफलतापूर्वक निष्पादित"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Resolution Rate"
          hindiTitle="समाधान दर"
          value={`${overview.resolution_rate}%`}
          subtitle="सफलता अनुपात"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Avg Resolution"
          hindiTitle="औसत समय"
          value={`${overview.avg_resolution_days} दिन`}
          subtitle="निस्तारण समयावधि"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Chart Section 1: Categories & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (Donut) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                विभागवार शिकायत वितरण (Complaints by Category)
              </h3>
              <p className="text-[11px] text-slate-500">
                8 संतुलित नगर निगम श्रेणियाँ (प्रत्येक में 250 शिकायतें)
              </p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
              8 Departments
            </span>
          </div>
          <CategoryDonutChart data={categories} />
        </div>

        {/* Priority Breakdown (Bar Chart) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                प्राथमिकता स्तर विश्लेषण (Priority & Severity Levels)
              </h3>
              <p className="text-[11px] text-slate-500">
                गंभीरता स्कोर (1-10) के आधार पर High, Medium, एवं Low का वितरण
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Rule-Engine Backed
            </span>
          </div>
          <PriorityDistributionChart data={priorities} />
        </div>
      </div>

      {/* Chart Section 2: Trends & Department Resolution Times */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                मासिक शिकायत एवं समाधान रुझान (Monthly Volume & Resolution Trend)
              </h3>
              <p className="text-[11px] text-slate-500">
                कुल प्राप्त शिकायतें बनाम हल किए गए मामलों का मासिक प्रवाह
              </p>
            </div>
          </div>
          <ResolutionTrendChart data={trends} />
        </div>

        {/* Department Avg Days Horizontal Bar */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                औसत समाधान दिवस (Avg Resolution Days by Category)
              </h3>
              <p className="text-[11px] text-slate-500">
                किस श्रेणी में समस्या के समाधान में कितने दिन लगते हैं
              </p>
            </div>
          </div>
          <DepartmentResolutionDaysChart data={categories} />
        </div>
      </div>

      {/* Top Municipal Wards Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>शीर्ष वार्ड कार्यक्षमता (Top Municipal Wards Performance)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              शिकायत मात्रा एवं समाधान प्रतिशत दर
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {top_wards.map((w: any) => (
            <div key={w.ward} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="font-bold text-slate-900 text-xs block">{w.ward}</span>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-600">
                <span>{w.total} मामले</span>
                <span className="font-bold text-emerald-700">{w.resolution_rate}% दर</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
