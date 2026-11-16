'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Building,
  CheckCircle2,
  Users
} from 'lucide-react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin.ece@francisxavier.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email.endsWith('@francisxavier.ac.in')) {
        throw new Error('Access denied. Administrator accounts must use @francisxavier.ac.in domain.');
      }

      await api.login(email, 'ADMIN');
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 relative overflow-hidden bg-void">
      {/* Background Neon Aura Glows */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-aura-purple/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-aura-violet/25 rounded-full blur-[140px] pointer-events-none" />

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
              Department Administration Console
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/portal/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-content-muted hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-aura-amber" />
            <span>Student / Staff Login &rarr;</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aura-purple/20 border border-aura-purple/30 text-aura-neon text-xs font-bold mb-3 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-aura-neon" />
            Librarian & Department HOD Terminal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Admin Portal Login
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Sign in to manage textbook inventory, copy IDs, reservations, and member circulation.
          </p>
        </div>

        <div className="glass-panel-card p-7 md:p-8 rounded-3xl border border-stroke-glass shadow-glass relative overflow-hidden">
          {/* Subtle Security watermark */}
          <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
            <ShieldCheck className="w-32 h-32 text-aura-purple" />
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1.5">
                Official Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.ece@francisxavier.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono"
                  required
                />
              </div>
              <span className="text-[10px] text-content-subtle mt-1 block">
                Authorized domain: <span className="text-aura-neon">@francisxavier.ac.in</span>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1.5">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors"
                  required
                />
              </div>
            </div>

            {/* Direct Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full aura-gradient-btn py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] transition-transform"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Authenticating Admin Access...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-6 text-[11px] text-content-subtle space-y-1">
          <p>
            Francis Xavier Engineering College (Autonomous) &bull; ECE Department Library
          </p>
          <p className="text-content-subtle/80">
            Institutional access restricted to authorized Department Library officers & HOD.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center text-[10px] text-content-subtle py-2 z-10">
        &copy; {new Date().getFullYear()} FXEC ECE Library System &bull; Production Terminal
      </footer>
    </div>
  );
}
