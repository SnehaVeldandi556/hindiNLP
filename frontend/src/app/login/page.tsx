'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Lock, Mail, AlertCircle, ArrowRight, Shield, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@shikayatai.gov.in');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('कृपया ईमेल और पासवर्ड दोनों दर्ज करें।');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'लॉग इन विफल रहा। कृपया क्रेडेंशियल्स जांचें।');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@shikayatai.gov.in');
    setPassword('Admin@12345');
    setErrorMsg('');
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            प्रशासनिक लॉग इन (Admin Login)
          </h2>
          <p className="text-xs text-slate-500">
            शिकायतAI केंद्रीय नगरपालिका प्रशासन एवं शिकायत निवारण पोर्टल
          </p>
        </div>

        {/* Verified Admin Credentials Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>प्रशासन आईडी एवं पासवर्ड:</span>
            </span>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded transition-colors"
            >
              रीसेट भरें
            </button>
          </div>

          <div className="space-y-1 text-xs text-slate-700 font-mono bg-white p-2.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 select-none">ID: </span>
              <strong className="text-slate-900 select-all">admin@shikayatai.gov.in</strong>
            </div>
            <div>
              <span className="text-slate-400 select-none">PW: </span>
              <strong className="text-slate-900 select-all">Admin@12345</strong>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              प्रशासक ईमेल आईडी (Admin Email ID)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shikayatai.gov.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पासवर्ड (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white text-sm font-semibold shadow-md shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>प्रशासन लॉगिन करें (Admin Login)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
            ← मुख्य पृष्ठ पर वापस जाएं (Back to Home)
          </Link>
        </div>
      </div>
    </div>
  );
}
