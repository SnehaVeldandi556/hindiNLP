'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { api } from '@/lib/api';
import {
  ListOrdered,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Water Supply',
  'Electricity',
  'Roads',
  'Garbage Collection',
  'Drainage',
  'Street Lights',
  'Sewage',
  'Public Transport',
];
const STATUSES = ['All', 'Open', 'In Progress', 'Closed'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];

export default function AdminComplaintsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');

  // Edit Modal State
  const [editingComplaint, setEditingComplaint] = useState<any | null>(null);
  const [modalStatus, setModalStatus] = useState('Open');
  const [modalAction, setModalAction] = useState('');
  const [modalOfficer, setModalOfficer] = useState('');
  const [modalDays, setModalDays] = useState<number | ''>('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchComplaints();
  }, [page, category, status, priority, isAuthenticated, authLoading]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.complaints.list({
        page,
        limit,
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
        priority: priority !== 'All' ? priority : undefined,
      });
      setComplaints(res.items || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const openEditModal = (c: any) => {
    setEditingComplaint(c);
    setModalStatus(c.status);
    setModalAction(c.action_taken || '');
    setModalOfficer(c.assigned_officer || '');
    setModalDays(c.resolution_time_days || '');
    setSuccessMsg('');
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setUpdating(true);
    try {
      await api.complaints.updateStatus(editingComplaint.id, {
        status: modalStatus,
        action_taken: modalAction,
        assigned_officer: modalOfficer,
        resolution_time_days: typeof modalDays === 'number' ? modalDays : undefined,
      });
      setSuccessMsg('शिकायत सफलतापूर्वक अद्यतन की गई!');
      fetchComplaints();
      setTimeout(() => {
        setEditingComplaint(null);
      }, 1000);
    } catch (err) {
      alert('अद्यतन विफल रहा।');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-emerald-600" />
            <span>नगर निगम शिकायत प्रबंधन (Complaint Registry Management)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            कुल {total} शिकायतें • फील्ड अधिकारियों का आवंटन, स्थिति परिवर्तन और निवारण लॉग
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="टोकन आईडी, शिकायत शब्द, अधिकारी या विभाग खोजें..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
          >
            खोजें
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              श्रेणी (Category)
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              स्थिति (Status)
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              प्राथमिकता (Priority)
            </label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">लोड हो रहा है...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">कोड (ID)</th>
                  <th className="py-3 px-4">शिकायत (Text)</th>
                  <th className="py-3 px-4">श्रेणी (Category)</th>
                  <th className="py-3 px-4">वार्ड (Ward)</th>
                  <th className="py-3 px-4">प्राथमिकता (Priority)</th>
                  <th className="py-3 px-4">स्थिति (Status)</th>
                  <th className="py-3 px-4">अधिकारी (Officer)</th>
                  <th className="py-3 px-4">कार्रवाई (Action Taken)</th>
                  <th className="py-3 px-4 text-right">प्रबंधन (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {c.complaint_code}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800" title={c.complaint_text}>
                      {c.complaint_text}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {c.ward}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {c.assigned_officer || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {c.action_taken || 'Pending'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                        title="अद्यतन करें"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/complaints/${c.id}`}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors inline-block"
                        title="विवरण देखें"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            पृष्ठ <span className="font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-bold text-slate-900">{pages}</span> ({total} परिणाम)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Complaint Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {editingComplaint.complaint_code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  शिकायत स्थिति एवं निवारण अद्यतन
                </h3>
              </div>
              <button
                onClick={() => setEditingComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              "{editingComplaint.complaint_text}"
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  निवारण स्थिति (Status)
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  की गई कार्रवाई (Action Taken)
                </label>
                <input
                  type="text"
                  value={modalAction}
                  onChange={(e) => setModalAction(e.target.value)}
                  placeholder="उदा. Pipeline repaired, Waste removed, etc."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    अधिकारी आईडी (Assigned Officer)
                  </label>
                  <input
                    type="text"
                    value={modalOfficer}
                    onChange={(e) => setModalOfficer(e.target.value)}
                    placeholder="OFF015"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    निवारण समय (Days)
                  </label>
                  <input
                    type="number"
                    value={modalDays}
                    onChange={(e) => setModalDays(e.target.value ? Number(e.target.value) : '')}
                    placeholder="5"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {updating ? 'सहेज रहे हैं...' : 'अद्यतन सहेजें (Save)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
