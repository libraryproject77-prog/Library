'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Library,
  BookmarkCheck,
  CreditCard
} from 'lucide-react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

export default function StudentStaffLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: 'STUDENT' | 'STAFF') => {
    setActiveTab(tab);
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      setError(activeTab === 'STUDENT' ? 'Please enter your Student Roll Number.' : 'Please enter your Faculty Staff ID.');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter your official college email address.');
      return;
    }

    if (!cleanEmail.endsWith('@francisxavier.ac.in')) {
      setError('Access denied. Please use your official @francisxavier.ac.in college email.');
      return;
    }

    if (!cleanPass) {
      setError('Please enter your portal password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.login(cleanEmail, activeTab);
      const user = res.user || {
        id: `usr-${cleanId.toLowerCase()}`,
        name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email: cleanEmail,
        role: activeTab,
        department: 'ECE',
        rollNumber: activeTab === 'STUDENT' ? cleanId.toUpperCase() : undefined,
        staffId: activeTab === 'STAFF' ? cleanId.toUpperCase() : undefined
      };
      localStorage.setItem('fxec_user', JSON.stringify(user));
      localStorage.setItem('fxec_token', activeTab === 'STAFF' ? 'staff-token' : 'student-token');
      // Route straight to Student/Staff portal dashboard
      router.push('/portal/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 relative overflow-hidden bg-void">
      {/* Background Neon Aura Glows */}
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 bg-aura-purple/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-aura-neon/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10 py-2">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              FXEC <span className="text-aura-neon">ECE LIBRARY</span>
            </div>
            <div className="text-[10px] text-content-subtle tracking-wide uppercase">
              Scholar & Faculty Access Portal
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/admin/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-content-muted hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-aura-purple" />
            <span>Switch to Admin Login &rarr;</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-lg mx-auto my-auto z-10 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aura-neon/15 border border-aura-neon/30 text-aura-neon text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-aura-amber" />
            Francis Xavier Engineering College &bull; ECE Department
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Student & Staff Portal Login
          </h1>
          <p className="text-xs text-content-muted mt-1 max-w-md mx-auto">
            Please enter your official institutional credentials to access textbook catalogue and virtual racks.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-glass shadow-glass">
          {/* Tab Switcher: Student vs Staff */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-surface-low border border-stroke-subtle mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('STUDENT')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'STUDENT'
                  ? 'bg-aura-purple text-white shadow-glow'
                  : 'text-content-muted hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Scholar</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('STAFF')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'STAFF'
                  ? 'bg-aura-purple text-white shadow-glow'
                  : 'text-content-muted hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Faculty / Staff</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1.5">
                {activeTab === 'STUDENT' ? 'Student Roll Number' : 'Faculty Staff ID'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeTab === 'STUDENT' ? 'e.g. 21EC104' : 'e.g. FX-ECE-STF-014'}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1.5">
                Institutional College Email (@francisxavier.ac.in)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@francisxavier.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1.5">
                Portal Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full aura-gradient-btn py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] transition-transform mt-2"
            >
              <BookOpen className="w-4 h-4" />
              {loading
                ? 'Signing in...'
                : `Enter Portal as ${activeTab === 'STUDENT' ? 'Student' : 'Staff'}`}
            </button>
          </form>
        </div>

        {/* Feature Highlights beneath login */}
        <div className="grid grid-cols-3 gap-3 mt-6 text-center">
          <div className="p-3 rounded-2xl bg-surface-low/50 border border-stroke-glass">
            <Library className="w-4 h-4 text-aura-neon mx-auto mb-1" />
            <div className="text-[10px] font-bold text-white">Virtual Wooden Rack</div>
            <div className="text-[9px] text-content-subtle">Physical shelf view</div>
          </div>
          <div className="p-3 rounded-2xl bg-surface-low/50 border border-stroke-glass">
            <BookmarkCheck className="w-4 h-4 text-aura-neon mx-auto mb-1" />
            <div className="text-[10px] font-bold text-white">1-Click Reserve</div>
            <div className="text-[9px] text-content-subtle">24-hour hold window</div>
          </div>
          <div className="p-3 rounded-2xl bg-surface-low/50 border border-stroke-glass">
            <CreditCard className="w-4 h-4 text-aura-neon mx-auto mb-1" />
            <div className="text-[10px] font-bold text-white">Digital Smart ID</div>
            <div className="text-[9px] text-content-subtle">Barcoded loan card</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center text-[10px] text-content-subtle py-2 z-10">
        Francis Xavier Engineering College (Autonomous) &bull; Department of Electronics & Communication Engineering
      </footer>
    </div>
  );
}
