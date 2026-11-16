'use client';

import React, { useState, useEffect } from 'react';
import {
  Library,
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  BookmarkCheck,
  ChevronRight,
  Info,
  Sparkles,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export default function VirtualBookRackPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [activeCopy, setActiveCopy] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRackData();
  }, []);

  const loadRackData = async () => {
    try {
      setLoading(true);
      const res = await api.getBooks();
      if (res?.books && res.books.length > 0) {
        setBooks(res.books);
        setSelectedBook(res.books[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book: any) => {
    setSelectedBook(book);
    setActiveCopy(null);
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

  // Color mapping based on copy status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'from-emerald-700 via-emerald-800 to-emerald-950',
          border: 'border-emerald-500/40',
          dot: 'bg-emerald-400',
          ledGlow: 'shadow-[0_0_8px_#34d399]',
          text: 'text-emerald-300',
          label: 'AVAILABLE'
        };
      case 'RESERVED':
        return {
          bg: 'from-amber-700 via-amber-800 to-amber-950',
          border: 'border-amber-500/40',
          dot: 'bg-amber-400',
          ledGlow: 'shadow-[0_0_8px_#fbbf24]',
          text: 'text-amber-300',
          label: 'RESERVED'
        };
      case 'BORROWED':
        return {
          bg: 'from-blue-700 via-blue-800 to-blue-950',
          border: 'border-blue-500/40',
          dot: 'bg-blue-400',
          ledGlow: 'shadow-[0_0_8px_#60a5fa]',
          text: 'text-blue-300',
          label: 'BORROWED'
        };
      case 'DAMAGED':
      case 'LOST':
      default:
        return {
          bg: 'from-stone-700 via-stone-800 to-stone-900',
          border: 'border-stone-500/40',
          dot: 'bg-stone-400',
          ledGlow: 'shadow-[0_0_6px_#a8a29e]',
          text: 'text-stone-300',
          label: status
        };
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.rackLocation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-low border border-stroke-glass text-xs text-aura-neon mb-2">
            <Sparkles className="w-3.5 h-3.5 text-aura-amber" />
            Physics-Based Digital Twin
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Library className="w-7 h-7 text-aura-neon" />
            Virtual Department Book Rack
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Visual wooden bookshelf rendering physical copies with live status LEDs from the database.
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl glass-panel-card border border-stroke-subtle text-xs self-start md:self-auto">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            Green: AVAILABLE
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-aura-amber font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            Orange: RESERVED
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
            Blue: BORROWED
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-500/10 text-stone-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
            Grey: DAMAGED
          </span>
        </div>
      </div>

      {/* Main Grid: Left Book Selector & Right Realistic Bookshelf */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Books List / Shelf Browser */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-content-subtle absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rack or book title..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple"
              />
            </div>

            <div className="text-[11px] uppercase tracking-wider font-semibold text-content-muted mb-2 px-1">
              Select Book on Shelf ({filteredBooks.length})
            </div>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook?.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-aura-purple/20 border-aura-purple text-white shadow-glow'
                        : 'bg-surface-low/70 border-stroke-subtle text-content-muted hover:text-white hover:bg-surface-high'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-content-subtle mb-1">
                      <span className="font-mono">{book.rackLocation}</span>
                      <span className="font-bold text-aura-neon">{book.totalCopies} Copies</span>
                    </div>
                    <div className="font-bold text-xs line-clamp-1">{book.title}</div>
                    <div className="text-[11px] text-content-subtle mt-0.5 line-clamp-1">{book.author}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: The Realistic CSS Bookshelf */}
        <div className="lg:col-span-8 space-y-4">
          {selectedBook ? (
            <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle">
              {/* Selected Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stroke-subtle gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-aura-purple/20 text-aura-neon">
                      {selectedBook.category?.name || 'ECE Core'}
                    </span>
                    <span className="text-xs text-content-subtle font-mono">
                      {selectedBook.rackLocation}
                    </span>
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-white">
                    {selectedBook.title}
                  </h2>
                  <p className="text-xs text-content-muted">
                    Author: <span className="text-white">{selectedBook.author}</span> &bull; {selectedBook.edition}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-white">{selectedBook.copies?.length || selectedBook.totalCopies}</div>
                  <div className="text-[10px] text-content-subtle uppercase tracking-wider">Physical Volumes</div>
                </div>
              </div>

              {/* Realistic Wooden Bookshelf Unit */}
              <div className="wooden-bookcase bookshelf-unit keep-white relative rounded-3xl overflow-hidden border-8 border-[#2e170c] shadow-2xl bg-gradient-to-b from-[#1b1008] via-[#24140b] to-[#120803] p-6 md:p-8 min-h-[380px] flex flex-col justify-end">
                {/* Brass Shelf Label Plate */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#d97706] px-4 py-1 rounded shadow border border-[#fef3c7] text-[10px] font-black tracking-widest text-[#2b1704] uppercase">
                  {selectedBook.rackLocation} &bull; {selectedBook.category?.code || 'ECE'}
                </div>

                {/* Spines Row on the Shelf */}
                <div className="flex items-end justify-center gap-2 sm:gap-3.5 px-4 overflow-x-auto pb-1 pt-8 min-h-[260px]">
                  {selectedBook.copies?.map((copy: any, index: number) => {
                    const style = getStatusColor(copy.status);
                    const isSelectedCopy = activeCopy?.id === copy.id;

                    return (
                      <div
                        key={copy.id}
                        onClick={() => setActiveCopy(copy)}
                        className={`book-spine cursor-pointer relative flex flex-col justify-between items-center rounded-t-md p-1.5 shadow-2xl border ${style.border} bg-gradient-to-r ${style.bg} select-none transition-all ${
                          isSelectedCopy ? '-translate-y-6 ring-2 ring-aura-neon scale-105 z-30' : ''
                        }`}
                        style={{
                          width: '58px',
                          minWidth: '58px',
                          height: `${210 + (index % 3) * 15}px`,
                        }}
                      >
                        {/* Top Spine LED Status Light */}
                        <div className="flex flex-col items-center pt-1 w-full">
                          <span className={`w-2.5 h-2.5 rounded-full ${style.dot} ${style.ledGlow}`} />
                          <span className="wooden-spine-num text-[8px] font-mono text-white mt-0.5 font-black tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">#{(index + 1).toString().padStart(2, '0')}</span>
                        </div>

                        {/* Center of Spine: BOOK TITLE WRITTEN BOTTOM-TO-TOP ("keela irunthu mela") */}
                        {(() => {
                          const { isMulti, line1, line2 } = formatSpineTitle(selectedBook.title);
                          return (
                            <div className="flex-1 flex items-center justify-center my-1 overflow-hidden w-full px-0.5">
                              <div className="flex flex-row items-center justify-center gap-1 overflow-hidden max-h-[145px]">
                                <span
                                  className="wooden-spine-title font-black text-[10px] tracking-tight text-white select-none whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,1)]"
                                  style={{
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                    maxHeight: '140px'
                                  }}
                                  title={selectedBook.title}
                                >
                                  {line1}
                                </span>
                                {isMulti && (
                                  <span
                                    className="wooden-spine-title-2 font-extrabold text-[9px] tracking-tight text-amber-200 select-none whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,1)]"
                                    style={{
                                      writingMode: 'vertical-rl',
                                      transform: 'rotate(180deg)',
                                      maxHeight: '140px'
                                    }}
                                    title={selectedBook.title}
                                  >
                                    {line2}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Bottom Embossed Gold Trim & Copy Number */}
                        <div className="w-full flex flex-col items-center pb-1 border-t border-white/20 pt-1">
                          <span className="wooden-spine-acc text-[8.5px] font-mono font-black text-amber-300 tracking-tight whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                            {copy.copyNumber}
                          </span>
                          <span className="w-3/4 h-[2px] bg-amber-400/80 rounded-full mt-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* The Wooden Shelf Plank */}
                <div className="h-7 w-full bg-gradient-to-r from-[#422517] via-[#5c341f] to-[#3a1f13] border-t-2 border-[#8c522f] shadow-[0_12px_20px_rgba(0,0,0,0.8)] rounded-b-lg flex items-center justify-between px-6 mt-1">
                  <span className="wooden-timber-plank-text text-[9.5px] text-amber-100 font-mono tracking-widest uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {selectedBook.rackLocation} &bull; SOLID TIMBER STACK
                  </span>
                  <span className="wooden-timber-plank-text text-[9.5px] text-amber-100 font-mono tracking-widest uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    DEPT. OF ECE &bull; FXEC
                  </span>
                </div>
              </div>

              {/* Spine Click Inspection Drawer */}
              {activeCopy && (
                <div className="mt-6 p-4 rounded-2xl bg-surface-low border border-stroke-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">
                        {activeCopy.copyNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(activeCopy.status).border} ${getStatusColor(activeCopy.status).text}`}>
                        {activeCopy.status}
                      </span>
                    </div>
                    <p className="text-xs text-content-muted">
                      Condition: <span className="text-white">{activeCopy.conditionNotes || 'Normal wear; spine intact'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeCopy.status === 'AVAILABLE' && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Ready for Physical Issue
                      </span>
                    )}
                    {activeCopy.status === 'RESERVED' && (
                      <span className="text-xs text-aura-amber font-semibold flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Reserved by Student/Staff
                      </span>
                    )}
                    {activeCopy.status === 'BORROWED' && (
                      <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                        <BookmarkCheck className="w-4 h-4" /> Currently On Loan
                      </span>
                    )}
                    <button
                      onClick={() => setActiveCopy(null)}
                      className="p-1.5 text-content-subtle hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel-card p-12 rounded-3xl text-center text-content-muted text-xs">
              Select a book title to render physical shelf rack.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
