'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Library,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  BookmarkCheck,
  Search,
  Sparkles,
  ArrowRight,
  BookmarkPlus,
  X,
  Layers,
  MapPin,
  Check,
  Building,
  Zap,
  Radio,
  Cpu,
  Sliders,
  Briefcase,
  Compass
} from 'lucide-react';
import { api } from '@/lib/api';

// Official ECE Department Library Rack & Subject Mapping
interface TopicRackMeta {
  id: string;
  rackNum: string;
  code: string;
  title: string;
  subtitle: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
}

const TOPIC_RACK_CONFIG: Record<string, TopicRackMeta> = {
  'cat-circuits': {
    id: 'cat-circuits',
    rackNum: 'RACK ECE-01',
    code: 'CIRC',
    title: 'Circuits, Devices & Linear ICs',
    subtitle: 'Electronic Devices, Circuit Theory, Operational Amplifiers & Analog ICs',
    iconName: 'Zap',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
  },
  'cat-ss': {
    id: 'cat-ss',
    rackNum: 'RACK ECE-02',
    code: 'CTRL',
    title: 'Signals, Systems & Control Engineering',
    subtitle: 'LTI Systems, Continuous/Discrete Time Signals, Feedback & State-Space Control',
    iconName: 'Sliders',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
  },
  'cat-mpmc': {
    id: 'cat-mpmc',
    rackNum: 'RACK ECE-03',
    code: 'COMP',
    title: 'Microprocessors, Architecture & Computing',
    subtitle: '8085/8086, ARM Processors, Microcontrollers & Computer Architecture',
    iconName: 'Cpu',
    accentColor: '#3b82f6',
    badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-300'
  },
  'cat-comm': {
    id: 'cat-comm',
    rackNum: 'RACK ECE-04',
    code: 'COMM',
    title: 'Communication Networks, RF & Optical',
    subtitle: 'Analog/Digital Modulation, Fiber Optics, Wireless & Data Networks',
    iconName: 'Radio',
    accentColor: '#a855f7',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300'
  },
  'cat-dsp': {
    id: 'cat-dsp',
    rackNum: 'RACK ECE-05',
    code: 'DSP',
    title: 'Digital Signal & Image Processing',
    subtitle: 'DFT/FFT, FIR/IIR Filter Design, Multirate DSP & Digital Image Analysis',
    iconName: 'Sliders',
    accentColor: '#06b6d4',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
  },
  'cat-emft': {
    id: 'cat-emft',
    rackNum: 'RACK ECE-06',
    code: 'EMFT',
    title: 'Electromagnetics & Transmission Lines',
    subtitle: 'Maxwell Equations, Waveguides, Antennas, Radar & RF Transmission Lines',
    iconName: 'Compass',
    accentColor: '#f97316',
    badgeBg: 'bg-orange-500/10 border-orange-500/30 text-orange-300'
  },
  'cat-vlsi': {
    id: 'cat-vlsi',
    rackNum: 'RACK ECE-07',
    code: 'VLSI',
    title: 'VLSI Design & Embedded Systems',
    subtitle: 'CMOS Circuit Design, Verilog HDL, ASIC/FPGA Synthesis & System-on-Chip',
    iconName: 'Layers',
    accentColor: '#ec4899',
    badgeBg: 'bg-pink-500/10 border-pink-500/30 text-pink-300'
  },
  'cat-mgmt': {
    id: 'cat-mgmt',
    rackNum: 'RACK ECE-08',
    code: 'MGMT',
    title: 'Management, Humanities & Sciences',
    subtitle: 'Engineering Economics, Professional Ethics, Total Quality Management & Mathematics',
    iconName: 'Briefcase',
    accentColor: '#94a3b8',
    badgeBg: 'bg-slate-500/10 border-slate-500/30 text-slate-300'
  }
};

export default function StudentVirtualRackPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Topic Filter: 'all' or specific category id (e.g. 'cat-circuits')
  const [activeTopic, setActiveTopic] = useState('all');
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Selected Copy for the inline right-beside inspection card
  const [activeCopy, setActiveCopy] = useState<any | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);
  const [reserveError, setReserveError] = useState<string | null>(null);

  useEffect(() => {
    loadRackData();
  }, []);

  const loadRackData = async () => {
    try {
      setLoading(true);
      const res = await api.getBooks();
      if (res?.books) {
        setBooks(res.books);
      }
      if (res?.categories) {
        setCategories(res.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveCopy = async (copyId: string, copyNumber: string, bookTitle: string) => {
    try {
      setReserving(true);
      setReserveSuccess(null);
      setReserveError(null);
      await api.requestReservation(copyId, 24);
      setReserveSuccess(
        `Reservation confirmed for Copy ${copyNumber} ("${bookTitle}")! Instant alert sent to Department Admin. Please collect at ECE Library counter within 24 hours.`
      );

      // Instantly update copy status in local state
      setBooks((prev) =>
        prev.map((book) => {
          if (book.copies?.some((c: any) => c.id === copyId)) {
            const updatedCopies = book.copies.map((c: any) =>
              c.id === copyId ? { ...c, status: 'RESERVED' } : c
            );
            const avail = updatedCopies.filter((c: any) => c.status === 'AVAILABLE').length;
            return {
              ...book,
              copies: updatedCopies,
              availableCopies: avail,
              reservedCopies: (book.reservedCopies || 0) + 1
            };
          }
          return book;
        })
      );

      if (activeCopy && activeCopy.id === copyId) {
        setActiveCopy({ ...activeCopy, status: 'RESERVED' });
      }
    } catch (err: any) {
      setReserveError(err.message || 'Error processing reservation request');
    } finally {
      setReserving(false);
    }
  };

  // Formats book spine title: bottom-to-top, multi-line for long titles ("konjam mela, konjam athukku keela")
  const formatSpineTitle = (title: string) => {
    const clean = title?.trim() || '';
    if (clean.length <= 18) {
      return { isMulti: false, line1: clean, line2: '' };
    }
    const words = clean.split(/\s+/);
    if (words.length <= 1) {
      return { isMulti: false, line1: clean, line2: '' };
    }
    
    // Find split point closest to string midpoint for balanced lines
    const targetLen = clean.length / 2;
    let currentLen = 0;
    let splitIndex = 1;
    let bestDiff = 999;
    
    for (let i = 0; i < words.length - 1; i++) {
      currentLen += words[i].length + (i > 0 ? 1 : 0);
      const diff = Math.abs(currentLen - targetLen);
      if (diff < bestDiff) {
        bestDiff = diff;
        splitIndex = i + 1;
      }
    }
    
    const line1 = words.slice(0, splitIndex).join(' ');
    const line2 = words.slice(splitIndex).join(' ');
    return { isMulti: true, line1, line2 };
  };

  // Status visual styles for book spines and badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          border: 'border-emerald-500/50',
          dot: 'bg-emerald-400',
          ledGlow: 'shadow-[0_0_10px_#34d399]',
          text: 'text-emerald-300',
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          label: 'AVAILABLE (Ready to Reserve)'
        };
      case 'RESERVED':
        return {
          border: 'border-amber-500/50',
          dot: 'bg-amber-400',
          ledGlow: 'shadow-[0_0_10px_#fbbf24]',
          text: 'text-amber-300',
          badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          label: 'RESERVED (24h Hold)'
        };
      case 'BORROWED':
        return {
          border: 'border-blue-500/50',
          dot: 'bg-blue-400',
          ledGlow: 'shadow-[0_0_10px_#60a5fa]',
          text: 'text-blue-300',
          badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          label: 'BORROWED (On Loan)'
        };
      default:
        return {
          border: 'border-stone-500/40',
          dot: 'bg-stone-400',
          ledGlow: 'shadow-[0_0_6px_#a8a29e]',
          text: 'text-stone-300',
          badgeBg: 'bg-stone-500/10 border-stone-500/30 text-stone-400',
          label: status
        };
    }
  };

  // Flatten all physical copies across all books with book details attached
  const allCopies = useMemo(() => {
    const list: Array<any> = [];
    books.forEach((book) => {
      if (book.copies && book.copies.length > 0) {
        book.copies.forEach((copy: any) => {
          list.push({
            ...copy,
            bookId: book.id,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookPublisher: book.publisher,
            bookEdition: book.edition,
            categoryId: book.categoryId,
            bookCategory: book.category,
            bookRackLocation: book.rackLocation
          });
        });
      }
    });
    return list;
  }, [books]);

  // Group all copies by Topic (Category)
  const topicRacks = useMemo(() => {
    const topicKeys = Object.keys(TOPIC_RACK_CONFIG);
    const searchLower = search.trim().toLowerCase();

    return topicKeys.map((catId) => {
      const meta = TOPIC_RACK_CONFIG[catId];
      // All copies belonging to this topic
      let copiesInTopic = allCopies.filter(
        (c) => c.categoryId === catId || c.bookCategory?.id === catId
      );

      // Apply Search Filter
      if (searchLower) {
        copiesInTopic = copiesInTopic.filter(
          (c) =>
            c.bookTitle?.toLowerCase().includes(searchLower) ||
            c.bookAuthor?.toLowerCase().includes(searchLower) ||
            c.copyNumber?.toLowerCase().includes(searchLower) ||
            c.bookRackLocation?.toLowerCase().includes(searchLower)
        );
      }

      // Apply Availability Filter
      if (availabilityFilter !== 'all') {
        copiesInTopic = copiesInTopic.filter((c) => c.status === availabilityFilter);
      }

      // Count metrics
      const totalCopies = copiesInTopic.length;
      const availableCount = copiesInTopic.filter((c) => c.status === 'AVAILABLE').length;
      const reservedCount = copiesInTopic.filter((c) => c.status === 'RESERVED').length;
      const borrowedCount = copiesInTopic.filter((c) => c.status === 'BORROWED').length;

      // Group copies into balanced shelf tiers (e.g. 3 to 4 shelves per topic rack)
      // Every single book is preserved (ella book um irukanum)
      const numShelves = Math.min(4, Math.max(2, Math.ceil(copiesInTopic.length / 24)));
      const perShelf = Math.ceil(copiesInTopic.length / numShelves) || 1;

      const shelves: Array<{ title: string; subtitle: string; copies: any[] }> = [];
      const tierLabels = [
        { letter: 'A', name: 'CORE TEXTBOOKS & CURRICULUM VOLUMES' },
        { letter: 'B', name: 'STANDARD REFERENCES & FOUNDATIONAL TEXTS' },
        { letter: 'C', name: 'ADVANCED MONOGRAPHS & RESEARCH VOLUMES' },
        { letter: 'D', name: 'LABORATORY MANUALS & DESIGN HANDBOOKS' }
      ];

      for (let i = 0; i < numShelves; i++) {
        const slice = copiesInTopic.slice(i * perShelf, (i + 1) * perShelf);
        if (slice.length > 0) {
          shelves.push({
            title: `SHELF TIER ${tierLabels[i].letter} • ${tierLabels[i].name}`,
            subtitle: `${slice.length} Physical Volumes on Shelf`,
            copies: slice
          });
        }
      }

      return {
        meta,
        totalCopies,
        availableCount,
        reservedCount,
        borrowedCount,
        shelves
      };
    });
  }, [allCopies, search, availabilityFilter]);

  // Visible topic racks based on active topic selector
  const visibleTopicRacks = useMemo(() => {
    if (activeTopic === 'all') {
      return topicRacks.filter((r) => r.totalCopies > 0 || search === '');
    }
    return topicRacks.filter((r) => r.meta.id === activeTopic);
  }, [topicRacks, activeTopic, search]);

  const totalFilteredCopies = visibleTopicRacks.reduce((sum, r) => sum + r.totalCopies, 0);

  // Render icon based on name
  const renderTopicIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'Zap':
        return <Zap className={className} />;
      case 'Sliders':
        return <Sliders className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Radio':
        return <Radio className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Title & Mission Plaque */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-low border border-stroke-glass text-xs text-aura-neon mb-2">
            <Sparkles className="w-3.5 h-3.5 text-aura-amber" />
            Topic-Wise Department Library Wooden Racks (All 8 Sections)
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Library className="w-7 h-7 text-aura-neon" />
            Virtual Department Book Racks
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Browse books organized rack-by-rack for each topic. Book titles are written directly on the spine — click any book to reserve <b>right next to it</b>!
          </p>
        </div>

        {/* Real-time LED Status Legend */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl glass-panel-card border border-stroke-subtle text-xs self-start md:self-auto">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            Green: AVAILABLE (Ready to Reserve)
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            Orange: RESERVED (24h Hold)
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
            Blue: BORROWED (On Loan)
          </span>
        </div>
      </div>

      {/* Reservation Feedback Alerts */}
      {reserveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <b className="font-semibold block text-white mb-0.5">Reservation Request Dispatched!</b>
              <span>{reserveSuccess}</span>
            </div>
          </div>
          <Link
            href="/portal/reservations"
            className="text-xs font-bold underline shrink-0 ml-4 hover:text-white"
          >
            View in My Reservations &rarr;
          </Link>
        </div>
      )}

      {reserveError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{reserveError}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🏷️ TOPIC-WISE RACK SELECTOR TABS (Each Topic Gets Its Own Rack) */}
      {/* ============================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-content-subtle px-1">
          <span className="font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-aura-purple" />
            Select Topic Rack to View:
          </span>
          <span className="text-[11px] text-aura-neon font-mono">
            All 8 Department Topic Racks Active &bull; {allCopies.length} Total Physical Copies
          </span>
        </div>

        {/* Scrollable Topic Rack Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {/* Option: All Racks */}
          <button
            onClick={() => setActiveTopic('all')}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              activeTopic === 'all'
                ? 'aura-gradient-btn text-white shadow-glow border-aura-purple scale-[1.02]'
                : 'bg-surface-low text-content-muted border-stroke-glass hover:text-white hover:bg-surface-high'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>All Racks (8 Topics &bull; {allCopies.length} Copies)</span>
          </button>

          {/* Individual Topic Racks */}
          {Object.values(TOPIC_RACK_CONFIG).map((meta) => {
            const rackData = topicRacks.find((r) => r.meta.id === meta.id);
            const count = rackData?.totalCopies ?? 0;
            const isSelected = activeTopic === meta.id;

            return (
              <button
                key={meta.id}
                onClick={() => setActiveTopic(meta.id)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-aura-purple to-aura-violet text-white shadow-glow border-aura-neon scale-[1.02]'
                    : 'bg-surface-low text-content-muted border-stroke-glass hover:text-white hover:bg-surface-high'
                }`}
              >
                {renderTopicIcon(meta.iconName, 'w-3.5 h-3.5 text-aura-neon')}
                <span>{meta.rackNum}: {meta.title.split('&')[0].trim()}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isSelected
                    ? 'bg-black/30 text-white'
                    : 'bg-surface-high text-aura-neon border border-stroke-subtle'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar: Live Search & Availability Status Filter */}
      <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-content-subtle absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all racks by book title, author, or ECESC No..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-content-subtle hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Availability Filter & Summary */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content-muted focus:outline-none focus:border-aura-purple cursor-pointer"
          >
            <option value="all">All Statuses (Available, Reserved & Borrowed)</option>
            <option value="AVAILABLE">🟢 Available to Reserve Only</option>
            <option value="RESERVED">🟠 Reserved Volumes</option>
            <option value="BORROWED">🔵 Borrowed Copies</option>
          </select>

          <span className="text-xs text-content-muted font-mono whitespace-nowrap">
            Showing <b className="text-white">{totalFilteredCopies}</b> copies
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🪵 THE TOPIC-WISE REALISTIC SOLID MAHOGANY BOOKCASES 🪵        */}
      {/* ============================================================== */}
      {loading ? (
        <div className="p-16 rounded-3xl glass-panel-card text-center space-y-3">
          <div className="w-10 h-10 border-4 border-aura-purple border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-content-muted">
            Constructing 8 topic-wise departmental wooden bookcases with book title spines...
          </p>
        </div>
      ) : visibleTopicRacks.length === 0 || totalFilteredCopies === 0 ? (
        <div className="p-16 rounded-3xl glass-panel-card text-center space-y-3 border border-stroke-glass">
          <Library className="w-12 h-12 text-content-subtle mx-auto" />
          <h3 className="text-base font-bold text-white">No Books Found in this Rack with Current Filters</h3>
          <p className="text-xs text-content-muted">
            Try adjusting your search query or switching availability to 'All Statuses'.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setAvailabilityFilter('all');
              setActiveTopic('all');
            }}
            className="px-4 py-2 rounded-xl bg-surface-high text-xs font-semibold text-white hover:bg-surface-low border border-stroke-glass mt-2"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {visibleTopicRacks.map((topicRack) => {
            const { meta, shelves, totalCopies, availableCount, reservedCount, borrowedCount } =
              topicRack;

            if (shelves.length === 0) return null;

            return (
              <div
                key={meta.id}
                id={`rack-${meta.id}`}
                className="wooden-bookcase keep-white relative rounded-3xl overflow-hidden border-8 border-[#2e170c] shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-gradient-to-b from-[#1b1008] via-[#24140b] to-[#120803] p-4 sm:p-6 md:p-8 space-y-8"
              >
                {/* Ambient Overhead Downlights */}
                <div className="absolute top-0 inset-x-0 h-16 flex justify-around pointer-events-none opacity-40">
                  <div className="w-56 h-20 bg-amber-400/25 blur-2xl rounded-full" />
                  <div className="w-56 h-20 bg-purple-400/25 blur-2xl rounded-full" />
                  <div className="w-56 h-20 bg-amber-400/25 blur-2xl rounded-full" />
                </div>

                {/* ============================================================== */}
                {/* 👑 GRAND CARVED MAHOGANY TOPIC RACK HEADER PLAQUE               */}
                {/* ============================================================== */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#5c3a21]/60 relative z-10 gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Brass Rack Badge */}
                      <div className="bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#d97706] px-3.5 py-1 rounded shadow border border-[#fef3c7] text-[11px] font-black tracking-widest text-[#2b1704] uppercase flex items-center gap-1.5">
                        {renderTopicIcon(meta.iconName, 'w-3.5 h-3.5')}
                        <span>{meta.rackNum}</span>
                        <span>&bull;</span>
                        <span>{meta.code}</span>
                      </div>

                      {/* Main Topic Name */}
                      <h2 className="wooden-rack-title text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {meta.title}
                      </h2>
                    </div>

                    {/* Subtitle Description */}
                    <p className="wooden-rack-subtitle text-xs md:text-sm text-amber-200 font-serif italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {meta.subtitle}
                    </p>
                  </div>

                  {/* Rack Availability Counters */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
                    <span className="wooden-rack-badge px-3 py-1 rounded-lg bg-black/75 border border-white/20 text-white font-mono text-xs font-bold">
                      {totalCopies} Volumes
                    </span>
                    <span className="status-avail px-2.5 py-1 rounded-lg bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 font-mono text-[11px] font-bold">
                      🟢 {availableCount} Avail
                    </span>
                    {reservedCount > 0 && (
                      <span className="status-held px-2.5 py-1 rounded-lg bg-amber-500/25 border border-amber-400/50 text-amber-300 font-mono text-[11px] font-bold">
                        🟠 {reservedCount} Held
                      </span>
                    )}
                    {borrowedCount > 0 && (
                      <span className="status-out px-2.5 py-1 rounded-lg bg-blue-500/25 border border-blue-400/50 text-blue-300 font-mono text-[11px] font-bold">
                        🔵 {borrowedCount} Out
                      </span>
                    )}
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 📚 SHELF TIERS FOR THIS TOPIC RACK                              */}
                {/* ============================================================== */}
                {shelves.map((shelf, shelfIndex) => (
                  <div key={shelf.title} className="relative space-y-0">
                    {/* Shelf Tier Plate */}
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                        <span className="wooden-shelf-tier-title text-xs uppercase tracking-widest font-mono font-extrabold text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          {shelf.title}
                        </span>
                      </div>
                      <span className="wooden-shelf-tier-sub text-[10px] text-amber-100 font-mono font-bold drop-shadow">
                        {shelf.subtitle}
                      </span>
                    </div>

                    {/* Physical Books on Shelf + Inline Popover Card Beside Clicked Book */}
                    <div className="flex items-end justify-start gap-2 sm:gap-3 px-3 overflow-x-auto pb-2 pt-8 min-h-[275px] scrollbar-thin scrollbar-thumb-amber-800/60 scrollbar-track-transparent">
                      {shelf.copies.map((copy: any, copyIndex: number) => {
                        const style = getStatusColor(copy.status);
                        const isSelected = activeCopy?.id === copy.id;

                        // Varied realistic book spine gradients (rich leather & cloth textures)
                        const spineGradVariants = [
                          'bg-gradient-to-r from-[#2c003e] via-[#4a154b] to-[#1e002a]', // Purple cloth
                          'bg-gradient-to-r from-[#0d2b45] via-[#203c56] to-[#081b2c]', // Navy buckram
                          'bg-gradient-to-r from-[#1c3a27] via-[#2a5438] to-[#122418]', // Forest green leather
                          'bg-gradient-to-r from-[#422006] via-[#5e3008] to-[#2d1504]', // Antique calf leather
                          'bg-gradient-to-r from-[#3b0d11] via-[#58151b] to-[#240608]', // Deep burgundy
                          'bg-gradient-to-r from-[#1f2937] via-[#374151] to-[#111827]', // Charcoal buckram
                          'bg-gradient-to-r from-[#312e81] via-[#4338ca] to-[#1e1b4b]', // Royal indigo
                          'bg-gradient-to-r from-[#451a03] via-[#78350f] to-[#291002]'  // Chestnut leather
                        ];
                        const spineGrad =
                          spineGradVariants[
                            (shelfIndex * 7 + copyIndex) % spineGradVariants.length
                          ];

                        // Varied heights for organic bookshelf realism
                        const spineHeight = 220 + (copyIndex % 5) * 8;

                        return (
                          <React.Fragment key={copy.id}>
                            {/* ============================================================== */}
                            {/* 📖 THE BOOK SPINE (TITLE WRITTEN PROMINENTLY ON THE SPINE)      */}
                            {/* ============================================================== */}
                            <div
                              onClick={() => {
                                if (isSelected) {
                                  setActiveCopy(null);
                                } else {
                                  setActiveCopy(copy);
                                  setReserveSuccess(null);
                                  setReserveError(null);
                                }
                              }}
                              className={`cursor-pointer relative flex flex-col justify-between items-center rounded-t-md p-1.5 shadow-2xl border transition-all duration-300 group shrink-0 ${
                                isSelected
                                  ? '-translate-y-6 ring-4 ring-aura-neon scale-105 z-30 shadow-[0_0_30px_rgba(221,183,255,0.5)]'
                                  : 'hover:-translate-y-3 hover:scale-102 hover:z-20'
                              } ${spineGrad} ${style.border}`}
                              style={{
                                width: '60px',
                                minWidth: '60px',
                                height: `${spineHeight}px`
                              }}
                              title={`${copy.bookTitle} (${copy.copyNumber})\nClick to inspect & reserve right here on the shelf`}
                            >
                              {/* Top of Spine: LED Status Dot & Copy Index */}
                              <div className="flex flex-col items-center pt-0.5 w-full">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${style.dot} ${style.ledGlow}`}
                                />
                                <span className="wooden-spine-num text-[8px] font-mono text-white mt-0.5 font-black tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                                  #{(copyIndex + 1).toString().padStart(2, '0')}
                                </span>
                              </div>

                              {/* Center of Spine: BOOK TITLE WRITTEN BOTTOM-TO-TOP ("keela irunthu mela") */}
                              {/* Long titles: "konjam mela, konjam athukku keela" */}
                              {(() => {
                                const { isMulti, line1, line2 } = formatSpineTitle(copy.bookTitle);
                                return (
                                  <div className="flex-1 flex items-center justify-center my-1 overflow-hidden w-full px-0.5">
                                    <div className="flex flex-row items-center justify-center gap-1 overflow-hidden max-h-[155px]">
                                      {/* Line 1 (Upper line when tilted: "konjam mela", runs bottom-to-top) */}
                                      <span
                                        className="wooden-spine-title font-black text-[10px] tracking-tight text-white select-none whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,1)]"
                                        style={{
                                          writingMode: 'vertical-rl',
                                          transform: 'rotate(180deg)',
                                          maxHeight: '150px'
                                        }}
                                        title={copy.bookTitle}
                                      >
                                        {line1}
                                      </span>

                                      {/* Line 2 (Lower line when tilted: "konjam athukku keela", runs bottom-to-top) */}
                                      {isMulti && (
                                        <span
                                          className="wooden-spine-title-2 font-extrabold text-[9px] tracking-tight text-amber-200 select-none whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,1)]"
                                          style={{
                                            writingMode: 'vertical-rl',
                                            transform: 'rotate(180deg)',
                                            maxHeight: '150px'
                                          }}
                                          title={copy.bookTitle}
                                        >
                                          {line2}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Bottom of Spine: Accession No & Embossed Brass Trim */}
                              <div className="w-full flex flex-col items-center pb-1 border-t border-white/20 pt-1">
                                <span className="wooden-spine-acc text-[8.5px] font-mono font-black text-amber-300 tracking-tight whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                                  {copy.copyNumber}
                                </span>
                                <span className="w-3/4 h-[2px] bg-amber-400/80 rounded-full mt-0.5" />
                              </div>
                            </div>

                            {/* ============================================================== */}
                            {/* 🌟 RIGHT BESIDE THIS BOOK: INLINE INSPECTION & RESERVE CARD 🌟 */}
                            {/* ============================================================== */}
                            {isSelected && (
                              <div
                                className="shrink-0 w-80 sm:w-96 rounded-2xl p-5 bg-white border-2 border-aura-purple shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between self-end mb-2 z-40 transition-all duration-300 animate-in fade-in zoom-in-95 text-slate-900"
                                style={{ minHeight: '220px' }}
                              >
                                {/* Card Header: Copy Code, Status Badge & Close Button */}
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded border border-purple-200">
                                      {copy.copyNumber}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeBg}`}
                                    >
                                      {copy.status}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveCopy(null);
                                    }}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                    title="Close inspection"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Card Body: Full Book Title, Author & Location */}
                                <div className="py-2.5 space-y-1">
                                  <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                                    {copy.bookTitle}
                                  </h4>
                                  <p className="text-xs text-slate-600 line-clamp-1">
                                    By <span className="text-slate-900 font-semibold">{copy.bookAuthor}</span>
                                    {copy.bookPublisher && ` &bull; ${copy.bookPublisher}`}
                                  </p>
                                  <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 font-mono">
                                    <span className="flex items-center gap-1 text-purple-700 font-bold">
                                      <MapPin className="w-3 h-3" />
                                      {meta.rackNum}, {shelf.title.split('•')[0].trim()}
                                    </span>
                                    <span className="text-slate-600 font-medium">
                                      {meta.title}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block mt-1 font-semibold">
                                    ⏳ 15-Day Return Period &bull; Limit: 1 Book/Day (Student) / 3 (Staff)
                                  </div>
                                </div>

                                {/* Card Footer: Instant Reservation Button & Full Details Link */}
                                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                                  {copy.status === 'AVAILABLE' ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReserveCopy(copy.id, copy.copyNumber, copy.bookTitle);
                                      }}
                                      disabled={reserving}
                                      className="flex-1 aura-gradient-btn py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow hover:scale-[1.02] transition-transform text-white"
                                    >
                                      <BookmarkPlus className="w-3.5 h-3.5" />
                                      <span>
                                        {reserving
                                          ? 'Reserving Copy...'
                                          : `Reserve Copy ${copy.copyNumber} Now`}
                                      </span>
                                    </button>
                                  ) : copy.status === 'RESERVED' ? (
                                    <div className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold text-center flex items-center justify-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>On Hold (24-Hour Pickup Active)</span>
                                    </div>
                                  ) : (
                                    <div className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 font-semibold text-center flex items-center justify-center gap-1.5">
                                      <BookmarkCheck className="w-3.5 h-3.5" />
                                      <span>Currently Borrowed (Due in 15D)</span>
                                    </div>
                                  )}

                                  <Link
                                    href={`/portal/book/${copy.bookId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors shrink-0"
                                    title="Open Full Book Details Page"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Solid Mahogany Wooden Shelf Plank */}
                    <div className="h-7 w-full bg-gradient-to-r from-[#422517] via-[#5c341f] to-[#3a1f13] border-t-2 border-[#8c522f] shadow-[0_12px_20px_rgba(0,0,0,0.8)] rounded-b-lg flex items-center justify-between px-6">
                      <span className="wooden-timber-plank-text text-[9.5px] text-amber-100 font-mono tracking-widest uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {meta.rackNum} &bull; TIER {shelfIndex + 1} SOLID TIMBER STACK
                      </span>
                      <span className="wooden-timber-plank-text text-[9.5px] text-amber-100 font-mono tracking-widest uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        DEPT. OF ECE &bull; FXEC
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
