'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';

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

const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Open', 'In Progress', 'Closed'];

export default function ComplaintsListPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, [page, category, priority, status]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.complaints.list({
        page,
        limit,
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        priority: priority !== 'All' ? priority : undefined,
        status: status !== 'All' ? status : undefined,
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            नागरिक शिकायत सूची (Complaints Registry)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            कुल {total} पंजीकृत शिकायतें • बहुभाषी खोज एवं फ़िल्टर उपलब्ध
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>नई शिकायत दर्ज करें</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="शिकायत कोड (उदा. C00001), शब्द या विभाग खोजें..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
          >
            खोजें (Search)
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Category Filter */}
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

          {/* Priority Filter */}
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

          {/* Status Filter */}
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
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs">शिकायतें लोड हो रही हैं...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            कोई शिकायत नहीं मिली। कृपया अपने खोज मापदंड बदलें।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">कोड (ID)</th>
                  <th className="py-3 px-4">विवरण (Description)</th>
                  <th className="py-3 px-4">श्रेणी (Category)</th>
                  <th className="py-3 px-4">वार्ड (Ward)</th>
                  <th className="py-3 px-4">प्राथमिकता (Priority)</th>
                  <th className="py-3 px-4">स्थिति (Status)</th>
                  <th className="py-3 px-4">कार्रवाई (Action Taken)</th>
                  <th className="py-3 px-4 text-right">विवरण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {c.complaint_code}
                    </td>
                    <td className="py-3 px-4 max-w-sm truncate font-medium text-slate-800">
                      {c.complaint_text}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
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
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {c.action_taken || 'Pending'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            पृष्ठ (Page) <span className="font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-bold text-slate-900">{pages}</span> ({total} परिणाम)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>पिछला (Prev)</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 font-semibold"
            >
              <span>अगला (Next)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
