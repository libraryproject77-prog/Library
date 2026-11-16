'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  Library,
  Copy,
  CheckCircle2,
  X,
  ExternalLink,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
  BookmarkPlus,
  Clock,
  Layers,
  MapPin
} from 'lucide-react';
import { api } from '@/lib/api';

export default function StudentCatalogPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // Quick Reserve Modal state
  const [reservingBook, setReservingBook] = useState<any | null>(null);
  const [reservingCopyId, setReservingCopyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Subject chips
  const subjectTags = [
    { label: 'All Subjects', query: '' },
    { label: 'Circuits & ICs', query: 'Circuit' },
    { label: 'VLSI & Silicon', query: 'VLSI' },
    { label: 'Signals & DSP', query: 'Signal' },
    { label: 'Microprocessors & IoT', query: 'Microprocessor' },
    { label: 'Wireless & Telecom', query: 'Communication' },
    { label: 'Electromagnetics', query: 'Electromagnetic' }
  ];

  useEffect(() => {
    loadBooks();
  }, [selectedCategory, selectedAvailability]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadBooks();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const res = await api.getBooks({
        search,
        categoryId: selectedCategory,
        availability: selectedAvailability
      });
      if (res?.books) {
        setBooks(res.books);
      }
      if (res?.categories && res.categories.length > 0) {
        setCategories(res.categories);
      } else {
        const catRes = await api.getCategories();
        if (catRes?.categories) {
          setCategories(catRes.categories);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantReserve = async (book: any) => {
    const availableCopy = book.copies?.find((c: any) => c.status === 'AVAILABLE');
    if (!availableCopy) {
      alert('All copies of this title are currently borrowed or reserved.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.requestReservation(availableCopy.id, 24);
      setToastMessage(`Reserved copy ${availableCopy.copyNumber} for "${book.title}"! Please collect at ECE Dept Library within 24 hours.`);
      setReservingBook(null);
      await loadBooks();
    } catch (err: any) {
      alert(err.message || 'Error requesting reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-aura-neon" />
            ECE Department Book Catalogue
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Search 580+ departmental textbook titles, inspect physical copy numbers, and reserve instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portal/rack"
            className="aura-gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Library className="w-4 h-4" />
            <span>Virtual Wooden Rack</span>
          </Link>
          <Link
            href="/portal/reservations"
            className="px-4 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-xs font-semibold text-content-muted hover:text-white transition-colors"
          >
            My Reservations
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <Link href="/portal/reservations" className="text-xs font-bold underline shrink-0 ml-4 hover:text-white">
            Track Hold &rarr;
          </Link>
        </div>
      )}

      {/* Quick Subject Chips Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-content-subtle shrink-0 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5 text-aura-purple" />
          Subjects:
        </span>
        {subjectTags.map((tag) => {
          const isActive = search === tag.query;
          return (
            <button
              key={tag.label}
              onClick={() => setSearch(tag.query)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-aura-purple text-white shadow-glow border border-aura-purple'
                  : 'bg-surface-low hover:bg-surface-high text-content-muted hover:text-white border border-stroke-glass'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Search and Filters Toolbar */}
      <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-content-subtle absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title, author, or ECESC Acc No..."
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

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content-muted focus:outline-none focus:border-aura-purple cursor-pointer"
          >
            <option value="all">All ECE Disciplines ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content-muted focus:outline-none focus:border-aura-purple cursor-pointer"
          >
            <option value="all">All Availability</option>
            <option value="available">In Stock (Available &gt; 0)</option>
            <option value="out">All Borrowed (0 Available)</option>
          </select>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-content-subtle px-1">
        <span>Found <b className="text-white">{books.length}</b> titles matching criteria</span>
        {search && <span>Active Search Filter: "{search}"</span>}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full glass-panel-card p-12 rounded-2xl text-center text-content-muted text-xs">
            Searching department catalog...
          </div>
        ) : books.length === 0 ? (
          <div className="col-span-full glass-panel-card p-12 rounded-2xl text-center text-content-muted text-xs">
            No textbooks match your search query. Try clearing filters.
          </div>
        ) : (
          books.map((book) => {
            const hasCopies = book.availableCopies > 0;
            return (
              <div
                key={book.id}
                className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle hover:border-aura-purple/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start space-x-3.5 mb-3">
                    <div className="w-16 h-22 rounded-xl overflow-hidden bg-surface-high shrink-0 border border-stroke-glass shadow-md">
                      <img
                        src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-aura-neon bg-aura-purple/20 px-2 py-0.5 rounded">
                          {book.category?.code || 'ECE'}
                        </span>
                        <span className="text-[10px] text-content-subtle font-mono truncate">
                          {book.rackLocation}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-xs text-content-muted mt-1 truncate">
                        By {book.author}
                      </p>
                      <p className="text-[11px] text-content-subtle truncate">
                        {book.publisher || 'Academic Publisher'}
                      </p>
                    </div>
                  </div>

                  {/* Stock Availability Pill */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-content-subtle">
                      Total: <b className="text-white">{book.totalCopies}</b>
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        hasCopies
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {hasCopies ? `${book.availableCopies} Available` : 'All Borrowed'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-stroke-subtle text-xs gap-2">
                  <Link
                    href={`/portal/rack`}
                    className="p-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-aura-neon flex items-center gap-1.5 transition-colors font-medium text-[11px]"
                    title="View on Virtual Wooden Rack"
                  >
                    <Library className="w-3.5 h-3.5" />
                    <span>Rack</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {hasCopies && (
                      <button
                        onClick={() => handleInstantReserve(book)}
                        disabled={isSubmitting}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        title="Instant 1-Click Hold on First Available Copy"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Reserve</span>
                      </button>
                    )}

                    <Link
                      href={`/portal/book/${book.id}`}
                      className="aura-gradient-btn px-3 py-1.5 rounded-xl font-semibold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <span>Copies</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
