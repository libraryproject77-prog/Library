'use client';

import React, { useState, useEffect } from 'react';
import {
  BookmarkPlus,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Copy,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminIssuePage() {
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [availableCopies, setAvailableCopies] = useState<any[]>([]);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCopyId, setSelectedCopyId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loanDays, setLoanDays] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksRes, membersRes, txRes] = await Promise.all([
        api.getBooks(),
        api.getMembers(),
        api.getTransactions('BORROWED')
      ]);

      if (booksRes?.books) {
        setBooks(booksRes.books);
        const freeCopies: any[] = [];
        booksRes.books.forEach((b: any) => {
          b.copies?.forEach((c: any) => {
            if (c.status === 'AVAILABLE' || c.status === 'RESERVED') {
              freeCopies.push({
                ...c,
                bookTitle: b.title,
                rackLocation: b.rackLocation
              });
            }
          });
        });
        setAvailableCopies(freeCopies);
        if (freeCopies.length > 0) setSelectedCopyId(freeCopies[0].id);
      }

      if (membersRes?.members) {
        const activeMembers = membersRes.members.filter((m: any) => m.status === 'ACTIVE');
        setMembers(activeMembers);
        if (activeMembers.length > 0) setSelectedUserId(activeMembers[0].id);
      }

      if (txRes?.transactions) {
        setRecentIssues(txRes.transactions.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCopyId || !selectedUserId) return;
    try {
      setSubmitting(true);
      setSuccessMsg(null);
      await api.issueBook({
        copyId: selectedCopyId,
        userId: selectedUserId,
        days: loanDays
      });
      setSuccessMsg('Book copy issued successfully! Transaction logged.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error issuing book');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedDueDate = new Date(Date.now() + loanDays * 24 * 3600000).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BookmarkPlus className="w-7 h-7 text-aura-neon" />
          Physical Book Issue Desk
        </h1>
        <p className="text-xs md:text-sm text-content-muted mt-1">
          Assign physical copy IDs to student/staff library accounts and establish due dates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Issue Form */}
        <div className="lg:col-span-7 glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-subtle">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-aura-purple" />
            Issue physical Volume
          </h2>

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleIssueSubmit} className="space-y-4">
            {/* Select Copy */}
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1.5">
                Physical Copy ID & Book Title *
              </label>
              <select
                value={selectedCopyId}
                onChange={(e) => setSelectedCopyId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple cursor-pointer font-mono"
              >
                {availableCopies.length === 0 ? (
                  <option value="">No available copies on shelf</option>
                ) : (
                  availableCopies.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.copyNumber}] {c.bookTitle} &bull; {c.rackLocation} ({c.status})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Select Borrower */}
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1.5">
                Borrower (Student / Staff) *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} &bull; {m.role} &bull; {m.rollNumber || m.staffId || m.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Duration */}
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1.5">
                Loan Duration (Days)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setLoanDays(d)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      loanDays === d
                        ? 'bg-aura-purple/20 border-aura-purple text-aura-neon'
                        : 'bg-surface-low border-stroke-glass text-content-muted hover:text-white'
                    }`}
                  >
                    {d} Days ({d === 15 ? 'Student Std' : d === 30 ? 'Faculty' : 'Extended'})
                  </button>
                ))}
              </div>
            </div>

            {/* Due date notice card */}
            <div className="p-3.5 rounded-2xl bg-surface-low border border-stroke-subtle flex items-center justify-between text-xs">
              <span className="text-content-muted flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-aura-amber" />
                Calculated Due Date:
              </span>
              <span className="font-bold text-white">{calculatedDueDate}</span>
            </div>

            <button
              type="submit"
              disabled={submitting || availableCopies.length === 0}
              className="w-full aura-gradient-btn py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Confirming Issue...' : 'Confirm Book Issue & Update Shelf'}
            </button>
          </form>
        </div>

        {/* Right Col: Active Loans Overview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Active Loans Out on Desk
            </h2>

            <div className="space-y-3">
              {recentIssues.length === 0 ? (
                <p className="text-xs text-content-subtle py-4">No active loans currently</p>
              ) : (
                recentIssues.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-surface-low border border-stroke-subtle text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-white bg-surface-high px-2 py-0.5 rounded border border-stroke-subtle text-[11px]">
                        {tx.copy?.copyNumber}
                      </span>
                      <span className="text-blue-400 font-semibold text-[11px]">
                        Due: {tx.dueDate?.slice(0, 10)}
                      </span>
                    </div>
                    <div className="font-bold text-white truncate">{tx.copy?.book?.title}</div>
                    <div className="text-[11px] text-content-muted mt-0.5">
                      Borrower: <span className="text-content">{tx.user?.name}</span> ({tx.user?.rollNumber || tx.user?.staffId})
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
