'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Filter,
  Search,
  AlertTriangle,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Physical copy reserved for departmental lab exam or lecture demo.');

  useEffect(() => {
    loadReservations();
  }, [filter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await api.getReservations(filter);
      if (res?.reservations) {
        setReservations(res.reservations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveReservation(id);
      loadReservations();
    } catch (err: any) {
      alert(err.message || 'Error approving reservation');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId) return;
    try {
      await api.rejectReservation(selectedResId, rejectReason);
      setRejectModalOpen(false);
      setSelectedResId(null);
      loadReservations();
    } catch (err: any) {
      alert(err.message || 'Error rejecting reservation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-aura-neon" />
            Reservation Management Desk
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Review hold requests, approve copy locks, and notify students/staff for physical pickup.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-stroke-glass self-start sm:self-auto">
          {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === st
                  ? 'bg-aura-purple/20 text-aura-neon border border-aura-purple/50'
                  : 'text-content-muted hover:text-white'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table / Cards */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="glass-panel-card p-12 rounded-2xl text-center text-content-muted text-xs">
            Loading reservations queue...
          </div>
        ) : reservations.length === 0 ? (
          <div className="glass-panel-card p-12 rounded-2xl text-center text-content-muted text-xs">
            No reservation requests found.
          </div>
        ) : (
          reservations.map((res) => {
            const isPending = res.status === 'PENDING';
            const isApproved = res.status === 'APPROVED';
            const isRejected = res.status === 'REJECTED';

            return (
              <div
                key={res.id}
                className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-aura-purple/30 transition-all"
              >
                {/* Details */}
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-surface-low border border-stroke-glass flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-aura-neon" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-white bg-surface-high px-2 py-0.5 rounded border border-stroke-subtle">
                        {res.copy?.copyNumber || 'ECE-COPY'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPending
                            ? 'bg-amber-500/20 text-aura-amber border-amber-500/30'
                            : isApproved
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {res.status}
                      </span>
                      <span className="text-[11px] text-content-subtle font-mono">
                        Requested: <b>{new Date(res.requestDate).toLocaleDateString()} at {new Date(res.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</b>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {res.copy?.book?.title || 'Electronics Engineering Reference'}
                    </h3>
                    <p className="text-xs text-content-muted mt-0.5">
                      Borrower: <span className="text-white font-medium">{res.user?.name}</span> ({res.user?.rollNumber || res.user?.staffId || res.user?.email}) &bull; Dept: {res.user?.department || 'ECE'}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-aura-purple/20 text-aura-neon">
                        Copy: {res.copy?.copyNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ⏳ Return Window: 15 Days
                      </span>
                    </div>

                    {res.rejectionReason && (
                      <p className="text-[11px] text-aura-error mt-1">
                        Reason: {res.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(res.id)}
                        className="aura-gradient-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve Hold
                      </button>
                      <button
                        onClick={() => {
                          setSelectedResId(res.id);
                          setRejectModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-surface-low hover:bg-aura-errorBg/40 border border-stroke-glass text-xs font-semibold text-aura-error flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Awaiting pickup (expires in 24 hrs)
                    </span>
                  )}

                  {isRejected && (
                    <span className="text-xs text-content-subtle">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel-card p-6 rounded-3xl border border-stroke-glass w-full max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle mb-4">
              <h3 className="text-base font-bold text-white">Decline Reservation Request</h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-high text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  Rejection Reason (Visible to Student/Staff)
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-stroke-subtle">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-surface-low text-xs text-content-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-aura-errorBg text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
