'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Mail,
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
  const [email, setEmail] = useState('santhosh.21ec104@francisxavier.ac.in');
  const [identifier, setIdentifier] = useState('21EC104');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Demo Profiles
  const demoProfiles = [
    {
      label: 'Santhosh Kumar K',
      role: 'STUDENT',
      sub: 'Roll No: 21EC104 • 1 Book/Day Quota (15 Days Return)',
      email: 'santhosh.21ec104@francisxavier.ac.in',
      id: 'usr-student-1',
      rollNumber: '21EC104',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    },
    {
      label: 'Karthik Raja S',
      role: 'STUDENT',
      sub: 'Roll No: 22EC045 • 1 Book/Day Quota (15 Days Return)',
      email: 'karthik.22ec045@francisxavier.ac.in',
      id: 'usr-student-2',
      rollNumber: '22EC045',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
    },
    {
      label: 'Prof. M. Revathi',
      role: 'STAFF',
      sub: 'Staff ID: FX-ECE-STF-014 • 3 Books/Day Quota (15 Days Return)',
      email: 'revathi.ece@francisxavier.ac.in',
      id: 'usr-staff-1',
      staffId: 'FX-ECE-STF-014',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const handleTabChange = (tab: 'STUDENT' | 'STAFF') => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'STUDENT') {
      setEmail('santhosh.21ec104@francisxavier.ac.in');
      setIdentifier('21EC104');
    } else {
      setEmail('revathi.ece@francisxavier.ac.in');
      setIdentifier('FX-ECE-STF-014');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.endsWith('@francisxavier.ac.in')) {
        throw new Error('Access denied. Please use your official @francisxavier.ac.in college email.');
      }

      await api.login(email, activeTab);
      // Route straight to Student/Staff portal dashboard
      router.push('/portal/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async (profile: any) => {
    setLoading(true);
    try {
      localStorage.setItem('fxec_user', JSON.stringify({
        ...profile,
        name: profile.label,
        department: 'ECE'
      }));
      localStorage.setItem('fxec_token', profile.role === 'STAFF' ? 'staff-token' : 'student-token');
      await api.login(profile.email, profile.role);
      router.push('/portal/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
            Log in to view 580+ books on the virtual wooden rack, reserve physical copies, and view your borrowing due dates.
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
                className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono uppercase"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full aura-gradient-btn py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] transition-transform"
            >
              <BookOpen className="w-4 h-4" />
              {loading
                ? 'Signing in...'
                : `Enter Portal as ${activeTab === 'STUDENT' ? 'Student' : 'Staff'}`}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stroke-subtle"></div>
            </div>
            <span className="relative px-3 bg-surface-card text-[10px] uppercase tracking-wider text-content-subtle font-semibold">
              Or 1-Click Instant Demo Login
            </span>
          </div>

          {/* 1-Click Quick Demo Switchers */}
          <div className="space-y-2">
            {demoProfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleInstantDemoLogin(p)}
                disabled={loading}
                className="w-full p-3 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-stroke-glass shrink-0">
                    <img src={p.avatarUrl} alt={p.label} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-aura-neon transition-colors flex items-center gap-1.5">
                      <span>{p.label}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-aura-purple/20 text-aura-neon">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-content-subtle font-mono">{p.sub}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-content-subtle group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
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
