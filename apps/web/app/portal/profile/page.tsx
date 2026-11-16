'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Briefcase,
  QrCode,
  Barcode,
  CheckCircle2,
  RefreshCw,
  Mail,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Info
} from 'lucide-react';
import { api } from '@/lib/api';

export default function StudentProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>({
    id: 'usr-student-1',
    name: 'Santhosh Kumar K',
    email: 'santhosh.21ec104@francisxavier.ac.in',
    role: 'STUDENT',
    rollNumber: '21EC104',
    department: 'ECE',
    avatarUrl: '/default-avatar.jpg'
  });

  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [reservationsCount, setReservationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('fxec_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (!u.avatarUrl || u.avatarUrl.includes('unsplash.com')) {
          u.avatarUrl = '/default-avatar.jpg';
          localStorage.setItem('fxec_user', JSON.stringify(u));
        }
        if (u.role !== 'ADMIN') {
          setCurrentUser(u);
        }
      } catch (e) {}
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [borrowsRes, resRes] = await Promise.all([
        api.getMyBorrowings(),
        api.getMyReservations()
      ]);
      if (borrowsRes?.transactions) {
        const active = borrowsRes.transactions.filter(
          (t: any) => t.status === 'BORROWED' || t.status === 'OVERDUE'
        );
        setActiveLoansCount(active.length);
      }
      if (resRes?.reservations) {
        const activeRes = resRes.reservations.filter(
          (r: any) => r.status === 'PENDING' || r.status === 'APPROVED'
        );
        setReservationsCount(activeRes.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isStaff = currentUser.role === 'STAFF';
  const maxQuota = isStaff ? 3 : 1;
  const loanDurationDays = 15;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <User className="w-7 h-7 text-aura-neon" />
            My Department Library Profile
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Institutional credentials, Digital Library Smart Card, and borrowing privileges.
          </p>
        </div>
      </div>

      {/* Hero Section: DIGITAL LIBRARY SMART CARD PREVIEW */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-content-subtle flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-aura-amber" />
          FXEC Autonomous Digital Library Card
        </h2>

        {/* 3D Glassmorphic Smart ID Card */}
        <div className="max-w-2xl mx-auto rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#1e1329] via-[#241733] to-[#120a1c] border-2 border-aura-purple/40 shadow-[0_15px_35px_rgba(142,45,226,0.25)] relative overflow-hidden group">
          {/* Card Hologram shimmer background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-aura-purple/10 to-aura-neon/10 pointer-events-none group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-aura-purple/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-stroke-glass pb-4 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center shadow-glow">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-black tracking-wider text-white uppercase">
                  FRANCIS XAVIER ENGINEERING COLLEGE
                </div>
                <div className="text-[10px] text-aura-neon font-semibold tracking-wide">
                  Autonomous Institution • Dept. of Electronics & Communication Engineering
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-surface-high/60 px-2.5 py-1 rounded-full border border-stroke-glass text-[10px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ACTIVE
            </div>
          </div>

          {/* Card Body */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-6 relative z-10">
            {/* Institutional User Badge */}
            <div className="w-24 h-24 rounded-2xl border-2 border-purple-200 bg-purple-50 shadow-md flex items-center justify-center text-purple-700 shrink-0">
              <User className="w-12 h-12" />
            </div>

            {/* Info Columns */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {currentUser.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-aura-purple/30 border border-aura-purple/40 text-[10px] font-bold text-aura-neon uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-content-muted mt-0.5 font-mono">
                  {currentUser.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-[10px] text-content-subtle uppercase block">
                    {isStaff ? 'Staff ID' : 'Roll Number'}
                  </span>
                  <span className="font-mono font-bold text-aura-neon text-sm">
                    {isStaff ? currentUser.staffId : currentUser.rollNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-content-subtle uppercase block">Department</span>
                  <span className="font-semibold text-white">ECE</span>
                </div>
                <div>
                  <span className="text-[10px] text-content-subtle uppercase block">Daily Book Quota</span>
                  <span className="font-semibold text-white">
                    {isStaff ? '3 Books / Day' : '1 Book / Day'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-content-subtle uppercase block">Return Period</span>
                  <span className="font-semibold text-white">15 Days per issue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer Barcode & QR code */}
          <div className="mt-6 pt-4 border-t border-stroke-glass flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2">
              <Barcode className="w-12 h-6 text-white/80" />
              <span className="text-[11px] font-mono tracking-widest text-white/90">
                {isStaff ? currentUser.staffId : currentUser.rollNumber}
              </span>
            </div>

            <div className="text-[9px] text-content-subtle tracking-wide uppercase">
              Official Dept. Library Card • Non-Transferable
            </div>
          </div>
        </div>
      </div>

      {/* Circulation Quota Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle">
          <span className="text-xs uppercase font-bold text-content-subtle tracking-wider">
            Daily Borrow Quota
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {activeLoansCount} / {maxQuota}
          </div>
          <span className="text-[11px] text-content-subtle mt-0.5 block">
            {isStaff ? '3 books per day limit' : '1 book per day limit'}
          </span>
          <div className="mt-3">
            <Link
              href="/portal/borrowed"
              className="text-xs text-aura-neon hover:text-white font-semibold inline-flex items-center gap-1"
            >
              <span>View Borrowed Books</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle">
          <span className="text-xs uppercase font-bold text-content-subtle tracking-wider">
            Active Hold Requests
          </span>
          <div className="text-2xl font-black text-aura-neon mt-1">{reservationsCount}</div>
          <span className="text-[11px] text-content-subtle mt-0.5 block">
            Holds on physical copies (24-Hr Hold)
          </span>
          <div className="mt-3">
            <Link
              href="/portal/reservations"
              className="text-xs text-aura-neon hover:text-white font-semibold inline-flex items-center gap-1"
            >
              <span>Track Reservations</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle">
          <span className="text-xs uppercase font-bold text-content-subtle tracking-wider">
            Academic Status
          </span>
          <div className="text-base font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Eligible for Circulation</span>
          </div>
          <span className="text-[11px] text-content-subtle mt-1 block">
            Institutional verification complete
          </span>
          <div className="mt-3">
            <Link
              href="/portal/history"
              className="text-xs text-aura-neon hover:text-white font-semibold inline-flex items-center gap-1"
            >
              <span>Past Return Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Department Library Circulation Policy Guidelines */}
      <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-aura-purple" />
          Francis Xavier Engineering College — Department Library Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-content-muted pt-1">
          <div className="p-4 rounded-2xl bg-surface-low border border-stroke-glass">
            <b className="text-white block mb-1">Daily Borrowing Quota</b>
            Students can borrow 1 book per day. Faculty members can borrow up to 3 books per day.
          </div>
          <div className="p-4 rounded-2xl bg-surface-low border border-stroke-glass">
            <b className="text-white block mb-1">15-Day Return Period</b>
            Both Students and Staff must return physical books within 15 days of issue date.
          </div>
        </div>
      </div>
    </div>
  );
}
