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
  AlertTriangle,
  Library,
  BookmarkCheck,
  CreditCard,
  UserPlus,
  LogIn,
  User,
  CheckCircle2,
  Building
} from 'lucide-react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

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
        status: 'ACTIVE',
        registeredAt: new Date().toISOString()
      };

      // Save to localStorage list of registered users
      existingUsers.unshift(newUser);
      localStorage.setItem('fxec_registered_users', JSON.stringify(existingUsers));

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

              <div className="pt-4 text-center border-t border-stroke-subtle">
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
                    placeholder={activeTab === 'STUDENT' ? 'e.g. Madasamy M' : 'e.g. Prof. M. Revathi'}
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

              <div className="pt-4 text-center border-t border-stroke-subtle">
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
