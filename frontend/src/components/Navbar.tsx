'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  FileText,
  PlusCircle,
  BarChart3,
  BrainCircuit,
  ListOrdered,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'होम (Home)', href: '/' },
    ...(isAuthenticated
      ? [
          { name: 'डैशबोर्ड (Dashboard)', href: '/dashboard', icon: BarChart3 },
          { name: 'शिकायत दर्ज करें (Submit)', href: '/submit', icon: PlusCircle },
          { name: 'मेरी शिकायतें (My Complaints)', href: '/complaints', icon: FileText },
        ]
      : []),
    ...(isAdmin
      ? [
          { name: 'प्रशासन (Admin Hub)', href: '/admin', icon: ShieldCheck },
          { name: 'शिकायत प्रबंधन (Complaints)', href: '/admin/complaints', icon: ListOrdered },
          { name: 'ML मॉडल (ML Models)', href: '/admin/models', icon: BrainCircuit },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Shikayat<span className="text-emerald-600">AI</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    हिंदी NLP
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Smart Municipal Complaint & Resolution System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role} • {user.ward || 'Ward 1'}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  लॉग इन (Login)
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  पंजीकरण (Register)
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{user?.name} ({user?.role})</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-red-600 font-medium"
                >
                  लॉग आउट (Logout)
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-md"
                >
                  लॉग इन (Login)
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-emerald-600 rounded-md"
                >
                  पंजीकरण (Register)
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
