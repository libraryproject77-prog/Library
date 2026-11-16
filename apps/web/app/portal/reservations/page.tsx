'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Library,
  BookOpen,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '@/lib/api';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadMyReservations();
  }, []);

  const loadMyReservations = async () => {
    try {
      setLoading(true);
      const res = await api.getMyReservations();
      if (res?.reservations) {
        setReservations(res.reservations);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this book reservation? The copy will be released back to the shelf.')) {
      return;
    }
    try {
      setCancellingId(reservationId);
      setFeedback(null);
      await api.cancelReservation(reservationId);
      setFeedback({ type: 'success', message: 'Reservation cancelled successfully. The book copy has been freed on the rack.' });
      await loadMyReservations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to cancel reservation' });
    } finally {
      setCancellingId(null);
    }
  };

  const activeReservations = reservations.filter(
    (r) => r.status === 'PENDING' || r.status === 'APPROVED'
  );
  const pastReservations = reservations.filter(
    (r) => r.status !== 'PENDING' && r.status !== 'APPROVED'
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-aura-neon" />
            My Book Reservations
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Track your reserved textbooks, pickup windows, and departmental desk hold status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadMyReservations}
            className="p-2.5 rounded-xl bg-surface-low border border-stroke-glass text-content-muted hover:text-white transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/portal/catalog"
            className="aura-gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reserve Another Book</span>
          </Link>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-start space-x-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div>
            <b className="font-semibold block">{feedback.type === 'success' ? 'Success' : 'Notice'}</b>
            {feedback.message}
          </div>
        </div>
      )}

      {/* Pickup Guidelines Info Alert */}
      <div className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-aura-purple/20 border border-aura-purple/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-aura-neon" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Department Desk Pickup Rules
            </h3>
            <p className="text-xs text-content-muted mt-0.5">
              Once approved, physical copies are held at the ECE Department Library Desk for <b>24 hours</b>. Please bring your College ID card.
            </p>
          </div>
        </div>

        <Link
          href="/portal/rack"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-low border border-stroke-glass text-xs font-semibold text-aura-neon hover:text-white transition-colors shrink-0"
        >
          <Library className="w-3.5 h-3.5" />
          <span>View on Virtual Rack</span>
        </Link>
      </div>

      {/* Section 1: Active & Pending Reservations */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Active & Pending Holds</span>
          <span className="px-2 py-0.5 rounded-full bg-aura-purple/20 text-aura-neon text-xs font-mono">
            {activeReservations.length}
          </span>
        </h2>

        {loading ? (
          <div className="glass-panel-card p-12 rounded-3xl text-center text-xs text-content-muted">
            Checking reservation records...
          </div>
        ) : activeReservations.length === 0 ? (
          <div className="glass-panel-card p-12 rounded-3xl text-center space-y-4 border border-stroke-glass">
            <CalendarCheck2 className="w-12 h-12 text-content-subtle mx-auto" />
            <h3 className="text-base font-bold text-white">No Active Reservations</h3>
            <p className="text-xs text-content-muted max-w-md mx-auto">
              You do not have any pending or approved reservations at the moment. Browse the departmental library catalogue to reserve books.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeReservations.map((res) => {
              const book = res.copy?.book;
              const isApproved = res.status === 'APPROVED';

              return (
                <div
                  key={res.id}
                  className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle hover:border-aura-purple/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-16 h-22 rounded-xl overflow-hidden bg-surface-high shrink-0 border border-stroke-glass shadow-md">
                      <img
                        src={book?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'}
                        alt={book?.title || 'Book'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isApproved
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {isApproved ? 'READY FOR PICKUP' : 'AWAITING APPROVAL'}
                        </span>
                        <span className="text-[10px] text-content-subtle font-mono">
                          {new Date(res.requestDate).toLocaleDateString()} &bull; {new Date(res.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {book?.title || 'Accession Book Title'}
                      </h3>
                      <p className="text-xs text-content-muted mt-0.5 truncate">
                        By {book?.author || 'Department Reference'}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] font-mono text-aura-neon bg-aura-purple/20 px-2 py-0.5 rounded">
                          Copy: {res.copy?.copyNumber}
                        </span>
                        <span className="text-[10px] text-content-subtle flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-aura-purple" />
                          {book?.rackLocation || 'Stack R-1'}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-block">
                        ⏳ Return Timing: <b>15 Days</b> (Due: {new Date(new Date(res.requestDate).getTime() + 15 * 86400000).toLocaleDateString()})
                      </div>
                    </div>
                  </div>

                  {/* Expiration or Hold instructions */}
                  <div className="pt-2 border-t border-stroke-subtle">
                    {isApproved ? (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0 text-emerald-400" />
                        <div>
                          <b className="font-semibold block">24-Hour Hold Window Active</b>
                          <span>Collect at ECE Dept Library Counter before expiry. Return timing: 15 Days.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-content-muted flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-aura-amber" />
                        <span>Exact Reservation Time: <b>{new Date(res.requestDate).toLocaleDateString()} at {new Date(res.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</b>. Admin review in progress.</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      onClick={() => handleCancelReservation(res.id)}
                      disabled={cancellingId === res.id}
                      className="text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === res.id ? 'Cancelling...' : 'Cancel Hold'}
                    </button>

                    <Link
                      href={`/portal/book/${book?.id || ''}`}
                      className="text-aura-neon hover:text-white font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Book Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Reservation History */}
      {pastReservations.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-stroke-subtle">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Past Reservation History</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-high text-content-subtle text-xs font-mono">
              {pastReservations.length}
            </span>
          </h2>

          <div className="glass-panel-card rounded-2xl border border-stroke-glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-low border-b border-stroke-subtle text-content-subtle uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Accession Copy</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Request Date</th>
                    <th className="py-3 px-4">Final Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-subtle">
                  {pastReservations.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-low/50">
                      <td className="py-3 px-4 font-mono font-bold text-aura-neon">
                        {r.copy?.copyNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                        {r.copy?.book?.title}
                      </td>
                      <td className="py-3 px-4 text-content-muted">
                        {new Date(r.requestDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.status === 'FULFILLED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : r.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-surface-high text-content-muted border border-stroke-glass'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-content-subtle italic">
                        {r.rejectionReason || (r.status === 'CANCELLED' ? 'Cancelled by user' : 'Completed')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
