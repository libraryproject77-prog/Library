'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  CheckCircle2,
  Clock,
  BookOpen,
  Search,
  Filter,
  CheckCheck,
  Coins,
  ArrowRight,
  RefreshCw,
  Library
} from 'lucide-react';
import { api } from '@/lib/api';

export default function BorrowingHistoryPage() {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
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

  const filteredHistory = borrowings.filter((b) => {
    const matchesSearch =
      b.copy?.copyNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.copy?.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.copy?.book?.author?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'RETURNED'
        ? b.status === 'RETURNED'
        : b.status === 'BORROWED' || b.status === 'OVERDUE';

    return matchesSearch && matchesStatus;
  });

  const returnedList = borrowings.filter((b) => b.status === 'RETURNED');
  const totalBorrowedEver = borrowings.length;
  const onTimeCount = returnedList.filter((b) => {
    if (!b.returnDate) return false;
    return new Date(b.returnDate).getTime() <= new Date(b.dueDate).getTime();
  }).length;

  const onTimePercentage =
    returnedList.length > 0 ? Math.round((onTimeCount / returnedList.length) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-aura-neon" />
            Borrowing History & Return Ledger
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Complete academic record of all books issued, read, and returned to the ECE Department Library.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="p-2.5 rounded-xl bg-surface-low border border-stroke-glass text-content-muted hover:text-white transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/portal/catalog"
            className="aura-gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Borrow New Book</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
          <span className="text-[10px] uppercase font-bold text-content-subtle tracking-wider">
            Total Books Issued
          </span>
          <div className="text-2xl font-black text-white mt-1">{totalBorrowedEver}</div>
          <span className="text-[11px] text-content-subtle mt-0.5 block">Academic tenure total</span>
        </div>

        <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            Returned to Stacks
          </span>
          <div className="text-2xl font-black text-emerald-300 mt-1">{returnedList.length}</div>
          <span className="text-[11px] text-content-subtle mt-0.5 block">Physical check-ins</span>
        </div>

        <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
          <span className="text-[10px] uppercase font-bold text-aura-neon tracking-wider">
            Punctual Return Rate
          </span>
          <div className="text-2xl font-black text-aura-neon mt-1">{onTimePercentage}%</div>
          <span className="text-[11px] text-content-subtle mt-0.5 block">Returned before due date</span>
        </div>

        <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
          <span className="text-[10px] uppercase font-bold text-aura-amber tracking-wider">
            Discipline Standing
          </span>
          <div className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Exemplary</span>
          </div>
          <span className="text-[11px] text-content-subtle mt-0.5 block">In Good Institutional Standing</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-content-subtle absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by title, author, ECESC code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content-muted focus:outline-none focus:border-aura-purple cursor-pointer"
          >
            <option value="all">All Records</option>
            <option value="RETURNED">Returned Only</option>
            <option value="ACTIVE">Currently Active</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel-card rounded-3xl border border-stroke-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-low border-b border-stroke-subtle text-content-subtle uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-5">Accession Copy</th>
                <th className="py-3.5 px-5">Textbook Title</th>
                <th className="py-3.5 px-5">Issue Date</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5">Return Date</th>
                <th className="py-3.5 px-5">Circulation Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-content-muted">
                    Loading ledger data...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-content-muted">
                    No borrowing history matching criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const book = item.copy?.book;
                  const isReturned = item.status === 'RETURNED';
                  const isOverdue = item.status === 'OVERDUE';

                  return (
                    <tr key={item.id} className="hover:bg-surface-low/50 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-aura-neon bg-aura-purple/20 px-2 py-1 rounded text-[11px]">
                          {item.copy?.copyNumber}
                        </span>
                      </td>

                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-bold text-white line-clamp-1">{book?.title}</div>
                        <div className="text-[11px] text-content-subtle truncate mt-0.5">
                          {book?.author} • {book?.publisher}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-content-muted font-mono">
                        {new Date(item.issueDate).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-5 text-content-muted font-mono">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-5 font-mono">
                        {item.returnDate ? (
                          <span className="text-emerald-400">
                            {new Date(item.returnDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-content-subtle italic">Active Loan</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isReturned
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isOverdue
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                              : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/portal/book/${book?.id || ''}`}
                          className="text-aura-neon hover:text-white font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
