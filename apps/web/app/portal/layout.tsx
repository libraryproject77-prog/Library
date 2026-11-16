'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  CalendarCheck2,
  Clock,
  History,
  Bell,
  User,
  LogOut,
  Search,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

const PORTAL_NAV_ITEMS = [
  { label: 'My Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Book Catalogue', href: '/portal/catalog', icon: BookOpen },
  { label: 'Virtual Book Rack', href: '/portal/rack', icon: Library },
  { label: 'My Reservations', href: '/portal/reservations', icon: CalendarCheck2 },
  { label: 'My Borrowed Books', href: '/portal/borrowed', icon: Clock },
  { label: 'Borrowing History', href: '/portal/history', icon: History },
  { label: 'Notices & Reminders', href: '/portal/notifications', icon: Bell },
  { label: 'My Profile', href: '/portal/profile', icon: User },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>({
    id: 'usr-student-1',
    name: 'Santhosh Kumar K',
    email: 'santhosh.21ec104@francisxavier.ac.in',
    role: 'STUDENT',
    rollNumber: '21EC104',
    department: 'ECE',
    avatarUrl: '/default-avatar.jpg'
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(1);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Available profiles for easy switching between Student and Staff
  const availableDemoUsers = [
    {
      id: 'usr-student-1',
      name: 'Santhosh Kumar K',
      email: 'santhosh.21ec104@francisxavier.ac.in',
      role: 'STUDENT',
      rollNumber: '21EC104',
      department: 'ECE',
      avatarUrl: '/default-avatar.jpg'
    },
    {
      id: 'usr-student-2',
      name: 'Karthik Raja S',
      email: 'karthik.22ec045@francisxavier.ac.in',
      role: 'STUDENT',
      rollNumber: '22EC045',
      department: 'ECE',
      avatarUrl: '/default-avatar.jpg'
    },
    {
      id: 'usr-staff-1',
      name: 'Prof. M. Revathi',
      email: 'revathi.ece@francisxavier.ac.in',
      role: 'STAFF',
      staffId: 'FX-ECE-STF-014',
      department: 'ECE',
      avatarUrl: '/default-avatar.jpg'
    }
  ];

  useEffect(() => {
    // Check local storage for active user
    const savedUser = localStorage.getItem('fxec_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (!u.avatarUrl || u.avatarUrl.includes('unsplash.com')) {
          u.avatarUrl = '/default-avatar.jpg';
          localStorage.setItem('fxec_user', JSON.stringify(u));
        }
        if (u.role !== 'ADMIN') {
          setCurrentUser(u);
        }
      } catch (e) {
        // ignore
      }
    } else {
      localStorage.setItem('fxec_user', JSON.stringify(currentUser));
      localStorage.setItem('fxec_token', 'student-token');
    }

    // Load personal notifications
    api.getNotifications()
      .then(res => {
        if (res?.notifications) {
          setNotifications(res.notifications);
          setUnreadCount(res.notifications.filter((n: any) => !n.isRead).length);
        }
      })
      .catch(() => {
        setNotifications([
          {
            id: 'n1',
            title: 'Welcome to FXEC ECE Library',
            message: 'Your institutional library access is active. Borrow quota: 1 physical book per day. Return within 15 days.',
            isRead: false,
            createdAt: new Date().toISOString()
          }
        ]);
        setUnreadCount(1);
      });
  }, []);

  const switchUser = (u: any) => {
    setCurrentUser(u);
    localStorage.setItem('fxec_user', JSON.stringify(u));
    localStorage.setItem('fxec_token', u.role === 'STAFF' ? 'staff-token' : 'student-token');
    setUserMenuOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('fxec_token');
    localStorage.removeItem('fxec_user');
    router.push('/portal/login');
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
      api.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifOpen(false);
    const target = resolvePortalNotificationLink(n);
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

          <Link href="/portal/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-sm font-black tracking-tight text-white">FXEC</span>
                <span className="text-sm font-black tracking-tight text-aura-neon">ECE LIBRARY</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-content-subtle">
                  {currentUser.role === 'STAFF' ? 'Faculty Portal' : 'Student Portal'}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Quick Search */}
        <div className="hidden md:flex items-center relative w-80">
          <Search className="w-4 h-4 text-content-subtle absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search books, author, ECESC Acc No..."
            onClick={() => router.push('/portal/catalog')}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple cursor-pointer"
            readOnly
          />
          <span className="absolute right-2.5 text-[10px] text-content-subtle bg-surface-high px-1.5 py-0.5 rounded border border-stroke-subtle">
            Catalogue
          </span>
        </div>

        {/* Right Nav Icons */}
        <div className="flex items-center space-x-2.5">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

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
                    Notices & Alerts ({unreadCount})
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
                    href="/portal/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-aura-neon hover:underline font-medium"
                  >
                    View All Notices &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Switcher Pill */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-surface-high border border-stroke-glass transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-aura-purple to-aura-violet p-0.5">
                <img
                  src={(currentUser.avatarUrl && !currentUser.avatarUrl.includes('unsplash.com')) ? currentUser.avatarUrl : '/default-avatar.jpg'}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-semibold text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-aura-neon">
                  {currentUser.role === 'STAFF' ? 'ECE Faculty' : `Roll: ${currentUser.rollNumber}`}
                </p>
              </div>
            </button>

            {/* User Account Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl shadow-glass border border-stroke-glass p-4 z-50">
                <div className="flex items-center space-x-3 pb-3 border-b border-stroke-subtle">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-stroke-glass shrink-0">
                    <img
                      src={(currentUser.avatarUrl && !currentUser.avatarUrl.includes('unsplash.com')) ? currentUser.avatarUrl : '/default-avatar.jpg'}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-aura-neon font-mono">
                      {currentUser.role === 'STAFF' ? currentUser.staffId : currentUser.rollNumber}
                    </p>
                    <p className="text-[10px] text-content-subtle truncate">{currentUser.email}</p>
                  </div>
                </div>

                <div className="py-2.5 text-xs text-content-muted space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-content-subtle">Daily Quota:</span>
                    <span className="text-white font-semibold">
                      {currentUser.role === 'STAFF' ? '3 Books / Day' : '1 Book / Day'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-content-subtle">Return Period:</span>
                    <span className="text-emerald-400 font-semibold">15 Days</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-stroke-subtle flex items-center justify-between text-xs">
                  <Link
                    href="/portal/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="text-aura-neon hover:underline font-semibold"
                  >
                    View Digital ID
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-stroke-subtle glass-panel shrink-0 p-4 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-content-subtle px-3 mb-2">
            Library Services
          </div>
          <nav className="space-y-1 flex-1 overflow-y-auto">
            {PORTAL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/portal/dashboard' && pathname?.startsWith(item.href));
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

          {/* Department badge at bottom */}
          <div className="p-3.5 rounded-2xl bg-surface-low border border-stroke-glass mt-auto text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-content">Digital Library Card Active</span>
            </div>
            <div className="text-[10px] text-content-subtle">
              Daily Quota: {currentUser.role === 'STAFF' ? '3 Books / Day' : '1 Book / Day'} &bull; 15-Day Return
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
                {PORTAL_NAV_ITEMS.map((item) => {
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

        {/* Viewport Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
