'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Megaphone,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'NORMAL' | 'HIGH'>('NORMAL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifRes, annRes] = await Promise.all([
        api.getNotifications(),
        api.getAnnouncements()
      ]);
      if (notifRes?.notifications) setNotifications(notifRes.notifications);
      if (annRes?.announcements) setAnnouncements(annRes.announcements);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement({
        title: annTitle,
        content: annContent,
        priority: annPriority
      });
      setAnnModalOpen(false);
      setAnnTitle('');
      setAnnContent('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error broadcasting announcement');
    }
  };

  const resolveAdminNotificationLink = (n: any): string => {
    if (n.link) return n.link;
    const text = `${n.title || ''} ${n.message || ''}`.toLowerCase();
    if (
      n.type === 'RESERVATION' ||
      text.includes('reservation') ||
      text.includes('reserve') ||
      text.includes('requested copy')
    ) {
      return '/admin/reservations';
    }
    if (
      n.type === 'CIRCULATION' ||
      n.type === 'OVERDUE' ||
      n.type === 'DUE_REMINDER' ||
      text.includes('overdue') ||
      text.includes('return') ||
      text.includes('borrow')
    ) {
      return '/admin/circulation';
    }
    if (n.type === 'ANNOUNCEMENT' || text.includes('announcement') || text.includes('notice')) {
      return '/admin/notifications';
    }
    if (text.includes('rack') || text.includes('shelf')) {
      return '/admin/rack';
    }
    if (text.includes('book') || text.includes('catalog') || text.includes('accession')) {
      return '/admin/books';
    }
    return '/admin/dashboard';
  };

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      api.markNotificationRead(n.id).catch(() => {});
    }
    const target = resolveAdminNotificationLink(n);
    if (target !== '/admin/notifications') {
      router.push(target);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-aura-neon" />
            Automated Reminders & Broadcast Announcements
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Engineered cron reminders (15D, 7D, 3D, 1D, Due Day, Overdue) and department broadcasts.
          </p>
        </div>

        <button
          onClick={() => setAnnModalOpen(true)}
          className="aura-gradient-btn px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Broadcast Announcement
        </button>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Department Announcements */}
        <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-aura-purple" />
              Active Department Notices
            </h2>
            <span className="text-xs text-content-subtle">{announcements.length} Published</span>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-xs text-content-subtle py-4">No active announcements</p>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl bg-surface-low border border-stroke-subtle space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ann.priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-aura-purple/20 text-aura-neon border border-aura-purple/30'
                      }`}
                    >
                      {ann.priority} PRIORITY
                    </span>
                    <span className="text-[11px] text-content-subtle">
                      {ann.createdAt?.slice(0, 10)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{ann.title}</h3>
                  <p className="text-xs text-content-muted leading-relaxed">{ann.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Automated Cron Reminders & Overdue Alerts */}
        <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-aura-amber" />
              Automated Notification Stream
            </h2>
            <span className="text-xs text-emerald-400 font-mono">Scheduler Active</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-content-subtle py-4">No notifications dispatched</p>
            ) : (
              notifications.map((n) => {
                const targetUrl = resolveAdminNotificationLink(n);
                const canNavigate = targetUrl && targetUrl !== '/admin/notifications';

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all cursor-pointer group hover:scale-[1.01] ${
                      !n.isRead
                        ? 'bg-surface-card border-aura-purple/50 hover:border-aura-neon shadow-sm'
                        : 'bg-surface-low border-stroke-subtle opacity-80 hover:opacity-100 hover:bg-surface-high/50'
                    }`}
                    title={canNavigate ? `Click to go to ${targetUrl}` : 'Notification'}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white group-hover:text-aura-neon transition-colors flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-aura-neon" />
                        {n.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-content-subtle font-mono">
                          {n.createdAt?.slice(0, 10)}
                        </span>
                        {canNavigate && (
                          <ArrowRight className="w-3.5 h-3.5 text-aura-neon opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-content-muted leading-relaxed">{n.message}</p>
                    {canNavigate && (
                      <div className="pt-1 flex justify-end">
                        <span className="text-[10px] text-aura-neon font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Open in {targetUrl.replace('/admin/', '').toUpperCase()} &rarr;
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {annModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-glass w-full max-w-lg">
            <div className="flex items-center justify-between pb-4 border-b border-stroke-subtle mb-4">
              <h3 className="text-base font-bold text-white">Broadcast Department Notice</h3>
              <button
                onClick={() => setAnnModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-high text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Clearance Deadline for 4th Year Students"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['NORMAL', 'HIGH'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAnnPriority(p)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        annPriority === p
                          ? 'bg-aura-purple/20 border-aura-purple text-aura-neon'
                          : 'bg-surface-low border-stroke-glass text-content-muted'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  Message Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Enter full details to appear in student and staff notification channels..."
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stroke-subtle">
                <button
                  type="button"
                  onClick={() => setAnnModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-surface-low text-xs text-content-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aura-gradient-btn px-4 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
