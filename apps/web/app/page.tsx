import Link from 'next/link';
import {
  BookOpen,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  Library,
  BookmarkCheck,
  CreditCard,
  Building
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-void">
      {/* Background ambient neon glows */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-aura-purple/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[400px] bg-aura-violet/20 blur-[130px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center shadow-glow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              FXEC <span className="text-aura-neon">ECE LIBRARY</span>
            </h1>
            <p className="text-xs text-content-subtle">Francis Xavier Engineering College (Autonomous)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link
            href="/admin/login"
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-aura-neon hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
          <Link
            href="/portal/login"
            className="aura-gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student / Staff Login &rarr;</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill glass-panel text-xs text-aura-neon font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-aura-amber" />
          Department of Electronics & Communication Engineering
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Department Library <br />
          <span className="bg-gradient-to-r from-aura-neon via-aura-purple to-aura-secondary bg-clip-text text-transparent">
            Management & Virtual Racks
          </span>
        </h2>

        <p className="text-content-muted text-sm md:text-base max-w-2xl mb-8 leading-relaxed">
          Production Department Library System for FXEC ECE featuring complete physical accession copy tracking, 
          realistic virtual wooden bookshelf replica, instant 1-click reservations, and institutional role access.
        </p>

        {/* Live Department Library Quick Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl mb-12">
          <div className="p-4 rounded-2xl glass-panel-card border border-stroke-glass text-center">
            <div className="text-2xl font-black text-white">581</div>
            <div className="text-[10px] text-content-subtle uppercase tracking-wider font-semibold mt-0.5">
              Curated Book Titles
            </div>
          </div>
          <div className="p-4 rounded-2xl glass-panel-card border border-stroke-glass text-center">
            <div className="text-2xl font-black text-aura-neon">653</div>
            <div className="text-[10px] text-content-subtle uppercase tracking-wider font-semibold mt-0.5">
              Physical ECESC Copies
            </div>
          </div>
          <div className="p-4 rounded-2xl glass-panel-card border border-stroke-glass text-center">
            <div className="text-2xl font-black text-emerald-400">8</div>
            <div className="text-[10px] text-content-subtle uppercase tracking-wider font-semibold mt-0.5">
              ECE Specializations
            </div>
          </div>
          <div className="p-4 rounded-2xl glass-panel-card border border-stroke-glass text-center">
            <div className="text-2xl font-black text-aura-amber">100%</div>
            <div className="text-[10px] text-content-subtle uppercase tracking-wider font-semibold mt-0.5">
              Virtual Wooden Shelf Sync
            </div>
          </div>
        </div>

        {/* SEPARATE PORTAL CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
          {/* 1. ADMIN PORTAL CARD */}
          <div className="glass-panel-card p-7 rounded-3xl border border-stroke-glass hover:border-aura-purple/50 transition-all duration-300 group hover:shadow-glow flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center text-white shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-aura-purple/20 text-aura-neon border border-aura-purple/30">
                  ADMIN TERMINAL
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white group-hover:text-aura-neon transition-colors mb-2">
                Department Admin Portal
              </h3>

              <p className="text-xs text-content-muted leading-relaxed mb-6">
                Full administrative command center: book accession inventory, copy barcode management, reservation approvals, return desks, member directories, and automated overdue email reminders.
              </p>

              <div className="space-y-1.5 text-xs text-content-subtle pt-3 border-t border-stroke-subtle">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-neon"></span>
                  <span>581 Titles & Physical Copy Stock Counters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-neon"></span>
                  <span>Issue & Physical Return Counter Scanner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-neon"></span>
                  <span>15D, 7D, 3D, 1D Automated Reminder Crons</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stroke-glass flex items-center gap-3">
              <Link
                href="/admin/login"
                className="flex-1 py-2.5 px-4 rounded-xl aura-gradient-btn text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Admin Login Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/dashboard"
                className="py-2.5 px-4 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-xs font-semibold text-content-muted hover:text-white transition-colors"
                title="Direct Dashboard Access"
              >
                Direct Dashboard
              </Link>
            </div>
          </div>

          {/* 2. STAFF / STUDENT PORTAL CARD */}
          <div className="glass-panel-card p-7 rounded-3xl border border-stroke-glass hover:border-aura-neon/50 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(221,183,255,0.15)] flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aura-violet to-aura-neon flex items-center justify-center text-white shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-aura-neon/20 text-aura-neon border border-aura-neon/30">
                  SCHOLAR PORTAL
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white group-hover:text-aura-neon transition-colors mb-2">
                Staff & Student Portal
              </h3>

              <p className="text-xs text-content-muted leading-relaxed mb-6">
                Interactive student and faculty interface: browse books on the realistic virtual wooden rack, check real-time availability status LEDs, reserve physical copies, and view active loan countdowns.
              </p>

              <div className="space-y-1.5 text-xs text-content-subtle pt-3 border-t border-stroke-subtle">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Realistic 3D Virtual Wooden Rack with Status LEDs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Instant 1-Click Copy Hold (24-Hour Pickup Window)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Digital Smart Library Card with Barcode</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stroke-glass flex items-center gap-3">
              <Link
                href="/portal/login"
                className="flex-1 py-2.5 px-4 rounded-xl aura-gradient-btn text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Student / Staff Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/portal/rack"
                className="py-2.5 px-4 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-xs font-semibold text-aura-neon hover:text-white transition-colors flex items-center gap-1.5"
                title="Direct Wooden Bookshelf View"
              >
                <Library className="w-3.5 h-3.5" />
                <span>Open Rack</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-stroke-glass text-center text-xs text-content-subtle flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div>
          &copy; {new Date().getFullYear()} Francis Xavier Engineering College &bull; Department of ECE
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link>
          <Link href="/portal/login" className="hover:text-white transition-colors">Student Login</Link>
          <Link href="/portal/rack" className="hover:text-white transition-colors">Virtual Rack</Link>
          <Link href="/portal/catalog" className="hover:text-white transition-colors">Book Catalogue</Link>
        </div>
      </footer>
    </div>
  );
}
