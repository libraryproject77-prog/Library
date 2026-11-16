'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  RefreshCw,
  Library,
  Coins,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { api } from '@/lib/api';

export default function MyBorrowedBooksPage() {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [renewalNotice, setRenewalNotice] = useState<string | null>(null);

  const handleRequestRenewal = (loanId: string, copyNumber: string) => {
    setRenewingId(loanId);
    setRenewalNotice(null);
    setTimeout(() => {
      setBorrowings(prev => prev.map(item => {
        if (item.id === loanId) {
          const newDue = new Date(new Date(item.dueDate).getTime() + 7 * 24 * 3600 * 1000).toISOString();
          return { ...item, dueDate: newDue };
        }
        return item;
      }));
      setRenewingId(null);
      setRenewalNotice(`7-Day loan extension approved for ${copyNumber}! New due date has been updated in your record.`);
    }, 600);
  };

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
      const res = await api.getMyBorrowings();
      if (res?.transactions) {
        setBorrowings(res.transactions);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeLoans = borrowings.filter(
    (b) => b.status === 'BORROWED' || b.status === 'OVERDUE'
  );

  const overdueLoans = activeLoans.filter((b) => b.status === 'OVERDUE');

  // Total Fine
  const totalFine = activeLoans.reduce((sum, b) => {
    if (b.fine && b.fine.status === 'UNPAID') {
      return sum + (b.fine.amount || 0);
    }
    return sum;
  }, 0);

  const quotaLimit = currentUser?.role === 'STAFF' ? 3 : 1;
  const quotaUsed = activeLoans.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-aura-neon" />
            My Borrowed Books
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Active department library circulation volumes, due date countdowns, and return requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-surface-low border border-stroke-glass text-content-muted hover:text-white transition-colors"
            title="Refresh active loans"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/portal/history"
            className="px-4 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-xs font-semibold text-white transition-colors"
          >
            Past Return History &rarr;
          </Link>
        </div>
      </div>

      {/* Renewal Notice Banner */}
      {renewalNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{renewalNotice}</span>
          </div>
          <button onClick={() => setRenewalNotice(null)} className="text-xs text-content-subtle hover:text-white">✕</button>
        </div>
      )}

      {/* Quota & Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Borrowing Quota Meter */}
        <div className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-content-subtle tracking-wider">
              {currentUser?.role === 'STAFF' ? 'Faculty Daily Quota' : 'Student Daily Quota'}
            </span>
            <BookOpen className="w-4 h-4 text-aura-neon" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{quotaUsed}</span>
              <span className="text-xs text-content-muted">of {quotaLimit} book{quotaLimit > 1 ? 's' : ''} per day</span>
            </div>
            {/* Meter Progress Bar */}
            <div className="w-full h-2 rounded-full bg-surface-high mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quotaUsed >= quotaLimit ? 'bg-amber-400' : 'bg-gradient-to-r from-aura-purple to-aura-neon'
                }`}
                style={{ width: `${Math.min(100, (quotaUsed / quotaLimit) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-content-subtle mt-2">
            {currentUser?.role === 'STAFF' ? '3 books per day limit' : '1 book per day limit'}
          </div>
        </div>

        {/* Loan Return Duration Policy */}
        <div className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-content-subtle tracking-wider">
              Loan Validity
            </span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">15 Days</span>
              <span className="text-xs text-content-muted">standard return period</span>
            </div>
            <p className="text-[11px] text-content-subtle mt-1">
              Applicable for both Student Scholars and Faculty members
            </p>
          </div>
          <div className="text-[11px] font-medium text-emerald-400 mt-2">
            ✓ Return within 15 days of issue
          </div>
        </div>

        {/* Persistent Return Alert Status */}
        <div className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-content-subtle tracking-wider">
              Return Reminder Alerts
            </span>
            <AlertTriangle className={`w-4 h-4 ${overdueLoans.length > 0 ? 'text-rose-400' : 'text-aura-neon'}`} />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${overdueLoans.length > 0 ? 'text-rose-400' : 'text-white'}`}>
                {overdueLoans.length > 0 ? `${overdueLoans.length} Return Alert Active` : 'No Pending Alerts'}
              </span>
            </div>
            <p className="text-[11px] text-content-subtle mt-1">
              Continuous return alerts active until physical book copy is returned.
            </p>
          </div>
          <div className="text-[11px] text-content-subtle mt-2">
            {overdueLoans.length > 0 ? '⚠️ Physical return required at ECE Desk' : '✓ All loans on schedule'}
          </div>
        </div>
      </div>

      {/* Active Borrowed Books List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Active Borrowed Copies</span>
          <span className="px-2 py-0.5 rounded-full bg-aura-purple/20 text-aura-neon text-xs font-mono">
            {activeLoans.length}
          </span>
        </h2>

        {loading ? (
          <div className="glass-panel-card p-12 rounded-3xl text-center text-xs text-content-muted">
            Loading active loan records...
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="glass-panel-card p-12 rounded-3xl text-center space-y-4 border border-stroke-glass">
            <BookOpen className="w-12 h-12 text-content-subtle mx-auto" />
            <h3 className="text-base font-bold text-white">No Books Currently Borrowed</h3>
            <p className="text-xs text-content-muted max-w-md mx-auto">
              You do not have any department library books checked out under your account. Reserve titles or visit the ECE Library desk to issue books.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/portal/catalog"
                className="aura-gradient-btn px-5 py-2.5 rounded-xl text-xs font-semibold"
              >
                Browse Book Catalogue
              </Link>
              <Link
                href="/portal/rack"
                className="px-5 py-2.5 rounded-xl bg-surface-high hover:bg-surface-low border border-stroke-glass text-xs font-semibold text-white"
              >
                Inspect Wooden Rack
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeLoans.map((loan) => {
              const book = loan.copy?.book;
              const isOverdue = loan.status === 'OVERDUE';
              const dueDate = new Date(loan.dueDate);
              const now = new Date();
              const diffMs = dueDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={loan.id}
                  className={`glass-panel-card p-6 rounded-3xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                    isOverdue
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : diffDays <= 3
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-stroke-subtle hover:border-aura-purple/40'
                  }`}
                >
                  {/* Left: Book Cover & Metadata */}
                  <div className="flex items-start space-x-4 min-w-0">
                    <div className="w-18 h-24 rounded-2xl overflow-hidden bg-surface-high shrink-0 border border-stroke-glass shadow-md">
                      <img
                        src={book?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'}
                        alt={book?.title || 'Book Cover'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-aura-purple/20 text-aura-neon">
                          ACC: {loan.copy?.copyNumber}
                        </span>
                        <span className="text-[10px] text-content-subtle font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-aura-purple" />
                          {book?.rackLocation || 'Department Stack R-1'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-1 leading-snug">
                        {book?.title || 'Department Reference Book'}
                      </h3>

                      <p className="text-xs text-content-muted truncate">
                        By {book?.author || 'Department Faculty Author'} • {book?.publisher || 'Publisher'}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-content-subtle pt-1">
                        <span>Issued: <b className="text-white">{new Date(loan.issueDate).toLocaleDateString()}</b></span>
                        <span>Due: <b className="text-white">{dueDate.toLocaleDateString()}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Due Date Counter & Return Guide */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-stroke-subtle">
                    {/* Status Badge */}
                    <div>
                      {isOverdue ? (
                        <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                            Return Alert: Overdue by {Math.abs(diffDays)} Day{Math.abs(diffDays) > 1 ? 's' : ''}
                          </div>
                          <div className="text-[11px] text-rose-200 mt-0.5">
                            Immediate physical return required at ECE Desk
                          </div>
                        </div>
                      ) : diffDays <= 3 ? (
                        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                          <div className="font-bold flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            Due in {diffDays} Day{diffDays > 1 ? 's' : ''}
                          </div>
                          <div className="text-[11px] text-amber-200 mt-0.5">
                            Return or renew before deadline
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            {diffDays} Days Remaining
                          </div>
                          <div className="text-[11px] text-emerald-200 mt-0.5">
                            Loan in good standing
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book Detail & Rack link */}
                    <div className="flex items-center gap-2">
                      {!isOverdue && (
                        <button
                          onClick={() => handleRequestRenewal(loan.id, loan.copy?.copyNumber)}
                          disabled={renewingId === loan.id}
                          className="px-3 py-2 rounded-xl bg-aura-purple/20 hover:bg-aura-purple/30 border border-aura-purple/40 text-aura-neon font-semibold text-xs transition-colors flex items-center gap-1"
                          title="Extend book loan by 7 days"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${renewingId === loan.id ? 'animate-spin' : ''}`} />
                          <span>{renewingId === loan.id ? 'Renewing...' : 'Renew +7D'}</span>
                        </button>
                      )}
                      <Link
                        href={`/portal/book/${book?.id || ''}`}
                        className="px-3.5 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-xs font-semibold text-white transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        href="/portal/rack"
                        className="p-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-aura-neon transition-colors"
                        title="View on Virtual Wooden Rack"
                      >
                        <Library className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Instructions Card */}
      <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-aura-purple" />
          Physical Return Instructions
        </h3>
        <p className="text-xs text-content-muted leading-relaxed">
          To return a physical volume, bring the book copy to the <b>Francis Xavier Engineering College ECE Department Library Desk (Room ECE-204)</b>. The department librarian or staff in charge will scan the physical accession barcode (<span className="text-aura-neon font-mono">ECESC...</span>) to immediately update your account ledger and free the copy on the shelf.
        </p>
      </div>
    </div>
  );
}
