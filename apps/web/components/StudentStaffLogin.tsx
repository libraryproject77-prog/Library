'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  Library,
  BookmarkCheck,
  CreditCard,
  UserPlus,
  LogIn,
  User,
  CheckCircle2,
  Building,
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

export default function StudentStaffLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'STAFF'>('STUDENT');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // New Registration state
  const [regName, setRegName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regDepartment, setRegDepartment] = useState('ECE');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Google Sign-In Modal States
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [showUseAnother, setShowUseAnother] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [deviceAccounts, setDeviceAccounts] = useState<Array<{ email: string; name: string; role?: string }>>([]);

  const getGoogleAvatarBg = (str: string) => {
    const colors = [
      'bg-[#4285F4]', // Google Blue
      'bg-[#EA4335]', // Google Red
      'bg-[#34A853]', // Google Green
      'bg-[#FBBC05]', // Google Yellow
      'bg-[#8E24AA]', // Google Purple
      'bg-[#00897B]', // Teal
      'bg-[#E65100]', // Deep Orange
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    try {
      const accountsMap = new Map<string, { email: string; name: string; role?: string }>();

      // 1. Check existing device accounts
      const raw = localStorage.getItem('fxec_device_google_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((a: any) => {
            if (a?.email) accountsMap.set(a.email.toLowerCase(), a);
          });
        }
      }

      // 2. Check current logged in user
      const savedUser = localStorage.getItem('fxec_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.email && !accountsMap.has(u.email.toLowerCase())) {
          accountsMap.set(u.email.toLowerCase(), {
            email: u.email,
            name: u.name || u.email.split('@')[0],
            role: u.role
          });
        }
      }

      // 3. Check registered users on this device
      const regRaw = localStorage.getItem('fxec_registered_users');
      if (regRaw) {
        const regList = JSON.parse(regRaw);
        if (Array.isArray(regList)) {
          regList.forEach((r: any) => {
            if (r?.email && !accountsMap.has(r.email.toLowerCase())) {
              accountsMap.set(r.email.toLowerCase(), {
                email: r.email,
                name: r.name || r.email.split('@')[0],
                role: r.role
              });
            }
          });
        }
      }

      const list = Array.from(accountsMap.values());
      if (list.length > 0) {
        setDeviceAccounts(list);
        localStorage.setItem('fxec_device_google_accounts', JSON.stringify(list));
      }
    } catch (e) {}
  }, []);

  const executeGoogleLogin = async (
    targetEmail: string,
    targetName?: string,
    targetRole?: 'STUDENT' | 'STAFF'
  ) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail.endsWith('@francisxavier.ac.in')) {
      setGoogleError("Couldn't sign you in. That account isn't authorized for FXEC ECE Library. Only official accounts ending in @francisxavier.ac.in are permitted.");
      return;
    }

    setGoogleAuthenticating(true);
    setGoogleError(null);

    try {
      const roleToUse = targetRole || activeTab;
      const prefix = cleanEmail.split('@')[0];
      const namePart = prefix.split('.')[0];
      let displayName = targetName || (namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase());

      if (namePart.toLowerCase() === 'madasamym') {
        displayName = 'Madasamy M';
      } else if (namePart.toLowerCase() === 'kumar') {
        displayName = 'Kumar S';
      } else if (namePart.length > 4 && !targetName) {
        const lastChar = namePart.slice(-1).toUpperCase();
        const body = namePart.slice(0, -1);
        const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
        if (!vowels.includes(namePart.slice(-1).toLowerCase()) && vowels.includes(namePart.slice(-2, -1).toLowerCase())) {
          displayName = `${body.charAt(0).toUpperCase()}${body.slice(1).toLowerCase()} ${lastChar}`;
        }
      }

      // Check registered users in localStorage first
      let registeredUsers: any[] = [];
      try {
        registeredUsers = JSON.parse(localStorage.getItem('fxec_registered_users') || '[]');
      } catch (e) {}

      const registered = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);

      let user: any = null;
      if (registered) {
        user = {
          id: registered.id,
          name: registered.name || displayName,
          email: registered.email,
          role: registered.role || roleToUse,
          department: registered.department || 'ECE',
          rollNumber: registered.rollNumber,
          staffId: registered.staffId,
          avatarUrl: '/default-avatar.jpg',
        };
      } else {
        try {
          const res = await api.login(cleanEmail, roleToUse);
          if (res?.user) user = res.user;
        } catch (e) {}

        if (!user) {
          user = {
            id: `usr-google-${Date.now()}`,
            name: displayName,
            email: cleanEmail,
            role: roleToUse,
            department: 'ECE',
            rollNumber: roleToUse === 'STUDENT' ? '25EC001' : undefined,
            staffId: roleToUse === 'STAFF' ? 'FX-ECE-STF-014' : undefined,
            avatarUrl: '/default-avatar.jpg',
          };
        }
      }

      localStorage.setItem('fxec_user', JSON.stringify(user));
      localStorage.setItem('fxec_token', user.role === 'STAFF' ? 'staff-token' : 'student-token');

      // Save this real device account so it shows on this phone/laptop
      try {
        const existing = deviceAccounts.filter(a => a.email.toLowerCase() !== cleanEmail);
        const updatedAccounts = [...existing, { email: cleanEmail, name: user.name || displayName, role: user.role || roleToUse }];
        setDeviceAccounts(updatedAccounts);
        localStorage.setItem('fxec_device_google_accounts', JSON.stringify(updatedAccounts));
      } catch (e) {}

      // Sync user profile directly into Supabase database
      try {
        await supabaseService.upsertProfile({
          id: user.id,
          email: cleanEmail,
          name: user.name || displayName,
          role: user.role || roleToUse,
          department: user.department || 'ECE',
          rollNumber: user.rollNumber,
          staffId: user.staffId,
          status: 'ACTIVE',
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {}

      setGoogleModalOpen(false);
      router.push('/portal/dashboard');
    } catch (err: any) {
      setGoogleError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setGoogleAuthenticating(false);
    }
  };

  const handleTabChange = (tab: 'STUDENT' | 'STAFF') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
  };

  const handleModeChange = (newMode: 'LOGIN' | 'REGISTER') => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle New User Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanName = regName.trim();
    const cleanId = regIdentifier.trim().toUpperCase();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPass = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanId) {
      setError(activeTab === 'STUDENT' ? 'Please enter your Student Roll Number.' : 'Please enter your Faculty Staff ID.');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter your official institutional college email.');
      return;
    }

    if (!cleanEmail.endsWith('@francisxavier.ac.in')) {
      setError('Access denied. Institutional email must end with @francisxavier.ac.in');
      return;
    }

    if (!cleanPass || cleanPass.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check existing users in localStorage
      let existingUsers: any[] = [];
      try {
        existingUsers = JSON.parse(localStorage.getItem('fxec_registered_users') || '[]');
      } catch (e) {}

      const duplicate = existingUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (duplicate) {
        setError('An account with this institutional email is already registered. Please sign in directly.');
        setLoading(false);
        return;
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: activeTab,
        rollNumber: activeTab === 'STUDENT' ? cleanId : undefined,
        staffId: activeTab === 'STAFF' ? cleanId : undefined,
        department: regDepartment || 'ECE',
        avatarUrl: '/default-avatar.jpg',
        status: 'ACTIVE',
        registeredAt: new Date().toISOString()
      };

      // Save to localStorage list of registered users
      existingUsers.unshift(newUser);
      localStorage.setItem('fxec_registered_users', JSON.stringify(existingUsers));

      // Attempt to save to Supabase
      try {
        await supabaseService.registerUser({
          email: cleanEmail,
          password: cleanPass,
          name: cleanName,
          role: activeTab,
          department: regDepartment || 'ECE',
          rollNumber: activeTab === 'STUDENT' ? cleanId : undefined,
          staffId: activeTab === 'STAFF' ? cleanId : undefined,
          avatarUrl: '/default-avatar.jpg'
        });
      } catch (e) {
        console.warn('[Supabase] Register sync:', e);
      }

      // Attempt to save to backend
      try {
        await api.register(newUser);
      } catch (e) {
        // offline fallback is safe
      }

      // Switch to login tab, prefill email
      setEmail(cleanEmail);
      setPassword('');
      setRegName('');
      setRegIdentifier('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setMode('LOGIN');
      setSuccessMessage(`Registration successful for ${cleanName}! Please enter your password to sign in.`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

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

    // 0. First attempt Supabase Auth if available
    try {
      const supaRes = await supabaseService.loginUser(cleanEmail, cleanPass);
      if (supaRes.success && supaRes.user) {
        localStorage.setItem('fxec_user', JSON.stringify(supaRes.user));
        localStorage.setItem('fxec_token', supaRes.user.role === 'STAFF' ? 'staff-token' : 'student-token');
        router.push('/portal/dashboard');
        return;
      }
    } catch (e) {
      // Graceful fallback to local/registered credentials
    }

    // 1. First check registered users in localStorage
    let registeredUsers: any[] = [];
    try {
      registeredUsers = JSON.parse(localStorage.getItem('fxec_registered_users') || '[]');
    } catch (e) {}

    const registered = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (registered) {
      // Validate password
      if (registered.password && registered.password !== cleanPass) {
        setError('Incorrect password. Please enter the password you registered with.');
        setLoading(false);
        return;
      }

      // Password matches! Log in with full registered details
      const user = {
        id: registered.id,
        name: registered.name,
        email: registered.email,
        role: registered.role || activeTab,
        department: registered.department || 'ECE',
        rollNumber: registered.rollNumber,
        staffId: registered.staffId,
        avatarUrl: (registered.avatarUrl && !registered.avatarUrl.includes('unsplash.com')) ? registered.avatarUrl : '/default-avatar.jpg',
      };

      localStorage.setItem('fxec_user', JSON.stringify(user));
      localStorage.setItem('fxec_token', user.role === 'STAFF' ? 'staff-token' : 'student-token');

      try {
        await api.login(cleanEmail, user.role);
      } catch (e) {}

      router.push('/portal/dashboard');
      return;
    }

    // 2. Fallback to built-in accounts or auto-parsing
    const prefix = cleanEmail.split('@')[0];
    const namePart = prefix.split('.')[0];
    let displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();

    // Intelligent initial detection (e.g. madasamym -> Madasamy M)
    if (namePart.toLowerCase() === 'madasamym') {
      displayName = 'Madasamy M';
    } else if (namePart.length > 4) {
      const lastChar = namePart.slice(-1).toUpperCase();
      const body = namePart.slice(0, -1);
      const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
      if (!vowels.includes(namePart.slice(-1).toLowerCase()) && vowels.includes(namePart.slice(-2, -1).toLowerCase())) {
        displayName = `${body.charAt(0).toUpperCase()}${body.slice(1).toLowerCase()} ${lastChar}`;
      }
    }

    try {
      const res = await api.login(cleanEmail, activeTab);
      const user = res.user || {
        id: `usr-${prefix}`,
        name: displayName,
        email: cleanEmail,
        role: activeTab,
        department: 'ECE',
        rollNumber: activeTab === 'STUDENT' ? '25EC001' : undefined,
        staffId: activeTab === 'STAFF' ? 'FX-ECE-STF-014' : undefined,
        avatarUrl: '/default-avatar.jpg',
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
              Student &amp; Staff Access Portal
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
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
            {mode === 'LOGIN' ? 'Student & Staff Portal Login' : 'New Registration'}
          </h1>
          <p className="text-xs text-content-muted mt-1 max-w-md mx-auto">
            {mode === 'LOGIN'
              ? 'Please enter your official institutional credentials to access textbook catalogue and virtual racks.'
              : 'Register your details to create an official Department Library borrowing account.'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-glass shadow-glass">
          {/* Role Switcher: Student vs Staff */}
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
              <span>Student</span>
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

          {/* Notifications */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                    placeholder={
                      activeTab === 'STUDENT'
                        ? 'name.ug.25.ec@francisxavier.ac.in'
                        : 'name@francisxavier.ac.in'
                    }
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
                <LogIn className="w-4 h-4" />
                {loading
                  ? 'Signing in...'
                  : `Sign In as ${activeTab === 'STUDENT' ? 'Student' : 'Staff'}`}
              </button>

              {/* Google Authentication Divider and Button */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stroke-subtle"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-surface-low px-3 py-0.5 rounded-full text-content-subtle font-semibold border border-stroke-subtle">
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
              </button>

              <div className="pt-3 text-center border-t border-stroke-subtle">
                <button
                  type="button"
                  onClick={() => handleModeChange('REGISTER')}
                  className="text-xs text-aura-neon hover:underline font-semibold flex items-center justify-center gap-1.5 mx-auto"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Click here for New Registration &rarr;</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. NEW REGISTRATION FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  Full Name (with Initial)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={activeTab === 'STUDENT' ? 'e.g. Kumar S' : 'e.g. Prof. M. Revathi'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    {activeTab === 'STUDENT' ? 'Roll Number' : 'Staff ID'}
                  </label>
                  <input
                    type="text"
                    value={regIdentifier}
                    onChange={(e) => setRegIdentifier(e.target.value)}
                    placeholder={activeTab === 'STUDENT' ? 'e.g. 25EC001' : 'e.g. FX-ECE-STF-015'}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="ECE"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-semibold uppercase"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  Official Institutional College Email (@francisxavier.ac.in)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={
                      activeTab === 'STUDENT'
                        ? 'name.ug.25.ec@francisxavier.ac.in'
                        : 'name@francisxavier.ac.in'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-content-subtle absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content placeholder:text-content-subtle focus:outline-none focus:border-aura-purple transition-colors font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full aura-gradient-btn py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] transition-transform mt-2"
              >
                <UserPlus className="w-4 h-4" />
                {loading
                  ? 'Creating Account...'
                  : `Complete Registration for ${activeTab === 'STUDENT' ? 'Student' : 'Staff'}`}
              </button>

              {/* Google Authentication Divider and Button */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stroke-subtle"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-surface-low px-3 py-0.5 rounded-full text-content-subtle font-semibold border border-stroke-subtle">
                    Or register with
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
                <span>Register with Google</span>
              </button>

              <div className="pt-3 text-center border-t border-stroke-subtle">
                <button
                  type="button"
                  onClick={() => handleModeChange('LOGIN')}
                  className="text-xs text-content-muted hover:text-white font-semibold flex items-center justify-center gap-1 mx-auto"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Already have an account? Back to Sign In &rarr;</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Google Institutional Account Chooser Modal (Clean Google Light Theme) */}
        {googleModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setGoogleModalOpen(false)}
          >
            <div
              className="bg-white text-slate-900 rounded-3xl max-w-[440px] w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden animate-scale-up font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Google Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <GoogleIcon className="w-4 h-4" />
                  <span className="text-xs font-semibold text-slate-700">Sign in with Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Triangle Brand Icon & Title */}
              <div className="my-5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-3 shadow-sm">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white"></div>
                </div>
                <h3 className="text-2xl font-normal text-slate-900 tracking-tight">
                  Choose an account
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  to continue to <span className="text-slate-800 font-semibold">FXEC Library</span>
                </p>
              </div>

              {/* Error Alert when invalid non-@francisxavier.ac.in account is selected */}
              {googleError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-[11px] leading-relaxed">
                    <strong className="font-bold">Access Denied:</strong> {googleError}
                  </div>
                </div>
              )}

              {/* Account Chooser / Email Input */}
              {deviceAccounts.length > 0 && !showUseAnother ? (
                <div className="divide-y divide-slate-100 border-t border-b border-slate-200 mb-4">
                  {deviceAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={googleAuthenticating}
                      onClick={() => executeGoogleLogin(acc.email, acc.name, acc.role as any)}
                      className="w-full py-3.5 px-2 hover:bg-slate-50 transition-colors text-left flex items-center gap-3.5 group rounded-xl"
                    >
                      <div className={`w-9 h-9 rounded-full ${getGoogleAvatarBg(acc.email)} text-white flex items-center justify-center text-sm font-semibold shrink-0 shadow-sm`}>
                        {acc.name ? acc.name.charAt(0).toUpperCase() : acc.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                          {acc.name || acc.email.split('@')[0]}
                        </div>
                        <div className="text-xs text-slate-500 truncate font-mono">
                          {acc.email}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Use another account button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowUseAnother(true);
                      setGoogleError(null);
                    }}
                    className="w-full py-3.5 px-2 hover:bg-slate-50 transition-colors text-left flex items-center gap-3.5 group rounded-xl"
                  >
                    <div className="w-9 h-9 rounded-full border border-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">
                      Use another account
                    </div>
                  </button>
                </div>
              ) : (
                /* Google Email Input Form (Shown when no device accounts or when "Use another account" clicked) */
                <div className="py-2 mb-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customGoogleEmail) {
                        executeGoogleLogin(customGoogleEmail);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email or phone
                      </label>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={customGoogleEmail}
                        onChange={(e) => {
                          setCustomGoogleEmail(e.target.value);
                          setGoogleError(null);
                        }}
                        placeholder="yourname@francisxavier.ac.in"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                      />
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        Only institutional Google accounts ending in <b>@francisxavier.ac.in</b> are permitted.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {deviceAccounts.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setShowUseAnother(false);
                            setGoogleError(null);
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          &larr; Back to device accounts
                        </button>
                      ) : (
                        <span />
                      )}
                      <button
                        type="submit"
                        disabled={googleAuthenticating || !customGoogleEmail.trim()}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {googleAuthenticating ? 'Signing in...' : 'Next'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Bottom Notice */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
                Before using this app, you can review FXEC Library's{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span>.
              </div>
            </div>
          </div>
        )}

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
