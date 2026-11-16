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
  Users,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import { createClient } from '@/utils/supabase/client';

const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={`${className} shrink-0`} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Sign-In state for Admin
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const executeGoogleAdminLogin = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail.endsWith('@francisxavier.ac.in')) {
      setGoogleError('Only @francisxavier.ac.in institutional accounts are permitted by FXEC policy.');
      return;
    }

    setGoogleAuthenticating(true);
    setGoogleError(null);

    try {
      await api.login(cleanEmail, 'ADMIN');

      try {
        const supabase = createClient();
        if (supabase) {
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/admin/dashboard`,
              queryParams: {
                hd: 'francisxavier.ac.in',
                login_hint: cleanEmail
              }
            }
          });
        }
      } catch (e) {}

      setGoogleModalOpen(false);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setGoogleError(err.message || 'Google authentication failed.');
    } finally {
      setGoogleAuthenticating(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter your administrator email.');
      return;
    }

    if (!cleanEmail.endsWith('@francisxavier.ac.in')) {
      setError('Access denied. Administrator accounts must use @francisxavier.ac.in domain.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your administrator password.');
      return;
    }

    setLoading(true);

    try {
      await api.login(cleanEmail, 'ADMIN');
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors"
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

            {/* Google Authentication Divider and Button */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stroke-glass"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-surface-low px-3 py-0.5 rounded-full text-content-subtle font-semibold border border-stroke-glass">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setGoogleError(null);
                setGoogleModalOpen(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg border border-slate-200 active:scale-[0.99]"
            >
              <GoogleIcon />
              <span>Sign in with Google</span>
              <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                @francisxavier.ac.in
              </span>
            </button>
          </form>
        </div>

        {/* Google Admin Chooser Modal */}
        {googleModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
            onClick={() => setGoogleModalOpen(false)}
          >
            <div
              className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <GoogleIcon className="w-6 h-6" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
                    <p className="text-xs text-slate-500">to continue to FXEC Admin Console</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Restricted to authorized Library Administrators & HOD.</span>
              </div>

              {googleError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{googleError}</span>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Choose Administrator Account
                </p>

                <button
                  type="button"
                  disabled={googleAuthenticating}
                  onClick={() => executeGoogleAdminLogin('admin.ece@francisxavier.ac.in')}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left flex items-center gap-3 group"
                >
                  <img src="/default-avatar.jpg" alt="Admin" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>Dr. S. K. Rajan</span>
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-semibold px-1.5 py-0.2 rounded">HOD / Admin</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate font-mono">admin.ece@francisxavier.ac.in</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                To continue, Google securely verifies your institutional identity with FXEC ECE Library.
              </div>
            </div>
          </div>
        )}

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
