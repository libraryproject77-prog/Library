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
  User,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';
import { supabaseService } from '@/lib/supabaseService';

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
  const [showUseAnother, setShowUseAnother] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const executeGoogleAdminLogin = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail.endsWith('@francisxavier.ac.in')) {
      setGoogleError("Couldn't sign you in. That account isn't authorized for FXEC Admin Console. Only official accounts ending in @francisxavier.ac.in are permitted.");
      return;
    }

    setGoogleAuthenticating(true);
    setGoogleError(null);

    try {
      await api.login(cleanEmail, 'ADMIN');

      try {
        await supabaseService.signInWithGoogle({
          redirectTo: `${window.location.origin}/admin/dashboard`,
          loginHint: cleanEmail
        });
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
      try {
        const supaRes = await supabaseService.loginUser(cleanEmail, cleanPassword);
        if (supaRes.success) {
          localStorage.setItem('fxec_token', 'admin-token');
          localStorage.setItem('fxec_user', JSON.stringify({
            id: supaRes.user?.id || 'usr-admin-1',
            name: supaRes.user?.name || 'Dr. S. K. Rajan',
            email: cleanEmail,
            role: 'ADMIN',
            avatarUrl: '/default-avatar.jpg',
            department: 'ECE'
          }));
          router.push('/admin/dashboard');
          return;
        }
      } catch (e) {}

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

        {/* Google Admin Chooser Modal (Matching Google Dark Mode Account Chooser) */}
        {googleModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setGoogleModalOpen(false)}
          >
            <div
              className="google-account-modal bg-[#131314] text-[#e3e3e3] rounded-3xl max-w-[440px] w-full p-6 sm:p-8 shadow-2xl border border-[#303030] relative overflow-hidden animate-scale-up font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Google Header */}
              <div className="flex items-center justify-between pb-5">
                <div className="flex items-center gap-2">
                  <GoogleIcon className="w-4 h-4" />
                  <span className="text-xs font-medium text-[#e3e3e3]">Sign in with Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  className="text-[#9aa0a6] hover:text-white p-1 rounded-full hover:bg-[#282a2d] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Triangle Brand Icon & Title (matching screenshot) */}
              <div className="mb-6">
                <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center mb-4 shadow-sm">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-black"></div>
                </div>
                <h3 className="text-2xl font-normal text-[#e3e3e3] tracking-tight">
                  Choose an account
                </h3>
                <p className="text-sm text-[#9aa0a6] mt-1">
                  to continue to <span className="text-[#e3e3e3] font-medium">FXEC Admin Console</span>
                </p>
              </div>

              {/* Error Alert when non-@francisxavier.ac.in account is selected */}
              {googleError && (
                <div className="mb-4 p-3 rounded-xl bg-[#3c1e1e] border border-[#f28b82]/40 text-[#f6aea9] text-xs flex items-start gap-2.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-[#f28b82] shrink-0 mt-0.5" />
                  <div className="flex-1 text-[11px] leading-relaxed">
                    <strong>Access Denied:</strong> {googleError}
                  </div>
                </div>
              )}

              {/* Accounts List */}
              <div className="divide-y divide-[#282a2d] border-t border-b border-[#282a2d] mb-4">
                {/* 1. Dr. S. K. Rajan (HOD/Admin - Institutional VALID) */}
                <button
                  type="button"
                  disabled={googleAuthenticating}
                  onClick={() => executeGoogleAdminLogin('admin.ece@francisxavier.ac.in')}
                  className="w-full py-3.5 px-1 hover:bg-[#1f1f20] transition-colors text-left flex items-center gap-3.5 group rounded-lg"
                >
                  <div className="w-9 h-9 rounded-full bg-[#a142f4] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    R
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#e3e3e3] group-hover:text-white truncate">
                      Dr. S. K. Rajan (HOD)
                    </div>
                    <div className="text-xs text-[#9aa0a6] truncate font-mono">
                      admin.ece@francisxavier.ac.in
                    </div>
                  </div>
                </button>

                {/* 2. Sample Personal Account (@gmail.com - Rejects when clicked!) */}
                <button
                  type="button"
                  disabled={googleAuthenticating}
                  onClick={() => executeGoogleAdminLogin('rajan.personal@gmail.com')}
                  className="w-full py-3.5 px-1 hover:bg-[#1f1f20] transition-colors text-left flex items-center gap-3.5 group rounded-lg opacity-85 hover:opacity-100"
                >
                  <div className="w-9 h-9 rounded-full bg-[#5f6368] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    P
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#e3e3e3] truncate flex items-center gap-2">
                      <span>Personal Account</span>
                      <span className="text-[10px] text-[#f28b82] border border-[#f28b82]/40 px-1 rounded">@gmail.com</span>
                    </div>
                    <div className="text-xs text-[#9aa0a6] truncate font-mono">
                      rajan.personal@gmail.com
                    </div>
                  </div>
                </button>

                {/* 3. Use another account */}
                {!showUseAnother ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUseAnother(true);
                      setGoogleError(null);
                    }}
                    className="w-full py-3.5 px-1 hover:bg-[#1f1f20] transition-colors text-left flex items-center gap-3.5 group rounded-lg"
                  >
                    <div className="w-9 h-9 rounded-full border border-[#5f6368] text-[#9aa0a6] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-medium text-[#e3e3e3] group-hover:text-white">
                      Use another account
                    </div>
                  </button>
                ) : (
                  <div className="py-3 px-1">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (customGoogleEmail) {
                          executeGoogleAdminLogin(customGoogleEmail);
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="text-xs text-[#9aa0a6]">
                        Enter administrator email (@francisxavier.ac.in):
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          required
                          autoFocus
                          value={customGoogleEmail}
                          onChange={(e) => {
                            setCustomGoogleEmail(e.target.value);
                            setGoogleError(null);
                          }}
                          placeholder="admin.ece@francisxavier.ac.in"
                          className="flex-1 px-3 py-2 rounded-xl bg-[#1f1f20] border border-[#3c4043] text-sm text-[#e3e3e3] placeholder:text-[#5f6368] focus:outline-none focus:border-[#8ab4f8] font-mono"
                        />
                        <button
                          type="submit"
                          disabled={googleAuthenticating || !customGoogleEmail}
                          className="px-4 py-2 rounded-xl bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] font-medium text-xs transition-colors disabled:opacity-50"
                        >
                          {googleAuthenticating ? 'Checking...' : 'Next'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowUseAnother(false)}
                        className="text-[11px] text-[#8ab4f8] hover:underline"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Bottom Notice */}
              <div className="pt-2 text-xs text-[#9aa0a6] leading-relaxed">
                Before using this app, you can review FXEC Library's{' '}
                <span className="text-[#8ab4f8] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                <span className="text-[#8ab4f8] hover:underline cursor-pointer">Terms of Service</span>.
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
