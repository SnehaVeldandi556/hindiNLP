import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ShikayatAI | Hindi Smart Complaint Classification System',
  description: 'AI-Powered Hindi & Hinglish Municipal Grievance Classification, Priority Assessment, and Resolution Recommendation System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className="bg-slate-50 min-h-screen flex flex-col text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">
                शिकायतAI (ShikayatAI) — Hindi Smart Complaint Classification & Resolution Analysis System
              </p>
              <p className="mt-1">
                Grounded on 2,000 Verified Municipal Complaints • TF-IDF NLP Pipeline • PostgreSQL Powered
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
