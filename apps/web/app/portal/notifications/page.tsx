'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  CalendarCheck2,
  Megaphone,
  BookOpen,
  Check,
  RefreshCw,
  Info,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifsRes, annRes] = await Promise.all([
        api.getNotifications(),
        api.getAnnouncements()
      ]);
      if (notifsRes?.notifications) {
        setNotifications(notifsRes.notifications);
      }
      if (annRes?.announcements) {
        setAnnouncements(annRes.announcements);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.isRead) api.markNotificationRead(n.id).catch(() => {});
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const resolvePortalNotificationLink = (n: any): string => {
    if (n.link) return n.link;
    const text = `${n.title || ''} ${n.message || ''}`.toLowerCase();
    if (
      n.type === 'RESERVATION' ||
      text.includes('reservation') ||
      text.includes('reserve') ||
      text.includes('approved') ||
      text.includes('collect') ||
      text.includes('requested copy')
    ) {
      return '/portal/reservations';
    }
    if (
      n.type === 'CIRCULATION' ||
      n.type === 'OVERDUE' ||
      n.type === 'DUE_REMINDER' ||
      text.includes('due') ||
      text.includes('issued') ||
      text.includes('borrow') ||
      text.includes('renew') ||
      text.includes('reminder')
    ) {
      return '/portal/borrowed';
    }
    if (text.includes('return confirmed') || text.includes('returned') || text.includes('history')) {
      return '/portal/history';
    }
    if (n.type === 'ANNOUNCEMENT' || text.includes('announcement') || text.includes('circular') || text.includes('notice')) {
      return '/portal/notifications';
    }
    if (text.includes('rack') || text.includes('shelf')) {
      return '/portal/rack';
    }
    if (text.includes('book') || text.includes('catalog')) {
      return '/portal/catalog';
    }
    return '/portal/dashboard';
  };

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    const target = resolvePortalNotificationLink(n);
    if (target !== '/portal/notifications') {
      router.push(target);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'RESERVATION') return n.type === 'RESERVATION';
    if (filter === 'CIRCULATION') return n.type === 'CIRCULATION' || n.type === 'REMINDER';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-aura-neon" />
            Notices & Reminders
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Departmental circulars, automated return deadline reminders (15D, 7D, 3D, 1D), and reservation approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-1.5 rounded-xl bg-surface-low border border-stroke-glass text-xs font-semibold text-aura-neon hover:text-white transition-colors"
            >
              Mark All as Read ({unreadCount})
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-surface-low border border-stroke-glass text-content-muted hover:text-white transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Official Department Announcements Banner */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-content-subtle flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-aura-amber" />
          ECE Department Library Announcements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel-card p-5 rounded-2xl border border-aura-purple/30 bg-gradient-to-br from-aura-purple/10 to-surface-low relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-aura-purple/20 border border-aura-purple/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-aura-neon" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    URGENT CIRCULAR
                  </span>
                  <span className="text-[10px] text-content-subtle">HOD Office</span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Autonomous Curriculum Standard Textbooks Catalogued
                </h3>
                <p className="text-xs text-content-muted leading-relaxed">
                  All 580+ departmental accessions have been migrated to the virtual wooden rack system. Students preparing for semester assessments can verify copy availability directly online.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-high border border-stroke-glass flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-aura-neon" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    CIRCULATION POLICY
                  </span>
                  <span className="text-[10px] text-content-subtle">Desk Hours</span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Desk Working Hours & Return Timings
                </h3>
                <p className="text-xs text-content-muted leading-relaxed">
                  Physical issue counter operates from 8:45 AM to 5:00 PM on all college working days. Automated reminders are sent 15 days, 7 days, 3 days, and 1 day prior to due dates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stroke-subtle pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-aura-purple text-white shadow-glow'
              : 'text-content-muted hover:text-white bg-surface-low'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-aura-purple text-white shadow-glow'
              : 'text-content-muted hover:text-white bg-surface-low'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('RESERVATION')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'RESERVATION'
              ? 'bg-aura-purple text-white shadow-glow'
              : 'text-content-muted hover:text-white bg-surface-low'
          }`}
        >
          Reservations
        </button>
        <button
          onClick={() => setFilter('CIRCULATION')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === 'CIRCULATION'
              ? 'bg-aura-purple text-white shadow-glow'
              : 'text-content-muted hover:text-white bg-surface-low'
          }`}
        >
          Due Reminders
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-panel-card p-12 rounded-3xl text-center text-xs text-content-muted">
            Checking notification mailbox...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-panel-card p-12 rounded-3xl text-center space-y-3">
            <Bell className="w-10 h-10 text-content-subtle mx-auto" />
            <h3 className="text-sm font-bold text-white">No Notifications</h3>
            <p className="text-xs text-content-muted">
              You are all caught up! No unread notices or alerts in this view.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isReservation = n.type === 'RESERVATION';
            const isDueAlert = n.type === 'CIRCULATION' || n.type === 'REMINDER';

            const targetUrl = resolvePortalNotificationLink(n);
            const canNavigate = targetUrl && targetUrl !== '/portal/notifications';

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`glass-panel-card p-4 md:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group hover:scale-[1.008] ${
                  !n.isRead
                    ? 'border-aura-purple/50 bg-aura-purple/10 shadow-[0_0_20px_rgba(142,45,226,0.15)] hover:border-aura-neon'
                    : 'border-stroke-subtle opacity-80 hover:opacity-100 hover:bg-surface-high/40'
                }`}
                title="Click notification to navigate to this page"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isReservation
                        ? 'bg-purple-500/20 text-aura-neon border border-purple-500/30'
                        : isDueAlert
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-surface-high text-content-muted border border-stroke-glass'
                    }`}
                  >
                    {isReservation ? (
                      <CalendarCheck2 className="w-5 h-5" />
                    ) : isDueAlert ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-aura-neon transition-colors">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-aura-neon shadow-[0_0_8px_#ddb7ff] animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-content-muted leading-relaxed">
                      {n.message}
                    </p>
                    <div className="text-[10px] text-content-subtle font-mono pt-1">
                      {new Date(n.createdAt).toLocaleDateString()} at{' '}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Navigate to Page & Mark As Read */}
                <div className="shrink-0 flex items-center gap-2.5 self-end sm:self-center">
                  {canNavigate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(n);
                      }}
                      className="aura-gradient-btn px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm group-hover:scale-105 transition-transform"
                    >
                      <span>
                        {isReservation
                          ? 'View Reservation'
                          : isDueAlert
                          ? 'View Borrowed'
                          : 'Go to Page'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(n.id);
                      }}
                      className="p-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-content-muted hover:text-white transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
