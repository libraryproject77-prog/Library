'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  CalendarCheck2,
  BookmarkPlus,
  RotateCcw,
  Users2,
  BarChart3,
  Bell,
  LogOut,
  Search,
  Menu,
  X,
  Sparkles,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Book Inventory', href: '/admin/books', icon: BookOpen },
  { label: 'Virtual Book Rack', href: '/admin/rack', icon: Library },
  { label: 'Reservations', href: '/admin/reservations', icon: CalendarCheck2 },
  { label: 'Issue Book Desk', href: '/admin/issue', icon: BookmarkPlus },
  { label: 'Return Book Desk', href: '/admin/return', icon: RotateCcw },
  { label: 'Members Directory', href: '/admin/members', icon: Users2 },
  { label: 'Reports & Export', href: '/admin/reports', icon: BarChart3 },
  { label: 'Reminders & Alerts', href: '/admin/notifications', icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(2);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Load notifications for admin with fast 3-second live polling
    const fetchNotifs = () => {
      api.getNotifications()
        .then(res => {
          if (res?.notifications) {
            setNotifications(res.notifications);
            setUnreadCount(res.notifications.filter((n: any) => !n.isRead).length);
          }
        })
        .catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    router.push('/admin/login');
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
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifOpen(false);
    const target = resolveAdminNotificationLink(n);
    router.push(target);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-content">
      {/* Top Navbar */}
      <header className="h-16 border-b border-stroke-subtle glass-panel sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-content-muted hover:text-white hover:bg-surface-high transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center shadow-glow">
              <Library className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                FXEC <span className="text-aura-neon">ECE LIBRARY</span>
              </div>
              <div className="text-[10px] text-content-subtle tracking-wide uppercase">
                Admin Console
              </div>
            </div>
          </Link>
        </div>

        {/* Global search quick pill */}
        <div className="hidden md:flex items-center relative w-80">
          <Search className="w-4 h-4 text-content-subtle absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search books, copies, roll numbers..."
            onClick={() => router.push('/admin/books')}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple cursor-pointer"
            readOnly
          />
          <span className="absolute right-2.5 text-[10px] text-content-subtle bg-surface-high px-1.5 py-0.5 rounded border border-stroke-subtle">
            ⌘K
          </span>
        </div>

        {/* Right Nav Icons */}
        <div className="flex items-center space-x-2.5">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* Role badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-aura-purple/20 border border-aura-purple/40 text-[11px] font-semibold text-aura-neon">
            <Sparkles className="w-3 h-3 text-aura-neon" />
            Admin Mode
          </span>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl relative hover:bg-surface-high text-content-muted hover:text-white transition-colors border border-transparent hover:border-stroke-glass"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-aura-amber rounded-full ring-2 ring-background animate-pulse" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-dropdown rounded-2xl shadow-glass border border-stroke-glass p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
                  <div className="text-xs font-semibold uppercase tracking-wider text-white">
                    Notifications ({unreadCount})
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-aura-neon hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-content-subtle py-4 text-center">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 rounded-xl text-xs transition-all cursor-pointer group hover:scale-[1.01] ${
                          n.isRead
                            ? 'bg-surface-low/50 opacity-75 hover:opacity-100 hover:bg-surface-high/60'
                            : 'bg-surface-card border border-aura-purple/40 hover:border-aura-purple shadow-sm'
                        }`}
                        title="Click to view details on this page"
                      >
                        <div className="font-semibold text-white mb-0.5 flex items-center justify-between">
                          <span className="group-hover:text-aura-neon transition-colors flex items-center gap-1.5">
                            {n.title}
                          </span>
                          <div className="flex items-center gap-1">
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-aura-amber ring-2 ring-aura-amber/30 animate-pulse" />
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-aura-neon opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        </div>
                        <p className="text-content-muted text-[11px] leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-content-subtle pt-0.5">
                          <span>
                            {n.createdAt
                              ? new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Recent'}
                          </span>
                          <span className="text-aura-neon font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Go to page &rarr;
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-stroke-subtle text-center">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-aura-neon hover:underline font-medium"
                  >
                    View All Reminders & Logs &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-stroke-subtle">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aura-purple to-aura-violet p-0.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Admin Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">Dr. S. K. Rajan</p>
              <p className="text-[10px] text-content-subtle">ECE HOD & Librarian</p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-content-subtle hover:text-aura-error hover:bg-surface-high transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Wrapper with Sidebar */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-stroke-subtle glass-panel shrink-0 p-4 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-content-subtle px-3 mb-2">
            Library Operations
          </div>
          <nav className="space-y-1 flex-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-aura-purple/20 text-white border border-aura-purple/50 shadow-sm'
                      : 'text-content-muted hover:text-white hover:bg-surface-low border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-aura-neon' : 'text-content-subtle'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Department badge at bottom of sidebar */}
          <div className="p-3.5 rounded-2xl bg-surface-low border border-stroke-glass mt-auto text-left">
            <div className="text-[11px] font-bold text-white mb-0.5">FXEC ECE Department</div>
            <div className="text-[10px] text-content-subtle leading-normal">
              Autonomous Institution &bull; Accredited by NBA
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80%] bg-surface-card border-r border-stroke-glass p-4 flex flex-col h-full z-50">
              <div className="flex items-center justify-between pb-4 border-b border-stroke-subtle mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-high text-content-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1.5 flex-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-aura-purple/20 text-white border border-aura-purple/50'
                          : 'text-content-muted hover:text-white hover:bg-surface-low'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
