'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ShieldCheck,
  Users,
  ArrowRight,
  Sparkles,
  Library,
  BookmarkCheck,
  CreditCard,
  Building
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function CentralAuthGatePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 relative overflow-hidden bg-void">
      {/* Background ambient neon glows */}
      <div className="absolute top-[-140px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-aura-purple/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[400px] bg-aura-violet/20 blur-[130px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10 py-2">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              FXEC <span className="text-aura-neon">ECE LIBRARY</span>
            </div>
            <div className="text-[10px] text-content-subtle tracking-wide uppercase">
              Francis Xavier Engineering College (Autonomous)
            </div>
          </div>
        </Link>

        <ThemeToggle />
      </header>

      {/* Central Gatekeeper Cards */}
      <main className="w-full max-w-4xl mx-auto my-auto z-10 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-low border border-stroke-glass text-xs text-aura-neon font-semibold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-aura-amber" />
            Institutional Access Gatekeeper
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Select Your Library Portal
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-2 max-w-lg mx-auto">
            Choose your departmental portal below. Separate authentication interfaces are provided for Administrators and Scholars.
          </p>
        </div>

        {/* Two Separate Portal Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: ADMIN PORTAL */}
          <Link
            href="/admin/login"
            className="glass-panel-card p-8 rounded-3xl border border-stroke-glass hover:border-aura-purple/60 transition-all duration-300 group hover:shadow-[0_0_35px_rgba(142,45,226,0.25)] flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-aura-purple/10 rounded-full blur-2xl pointer-events-none group-hover:bg-aura-purple/20 transition-all"></div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-aura-purple to-aura-violet flex items-center justify-center text-white mb-6 shadow-glow group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-aura-purple/20 text-aura-neon border border-aura-purple/30">
                  LIBRARIAN & HOD
                </span>
                <span className="text-[10px] text-content-subtle font-mono">Terminal v2.0</span>
              </div>

              <h2 className="text-2xl font-black text-white group-hover:text-aura-neon transition-colors mb-2">
                Admin Portal Login
              </h2>

              <p className="text-xs text-content-muted leading-relaxed mb-6">
                Full administrative authority over 580+ book titles, 650+ physical copy IDs, reservation approvals, return desks, member accounts, and automated overdue alerts.
              </p>

              <div className="space-y-1.5 text-xs text-content-subtle pt-2 border-t border-stroke-subtle">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-neon"></span>
                  <span>Physical Copy Inventory & Stack Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-neon"></span>
                  <span>Issue & Physical Return Scanner Desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-aura-neon"></span>
                  <span>Automated Overdue Reminders & CSV Reports</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stroke-glass flex items-center justify-between text-xs font-bold text-aura-neon group-hover:text-white transition-colors">
              <span>Open Admin Login Page</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: STUDENT & STAFF PORTAL */}
          <Link
            href="/portal/login"
            className="glass-panel-card p-8 rounded-3xl border border-stroke-glass hover:border-aura-neon/60 transition-all duration-300 group hover:shadow-[0_0_35px_rgba(221,183,255,0.2)] flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-aura-neon/10 rounded-full blur-2xl pointer-events-none group-hover:bg-aura-neon/20 transition-all"></div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-aura-violet to-aura-neon flex items-center justify-center text-white mb-6 shadow-glow group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-aura-neon/20 text-aura-neon border border-aura-neon/30">
                  STUDENTS & FACULTY
                </span>
                <span className="text-[10px] text-content-subtle font-mono">Scholars</span>
              </div>

              <h2 className="text-2xl font-black text-white group-hover:text-aura-neon transition-colors mb-2">
                Student & Staff Login
              </h2>

              <p className="text-xs text-content-muted leading-relaxed mb-6">
                Interactive access to the 3D Virtual Wooden Rack, real-time physical copy LEDs, 1-click book reservations, active loan countdowns, and your Digital Smart Library ID card.
              </p>

              <div className="space-y-1.5 text-xs text-content-subtle pt-2 border-t border-stroke-subtle">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Interactive Wooden Shelf & 3D Hardcover Spines</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Instant Physical Copy Hold (24-Hour Pickup Window)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Loan Due Date Countdown & Digital Barcode Card</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stroke-glass flex items-center justify-between text-xs font-bold text-aura-neon group-hover:text-white transition-colors">
              <span>Open Student / Staff Login Page</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center text-[10px] text-content-subtle py-2 z-10">
        Francis Xavier Engineering College (Autonomous) &bull; Department of Electronics & Communication Engineering
      </footer>
    </div>
  );
}
