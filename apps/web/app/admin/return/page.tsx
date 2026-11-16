'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  Search,
  DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminReturnPage() {
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [condition, setCondition] = useState<'GOOD' | 'DAMAGED' | 'LOST'>('GOOD');
  const [waiveFine, setWaiveFine] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadActiveLoans();
  }, []);

  const loadActiveLoans = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactions();
      if (res?.transactions) {
        // filter out already returned
        const pending = res.transactions.filter((t: any) => t.status === 'BORROWED' || t.status === 'OVERDUE');
        setActiveLoans(pending);
        if (pending.length > 0) setSelectedTx(pending[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    try {
      setSubmitting(true);
      setSuccessMsg(null);
      await api.returnBook(selectedTx.id, {
        condition,
        waiveFine
      });
      setSuccessMsg(`Copy ${selectedTx.copy?.copyNumber} returned successfully! Status updated.`);
      setSelectedTx(null);
      loadActiveLoans();
    } catch (err: any) {
      alert(err.message || 'Error returning book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <RotateCcw className="w-7 h-7 text-emerald-400" />
          Physical Book Return & Fine Desk
        </h1>
        <p className="text-xs md:text-sm text-content-muted mt-1">
          Inspect returned volume condition, automatically calculate overdue penalty, and restore copy to rack.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Borrowings to select */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-muted mb-3 px-1">
              Outstanding Borrowed Books ({activeLoans.length})
            </h2>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {loading ? (
                <p className="text-xs text-content-subtle p-4">Loading active loans...</p>
              ) : activeLoans.length === 0 ? (
                <p className="text-xs text-content-subtle p-4">All books currently in stock!</p>
              ) : (
                activeLoans.map((tx) => {
                  const isSelected = selectedTx?.id === tx.id;
                  const isOverdue = tx.status === 'OVERDUE';
                  return (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-aura-purple/20 border-aura-purple text-white shadow-glow'
                          : 'bg-surface-low border-stroke-subtle text-content-muted hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-white bg-surface-high px-1.5 py-0.5 rounded border border-stroke-subtle">
                          {tx.copy?.copyNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                      <div className="font-bold text-xs line-clamp-1">{tx.copy?.book?.title}</div>
                      <div className="text-[11px] text-content-subtle mt-0.5">
                        Borrower: {tx.user?.name} ({tx.user?.rollNumber || tx.user?.staffId})
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Return Confirmation & Fine Inspector */}
        <div className="lg:col-span-7">
          {selectedTx ? (
            <div className="glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-subtle space-y-6">
              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Volume summary */}
              <div className="flex items-start justify-between pb-4 border-b border-stroke-subtle">
                <div>
                  <span className="font-mono text-xs font-bold text-aura-neon bg-aura-purple/20 px-2 py-0.5 rounded">
                    {selectedTx.copy?.copyNumber}
                  </span>
                  <h2 className="text-base font-bold text-white mt-2">
                    {selectedTx.copy?.book?.title}
                  </h2>
                  <p className="text-xs text-content-muted mt-0.5">
                    Borrower: <span className="text-white font-medium">{selectedTx.user?.name}</span> ({selectedTx.user?.email})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-content-subtle block">Due Date</span>
                  <span className="text-xs font-bold text-white font-mono">{selectedTx.dueDate?.slice(0, 10)}</span>
                </div>
              </div>

              {/* Overdue & Fine Alert Box */}
              {selectedTx.status === 'OVERDUE' ? (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-rose-300">
                        Book Overdue ({selectedTx.fine?.overdueDays || 3} Days Past Due)
                      </div>
                      <div className="text-[11px] text-content-subtle">
                        Standard departmental late penalty applied (₹10/day).
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-rose-400">
                      ₹{selectedTx.fine?.amount || 30}
                    </span>
                    <span className="text-[10px] text-content-subtle block">Late Fine</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Returned on time within the allowed loan period. No fines applicable.</span>
                </div>
              )}

              {/* Condition & Waiver Form */}
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-2">
                    Returned Physical Copy Condition
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'GOOD', label: 'Good / Mint', desc: 'Spine intact' },
                      { key: 'DAMAGED', label: 'Damaged', desc: 'Requires repair' },
                      { key: 'LOST', label: 'Reported Lost', desc: 'Spine missing' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setCondition(opt.key as any)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          condition === opt.key
                            ? 'bg-aura-purple/20 border-aura-purple text-white shadow-sm'
                            : 'bg-surface-low border-stroke-glass text-content-muted hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">{opt.label}</div>
                        <div className="text-[10px] text-content-subtle">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTx.status === 'OVERDUE' && (
                  <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-surface-low border border-stroke-subtle cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waiveFine}
                      onChange={(e) => setWaiveFine(e.target.checked)}
                      className="rounded border-stroke-glass text-aura-purple focus:ring-aura-purple w-4 h-4 bg-surface-card"
                    />
                    <span className="text-xs text-white">
                      Waive overdue fine (Special HOD / Faculty Approval)
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full aura-gradient-btn py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Processing Return...' : 'Confirm Physical Return & Update Catalog'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-panel-card p-12 rounded-3xl text-center text-content-muted text-xs">
              Select an outstanding borrowed volume on the left to process return.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
