'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Library,
  Clock,
  CalendarCheck2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  BookmarkPlus,
  Coins,
  History
} from 'lucide-react';
import { api } from '@/lib/api';

export default function StudentDashboardPage() {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fxec_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {}
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [borrowsRes, resRes, booksRes] = await Promise.all([
        api.getMyBorrowings(),
        api.getMyReservations(),
        api.getBooks()
      ]);

      if (borrowsRes?.transactions) setBorrowings(borrowsRes.transactions);
      if (resRes?.reservations) setReservations(resRes.reservations);
      if (booksRes?.books) setTrendingBooks(booksRes.books.slice(0, 4));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeLoans = borrowings.filter(t => t.status === 'BORROWED' || t.status === 'OVERDUE');
  const activeReservations = reservations.filter(r => r.status === 'PENDING' || r.status === 'APPROVED');
  const overdueLoans = borrowings.filter(t => t.status === 'OVERDUE');

  // Total fine
  const totalFine = borrowings.reduce((acc, curr) => {
    if (curr.fine && curr.fine.status === 'UNPAID') {
      return acc + (curr.fine.amount || 0);
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-low border border-stroke-glass text-xs text-aura-neon mb-2">
            <Sparkles className="w-3.5 h-3.5 text-aura-amber" />
            FXEC Department of Electronics & Communication Engineering
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Scholar'}!
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/portal/catalog"
            className="aura-gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <BookOpen className="w-4 h-4" /> Browse Catalogue
          </Link>
          <Link
            href="/portal/rack"
            className="px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-high border border-stroke-glass text-white text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Library className="w-4 h-4 text-aura-neon" /> 🪵 Open Virtual Rack
          </Link>
        </div>
      </div>

      {/* Due Date Alert / Warning Banner if overdue */}
      {overdueLoans.length > 0 ? (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-rose-200">
                Physical Return Alert: You have {overdueLoans.length} volume pending return!
              </div>
              <div className="text-[11px] text-content-muted">
                Please return physical copy immediately to the ECE Department Library Desk (Room ECE-204).
              </div>
            </div>
          </div>
          <Link
            href="/portal/borrowed"
            className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold shrink-0"
          >
            View Return Details
          </Link>
        </div>
      ) : activeLoans.length > 0 ? (
        <div className="p-4 rounded-2xl bg-surface-card border border-stroke-glass flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">
                Active Loan: {activeLoans[0]?.copy?.book?.title || 'Department Textbook'}
              </div>
              <div className="text-[11px] text-content-muted">
                Copy ID: <span className="font-mono text-aura-neon">{activeLoans[0]?.copy?.copyNumber}</span> &bull; Return within 15 Days (Due: {activeLoans[0]?.dueDate?.slice(0, 10)})
              </div>
            </div>
          </div>
          <Link
            href="/portal/borrowed"
            className="text-xs text-aura-neon hover:underline font-semibold flex items-center gap-1"
          >
            View Loans &rarr;
          </Link>
        </div>
      ) : null}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Books Borrowed */}
        <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-content-muted">Daily Borrow Quota</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {activeLoans.length} <span className="text-xs text-content-subtle font-normal">/ {currentUser?.role === 'STAFF' ? '3' : '1'} per day</span>
          </div>
          <div className="text-[11px] text-content-subtle mt-1">
            {currentUser?.role === 'STAFF' ? 'Faculty daily quota (3 books / day)' : 'Student daily quota (1 book / day)'}
          </div>
        </div>

        {/* Card 2: Active Reservations */}
        <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-content-muted">Active Hold Requests</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-aura-amber">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {activeReservations.length}
          </div>
          <div className="text-[11px] text-content-subtle mt-1">
            {activeReservations.some(r => r.status === 'APPROVED') ? 'Ready for pickup (24-Hr Hold)' : 'Pending HOD approval'}
          </div>
        </div>

        {/* Card 3: Loan Duration Standard */}
        <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-content-muted">Loan Duration</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            15 Days
          </div>
          <div className="text-[11px] text-content-subtle mt-1">
            Return within 15 days (Student & Staff)
          </div>
        </div>

        {/* Card 4: Account Status */}
        <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-content-muted">Institutional Standing</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-aura-neon">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-400 mt-1">
            Active Scholar
          </div>
          <div className="text-[11px] text-content-subtle mt-1">
            ECE Dept Library Access Enabled
          </div>
        </div>
      </div>

      {/* Main Grid: Currently Borrowed & Virtual Rack Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Current Active Borrowings */}
        <div className="lg:col-span-7 glass-panel-card p-6 rounded-3xl border border-stroke-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-stroke-subtle mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              My Current Borrowed Copies
            </h2>
            <Link href="/portal/borrowed" className="text-xs text-aura-neon hover:underline font-medium">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {activeLoans.length === 0 ? (
              <div className="p-8 text-center text-xs text-content-muted">
                You do not have any borrowed books out right now.
                <div className="mt-2">
                  <Link href="/portal/catalog" className="text-aura-neon hover:underline font-semibold">
                    Browse the ECE Catalogue to borrow &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              activeLoans.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-surface-low border border-stroke-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-white bg-surface-high px-2 py-0.5 rounded border border-stroke-subtle">
                        {tx.copy?.copyNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tx.status === 'OVERDUE' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{tx.copy?.book?.title}</h3>
                    <p className="text-xs text-content-muted mt-0.5">
                      Rack Location: <span className="text-white">{tx.copy?.book?.rackLocation || 'Rack ECE-01'}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-content-subtle block">Return Due Date</span>
                    <span className="text-xs font-bold text-white font-mono">{tx.dueDate?.slice(0, 10)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Rack & Reservation Feature Card */}
        <div className="lg:col-span-5 glass-panel-card p-6 rounded-3xl border border-stroke-subtle flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center text-white mb-4 shadow-glow">
              <Library className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              🪵 Virtual Book Rack
            </h3>
            <p className="text-xs text-content-muted leading-relaxed mb-4">
              Inspect physical books directly on our realistic wooden bookshelf. 
              Green LED spines are AVAILABLE and can be reserved instantly!
            </p>
            <div className="p-3 rounded-xl bg-surface-low border border-stroke-subtle space-y-1.5 text-xs text-content-muted">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span>Green Spines: Available for immediate hold</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Orange Spines: Reserved by other students</span>
              </div>
            </div>
          </div>

          <Link
            href="/portal/rack"
            className="aura-gradient-btn w-full py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2"
          >
            Launch Virtual Bookshelf <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recommended Textbooks */}
      <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle">
        <div className="flex items-center justify-between pb-4 border-b border-stroke-subtle mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-aura-neon" />
              Core Department Textbooks & References
            </h2>
            <p className="text-xs text-content-muted">Prescribed standard references for Anna University & Autonomous ECE curriculum</p>
          </div>
          <Link href="/portal/catalog" className="text-xs text-aura-neon hover:underline font-medium">
            Explore All 580+ Titles &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingBooks.map((book) => (
            <div
              key={book.id}
              className="p-4 rounded-2xl bg-surface-low border border-stroke-subtle hover:border-aura-purple/40 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="w-full h-32 rounded-xl overflow-hidden bg-surface-high mb-3 border border-stroke-glass">
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-[9px] uppercase font-bold text-aura-neon bg-aura-purple/20 px-2 py-0.5 rounded">
                  {book.category?.code || 'ECE'}
                </span>
                <h3 className="text-xs font-bold text-white mt-1.5 line-clamp-2">{book.title}</h3>
                <p className="text-[11px] text-content-subtle mt-0.5 truncate">{book.author}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stroke-subtle text-xs">
                <span className={`text-[10px] font-bold ${book.availableCopies > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {book.availableCopies > 0 ? `${book.availableCopies} On Shelf` : 'All Borrowed'}
                </span>
                <Link
                  href={`/portal/book/${book.id}`}
                  className="text-aura-neon hover:underline font-semibold text-[11px] flex items-center gap-0.5"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
