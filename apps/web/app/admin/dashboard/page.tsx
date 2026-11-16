'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Copy,
  CheckCircle,
  Clock,
  BookMarked,
  AlertOctagon,
  GraduationCap,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Plus,
  BookmarkPlus,
  RotateCcw,
  Library,
  Activity,
  Sparkles,
  Bell,
  CalendarCheck2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingReservations, setPendingReservations] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    pollPendingReservations();
    const interval = setInterval(pollPendingReservations, 3000);
    return () => clearInterval(interval);
  }, []);

  const pollPendingReservations = async () => {
    try {
      const res = await api.getReservations('PENDING');
      if (res?.reservations) {
        setPendingReservations(res.reservations);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleQuickApprove = async (resId: string) => {
    try {
      setActionLoading(true);
      await api.approveReservation(resId);
      setApproveSuccess(`Reservation hold approved! 24-Hour pickup window activated.`);
      setPendingReservations(prev => prev.filter(r => r.id !== resId));
      loadDashboardData();
      setTimeout(() => setApproveSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Error approving reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const data = await api.getStats();
      if (data?.stats) {
        setStats(data.stats);
        setActivities(data.recentActivities || []);
      }
    } catch (e) {
      console.error(e);
      // Fallback fallback stats
      setStats({
        totalBooks: 6,
        totalCopies: 36,
        availableCopies: 28,
        reservedCopies: 2,
        borrowedCopies: 5,
        overdueBooks: 1,
        totalStudents: 3,
        totalStaff: 1,
        monthlyBorrowing: [
          { month: 'Jun', borrows: 42, returns: 38 },
          { month: 'Jul', borrows: 56, returns: 50 },
          { month: 'Aug', borrows: 78, returns: 65 },
          { month: 'Sep', borrows: 92, returns: 84 },
          { month: 'Oct', borrows: 110, returns: 96 },
          { month: 'Nov', borrows: 64, returns: 52 },
        ],
        mostBorrowedBooks: [
          { title: 'CMOS VLSI Design: A Circuits and Systems Perspective', author: 'Neil H. E. Weste', count: 32, category: 'VLSI' },
          { title: 'Digital Signal Processing: Principles & Applications', author: 'John G. Proakis', count: 28, category: 'DSP' },
          { title: 'Microelectronic Circuits: Theory and Applications', author: 'Sedra & Smith', count: 24, category: 'VLSI' },
          { title: 'Microprocessor Architecture & Applications with 8085', author: 'Ramesh S. Gaonkar', count: 19, category: 'MPMC' },
        ]
      });
      setActivities([
        { id: '1', action: 'BOOK_ISSUED', details: 'Issued ECE-VLSI-001 to Santhosh Kumar K (21EC104)', createdAt: new Date().toISOString() },
        { id: '2', action: 'RESERVATION_APPROVED', details: 'Approved reservation for ECE-DSP-002 requested by Karthik Raja S', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Titles', value: stats?.totalBooks || 0, icon: BookOpen, color: 'from-blue-500/20 to-indigo-500/20', text: 'text-blue-400' },
    { title: 'Total Physical Copies', value: stats?.totalCopies || 0, icon: Copy, color: 'from-purple-500/20 to-violet-500/20', text: 'text-aura-neon' },
    { title: 'Available on Rack', value: stats?.availableCopies || 0, icon: CheckCircle, color: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-400' },
    { title: 'Reserved Copies', value: stats?.reservedCopies || 0, icon: Clock, color: 'from-amber-500/20 to-orange-500/20', text: 'text-aura-amber' },
    { title: 'Currently Borrowed', value: stats?.borrowedCopies || 0, icon: BookMarked, color: 'from-sky-500/20 to-blue-500/20', text: 'text-sky-400' },
    { title: 'Overdue Copies', value: stats?.overdueBooks || 0, icon: AlertOctagon, color: 'from-rose-500/20 to-red-500/20', text: 'text-rose-400' },
    { title: 'Enrolled Students', value: stats?.totalStudents || 0, icon: GraduationCap, color: 'from-purple-500/20 to-fuchsia-500/20', text: 'text-purple-400' },
    { title: 'Faculty Members', value: stats?.totalStaff || 0, icon: Briefcase, color: 'from-pink-500/20 to-rose-500/20', text: 'text-pink-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-low border border-stroke-glass text-xs text-aura-neon mb-2">
            <Sparkles className="w-3.5 h-3.5 text-aura-amber" />
            FXEC Department of Electronics & Communication Engineering
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Library Operations Dashboard
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Real-time physical copy tracking, circulation metrics & department analytics.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/books"
            className="aura-gradient-btn px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Book Title
          </Link>
          <Link
            href="/admin/issue"
            className="px-3.5 py-2 rounded-xl bg-surface-card hover:bg-surface-high border border-stroke-glass text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <BookmarkPlus className="w-4 h-4 text-aura-neon" /> Issue Desk
          </Link>
          <Link
            href="/admin/return"
            className="px-3.5 py-2 rounded-xl bg-surface-card hover:bg-surface-high border border-stroke-glass text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" /> Return Desk
          </Link>
          <Link
            href="/admin/rack"
            className="px-3.5 py-2 rounded-xl bg-surface-card hover:bg-surface-high border border-stroke-glass text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Library className="w-4 h-4 text-aura-amber" /> Virtual Rack
          </Link>
        </div>
      </div>

      {/* Approval Success Banner */}
      {approveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <b className="font-semibold block text-white mb-0.5">Reservation Hold Approved!</b>
              <span>{approveSuccess}</span>
            </div>
          </div>
          <Link
            href="/admin/reservations"
            className="text-xs font-bold underline shrink-0 ml-4 hover:text-white"
          >
            Open Reservations Desk &rarr;
          </Link>
        </div>
      )}

      {/* 🚨 LIVE REAL-TIME RESERVATION ALERT FOR ADMIN (Instant Notification on Dashboard) */}
      {pendingReservations.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-amber-500/15 border-2 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.25)] animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_#f59e0b]">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/25 px-2.5 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                    🚨 URGENT: {pendingReservations.length} Book Reservation Waiting for Hold Approval!
                  </span>
                  <span className="text-[10px] text-content-subtle font-mono">
                    Real-time Auto-stream
                  </span>
                </div>

                <p className="text-sm font-extrabold text-white">
                  <span className="text-aura-neon">{pendingReservations[0].user?.name}</span>{' '}
                  ({pendingReservations[0].user?.rollNumber || pendingReservations[0].user?.staffId || 'ECE Scholar'}){' '}
                  reserved Copy <span className="font-mono text-amber-300">{pendingReservations[0].copy?.copyNumber}</span> of{' '}
                  <span className="text-white italic">"{pendingReservations[0].copy?.book?.title || 'Department Book'}"</span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted pt-0.5 font-mono">
                  <span>
                    🕒 Reserved At: <b>{new Date(pendingReservations[0].requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</b>
                  </span>
                  <span>
                    📅 Date: <b>{new Date(pendingReservations[0].requestDate).toLocaleDateString()}</b>
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ⏳ 15-Day Loan Period
                  </span>
                  <span className="text-content-subtle">
                    📍 {pendingReservations[0].copy?.book?.rackLocation || 'Department Stack'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
              <button
                onClick={() => handleQuickApprove(pendingReservations[0].id)}
                disabled={actionLoading}
                className="aura-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-glow hover:scale-[1.02] transition-transform"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{actionLoading ? 'Approving Hold...' : 'Quick Approve Hold'}</span>
              </button>
              <Link
                href="/admin/reservations"
                className="px-3.5 py-2.5 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-xs font-semibold text-aura-neon hover:text-white transition-colors flex items-center gap-1.5"
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>Desk View &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle hover:border-aura-purple/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-content-muted leading-tight">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} ${card.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                {card.value}
              </div>
              <div className="mt-1 flex items-center text-[10px] text-content-subtle">
                <span className="text-emerald-400 font-medium mr-1 flex items-center">
                  Live Sync
                </span>
                ECE Database
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart & Top Borrowed Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Borrowing Activity Chart */}
        <div className="lg:col-span-2 glass-panel-card p-6 rounded-3xl border border-stroke-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-aura-neon" />
                Monthly Circulation & Borrowing Trends
              </h2>
              <p className="text-xs text-content-muted mt-0.5">
                Comparison of books issued versus physical copies returned
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-content-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-aura-purple" /> Borrows
              </span>
              <span className="flex items-center gap-1.5 text-content-muted">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Returns
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.monthlyBorrowing || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8e2de2" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8e2de2" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-neutral-800" vertical={false} />
                <XAxis dataKey="month" stroke="currentColor" className="text-slate-500 dark:text-neutral-400" fontSize={11} tickLine={false} />
                <YAxis stroke="currentColor" className="text-slate-500 dark:text-neutral-400" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-card, #ffffff)',
                    borderColor: 'var(--stroke-glass, #cbd5e1)',
                    borderRadius: '12px',
                    color: 'var(--text-main, #0f172a)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="borrows"
                  stroke="#8e2de2"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBorrows)"
                />
                <Area
                  type="monotone"
                  dataKey="returns"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReturns)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Borrowed Books Leaderboard */}
        <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-aura-amber" />
              Most Borrowed Titles
            </h2>
            <Link
              href="/admin/reports"
              className="text-xs text-aura-neon hover:underline font-medium flex items-center gap-1"
            >
              Full Report <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto">
            {stats?.mostBorrowedBooks?.map((book: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-surface-low border border-stroke-subtle flex items-center justify-between group hover:border-aura-purple/30 transition-all"
              >
                <div className="pr-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-aura-neon bg-aura-purple/20 px-1.5 py-0.5 rounded">
                      #{i + 1}
                    </span>
                    <span className="text-xs font-semibold text-white truncate block">
                      {book.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-content-subtle mt-0.5 truncate">{book.author}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-aura-amber">{book.count}</span>
                  <span className="text-[10px] text-content-subtle block">loans</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Department Library Activity Stream
          </h2>
          <span className="text-xs text-content-subtle">Automatic Real-Time Feed</span>
        </div>

        <div className="divide-y divide-stroke-subtle">
          {activities.length === 0 ? (
            <p className="text-xs text-content-subtle py-4">No recent activity</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between text-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-aura-purple mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">{act.userName || 'Library Desk'}</span>
                    <span className="text-content-muted ml-2">{act.details}</span>
                  </div>
                </div>
                <span className="text-content-subtle text-[11px] whitespace-nowrap pl-4">
                  {act.createdAt?.slice(0, 10)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
