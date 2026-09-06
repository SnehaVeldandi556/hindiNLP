'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Lock, Mail, AlertCircle, ArrowRight, Shield, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (email.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'लॉग इन विफल रहा। कृपया विवरण पुनः जांचें।');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    setLoading(true);
    login(demoEmail, demoPass)
      .then(() => {
        if (demoEmail.includes('admin')) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.detail || 'डेमो लॉग इन विफल रहा।');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            पोर्टल में लॉग इन करें (Login)
          </h2>
          <p className="text-xs text-slate-500">
            शिकायतAI नागरिक एवं प्रशासनिक निवारण मंच
          </p>
        </div>

        {/* 1-Click Demo Login Panel */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
            त्वरित डेमो क्रेडेंशियल्स (1-Click Demo Access):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('citizen@shikayatai.in', 'Citizen@12345')}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>नागरिक (Citizen)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@shikayatai.gov.in', 'Admin@12345')}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-sky-50 hover:text-sky-800 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Shield className="w-4 h-4 text-sky-600" />
              <span>प्रशासन (Admin)</span>
            </button>
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
              ईमेल पता (Email Address)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>लॉग इन करें (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            नया खाता बनाना चाहते हैं?{' '}
            <Link href="/register" className="text-emerald-600 hover:underline font-semibold">
              यहाँ पंजीकरण करें (Register)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
