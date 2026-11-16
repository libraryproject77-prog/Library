'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Library,
  CalendarCheck2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  BookmarkPlus,
  ShieldAlert,
  Info,
  Check,
  Building,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [book, setBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCopy, setSelectedCopy] = useState<any | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      loadBookDetails();
    }
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getBookById(bookId);
      if (res?.book) {
        setBook(res.book);
        if (res.book.copies && res.book.copies.length > 0) {
          // Default select the first available copy if exists
          const available = res.book.copies.find((c: any) => c.status === 'AVAILABLE');
          setSelectedCopy(available || res.book.copies[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveCopy = async (copyId: string, copyNumber: string) => {
    try {
      setReserving(true);
      setReserveSuccess(null);
      setErrorMessage(null);
      await api.requestReservation(copyId, 24);
      setReserveSuccess(`Reservation request submitted for ${copyNumber}! Visit Department Library Counter upon approval.`);
      
      // Reload book data to reflect reservation
      await loadBookDetails();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing reservation');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-aura-purple border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm text-content-muted">Retrieving physical accession register records...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="glass-panel-card p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-aura-amber mx-auto" />
        <h2 className="text-xl font-bold text-white">Book Title Not Found</h2>
        <p className="text-xs text-content-muted">
          The requested accession title could not be located in the departmental catalog.
        </p>
        <Link
          href="/portal/catalog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-high text-xs font-semibold text-white hover:bg-surface-low border border-stroke-glass"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const copies = book.copies || [];
  const availableCopies = copies.filter((c: any) => c.status === 'AVAILABLE');

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal/catalog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-content-muted hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Book Catalogue
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/portal/rack"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-low border border-stroke-glass text-xs text-aura-neon hover:text-white transition-colors"
          >
            <Library className="w-3.5 h-3.5" />
            <span>Browse Full Virtual Rack</span>
          </Link>
        </div>
      </div>

      {/* Hero Book Overview Card */}
      <div className="glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-subtle relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-aura-purple/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row gap-8 relative z-10">
          {/* Book 3D Hardcover Preview */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-48 h-64 md:w-56 md:h-76 rounded-2xl overflow-hidden shadow-2xl border-2 border-stroke-glass bg-surface-high relative group">
              <img
                src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-aura-purple/80 text-white shadow">
                  {book.category?.code || 'ECE'} REFERENCE
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-content-subtle font-mono">
              <MapPin className="w-3.5 h-3.5 text-aura-neon" />
              <span>Location: {book.rackLocation}</span>
            </div>
          </div>

          {/* Book Details Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-aura-purple/20 text-aura-neon border border-aura-purple/30">
                {book.category?.name || 'Department Collection'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-high border border-stroke-glass text-content-muted">
                {book.edition || 'Standard Edition'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-high border border-stroke-glass text-content-muted">
                Pub. Year: {book.publicationYear || 'Academic Library Record'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {book.title}
            </h1>

            <div className="text-sm text-content-muted flex items-center gap-2">
              <span>Authored by:</span>
              <span className="text-white font-semibold">{book.author}</span>
            </div>

            <div className="text-xs text-content-subtle flex flex-wrap gap-x-6 gap-y-1 pt-1">
              <div>Publisher: <span className="text-white font-medium">{book.publisher || 'Department Standard'}</span></div>
              {book.isbn && <div>ISBN: <span className="text-white font-mono">{book.isbn}</span></div>}
              <div>Category Code: <span className="text-aura-neon font-mono">{book.category?.code || 'ECE'}</span></div>
            </div>

            <p className="text-xs md:text-sm text-content-muted leading-relaxed pt-2">
              {book.description ||
                'Standard textbook and reference volume curated for the Department of Electronics and Communication Engineering at Francis Xavier Engineering College. Kept for academic study, autonomous curriculum reference, and faculty consultation.'}
            </p>

            {/* Availability Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3 rounded-2xl bg-surface-low border border-stroke-glass text-center">
                <div className="text-[10px] text-content-subtle uppercase tracking-wider font-semibold">Total Register Copies</div>
                <div className="text-xl font-bold text-white mt-0.5">{book.totalCopies}</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Available on Shelf</div>
                <div className="text-xl font-bold text-emerald-300 mt-0.5">{book.availableCopies}</div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Reserved Holds</div>
                <div className="text-xl font-bold text-amber-300 mt-0.5">{book.reservedCopies}</div>
              </div>
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                <div className="text-[10px] text-purple-400 uppercase tracking-wider font-semibold">Currently Borrowed</div>
                <div className="text-xl font-bold text-purple-300 mt-0.5">{book.borrowedCopies}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {reserveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start space-x-3 text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <b className="font-semibold text-white block mb-0.5">Reservation Requested Successfully!</b>
            {reserveSuccess}
            <div className="mt-2">
              <Link
                href="/portal/reservations"
                className="inline-flex items-center gap-1 font-bold underline hover:text-white"
              >
                Track in My Reservations &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-3 text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <b className="font-semibold text-white block mb-0.5">Action Blocked</b>
            {errorMessage}
          </div>
        </div>
      )}

      {/* SECTION: PHYSICAL ACCESSION COPIES ON VIRTUAL WOODEN RACK */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
              <Library className="w-5 h-5 text-aura-neon" />
              Physical Book Copies on Shelf ({book.rackLocation})
            </h2>
            <p className="text-xs text-content-muted">
              Select an individual accession copy from the shelf below to inspect condition notes and reserve.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
              Available ({availableCopies.length})
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span>
              Reserved ({book.reservedCopies})
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f87171]"></span>
              Borrowed ({book.borrowedCopies})
            </span>
          </div>
        </div>

        {/* Realistic Wooden Shelf View */}
        <div className="wooden-bookcase keep-white relative rounded-3xl overflow-hidden border-4 border-[#3e2723] shadow-2xl bg-gradient-to-b from-[#1b1008] via-[#24140b] to-[#120803] p-6">
          {/* Shelf Ambient Overhead Downlights */}
          <div className="absolute top-0 inset-x-0 h-10 flex justify-around pointer-events-none opacity-40">
            <div className="w-40 h-20 bg-amber-200/30 blur-2xl rounded-full"></div>
            <div className="w-40 h-20 bg-purple-300/30 blur-2xl rounded-full"></div>
            <div className="w-40 h-20 bg-amber-200/30 blur-2xl rounded-full"></div>
          </div>

          {/* Wooden Shelf Header / Label Plaque */}
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#5c3a21]/60">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded bg-[#331b0e] border border-[#6b4226] text-amber-300 font-mono text-xs font-bold tracking-wider shadow-inner">
                {book.rackLocation}
              </div>
              <span className="text-xs text-amber-200 font-serif tracking-wide italic">
                FXEC Department Library Accession Stack
              </span>
            </div>
            <span className="text-xs text-amber-100/90 font-mono">
              {copies.length} Physical Volume{copies.length > 1 ? 's' : ''} in Register
            </span>
          </div>

          {/* Copies Row Arranged as Physical Book Spines */}
          <div className="flex items-end justify-center sm:justify-start gap-4 sm:gap-6 min-h-[220px] px-4 overflow-x-auto pb-4">
            {copies.map((copy: any, index: number) => {
              const isSelected = selectedCopy?.id === copy.id;
              const isAvailable = copy.status === 'AVAILABLE';
              const isReserved = copy.status === 'RESERVED';
              const isBorrowed = copy.status === 'BORROWED';

              // Alternate spine styling
              const spineVariants = [
                'bg-gradient-to-r from-[#2c003e] via-[#4a154b] to-[#1e002a]',
                'bg-gradient-to-r from-[#0d2b45] via-[#203c56] to-[#081b2c]',
                'bg-gradient-to-r from-[#1c3a27] via-[#2a5438] to-[#122418]',
                'bg-gradient-to-r from-[#422006] via-[#5e3008] to-[#2d1504]'
              ];
              const spineGrad = spineVariants[index % spineVariants.length];

              return (
                <div
                  key={copy.id}
                  onClick={() => {
                    setSelectedCopy(copy);
                    setReserveSuccess(null);
                    setErrorMessage(null);
                  }}
                  className={`relative cursor-pointer transition-all duration-300 flex flex-col items-center group shrink-0 ${
                    isSelected ? '-translate-y-5 scale-105' : 'hover:-translate-y-2'
                  }`}
                  style={{ width: '64px', height: `${180 + (index % 3) * 12}px` }}
                >
                  {/* Selected Bookmark indicator */}
                  {isSelected && (
                    <div className="absolute -top-3 z-30 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-aura-neon shadow-[0_0_10px_#ddb7ff] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                      </div>
                    </div>
                  )}

                  {/* Physical Book Spine */}
                  <div
                    className={`w-full h-full rounded-t-md shadow-2xl relative flex flex-col justify-between p-2 border-x border-t ${spineGrad} ${
                      isSelected ? 'border-aura-neon ring-2 ring-aura-purple/50' : 'border-white/10'
                    }`}
                  >
                    {/* Top Spine Ribbon & Accession Code */}
                    <div className="flex flex-col items-center">
                      <div className="w-full h-1 bg-amber-400/60 rounded-full mb-1"></div>
                      <span className="wooden-spine-num text-[9px] font-bold tracking-tight text-white font-mono text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                        VOL #{index + 1}
                      </span>
                    </div>

                    {/* Vertical Title & Accession Number */}
                    <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
                      <div className="rotate-90 whitespace-nowrap text-[10.5px] font-bold tracking-wider text-amber-300 font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
                        {copy.copyNumber}
                      </div>
                    </div>

                    {/* Bottom Spine Details with Status LED */}
                    <div className="flex flex-col items-center gap-1.5 pt-1 border-t border-white/20">
                      <div
                        className={`w-3 h-3 rounded-full border border-white/20 transition-all ${
                          isAvailable
                            ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                            : isReserved
                            ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                            : 'bg-rose-500 shadow-[0_0_10px_#f87171]'
                        }`}
                        title={`Status: ${copy.status}`}
                      ></div>
                      <span className="text-[8px] font-mono text-white/80 font-bold drop-shadow">
                        {copy.status.slice(0, 3)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Heavy Solid Wood Shelf Plank */}
          <div className="h-7 w-full bg-gradient-to-r from-[#422517] via-[#5c341f] to-[#3a1f13] border-t-2 border-[#8c522f] shadow-[0_12px_20px_rgba(0,0,0,0.8)] rounded-b-lg flex items-center justify-between px-6">
            <span className="wooden-timber-plank-text text-[9.5px] text-amber-100 font-mono tracking-widest uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              RACK LEVEL: SHELF #2
            </span>
            <span className="wooden-timber-plank-text text-[9.5px] text-amber-100 font-mono tracking-widest uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              DEPT. ECE &bull; FXEC
            </span>
          </div>
        </div>

        {/* Selected Copy Detailed Actions Panel */}
        {selectedCopy && (
          <div className="glass-panel-card p-6 rounded-3xl border border-stroke-glass mt-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-content-subtle">
                  Inspecting Accession Copy:
                </span>
                <span className="text-base font-extrabold text-aura-neon font-mono">
                  {selectedCopy.copyNumber}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedCopy.status === 'AVAILABLE'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : selectedCopy.status === 'RESERVED'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {selectedCopy.status}
                </span>
              </div>

              <p className="text-xs text-content-muted">
                Condition:{' '}
                <span className="text-white">
                  {selectedCopy.conditionNotes || 'Clean Library Physical Copy - Ready for circulation.'}
                </span>
              </p>

              <div className="text-[11px] text-content-subtle flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-aura-purple" />
                  Stack: {book.rackLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-aura-purple" />
                  Hold Window: 24 Hours upon approval
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0 w-full md:w-auto">
              {selectedCopy.status === 'AVAILABLE' ? (
                <button
                  onClick={() => handleReserveCopy(selectedCopy.id, selectedCopy.copyNumber)}
                  disabled={reserving}
                  className="w-full md:w-auto aura-gradient-btn px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:scale-[1.02] transition-transform"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  {reserving ? 'Reserving Copy...' : `Reserve Copy ${selectedCopy.copyNumber}`}
                </button>
              ) : selectedCopy.status === 'RESERVED' ? (
                <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 text-center font-medium">
                  This copy is currently on hold for another scholar.
                </div>
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-center font-medium">
                  This copy is currently issued out on loan.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Institutional Policy Guidelines */}
      <div className="glass-panel-card p-6 rounded-3xl border border-stroke-subtle space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-aura-purple" />
          Francis Xavier Engineering College - Library Circulation Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-content-muted pt-1">
          <div className="p-3 rounded-xl bg-surface-low border border-stroke-glass">
            <b className="text-white block mb-1">Borrowing Quota</b>
            Students can borrow 1 book per day. Faculty and staff can borrow up to 3 books per day.
          </div>
          <div className="p-3 rounded-xl bg-surface-low border border-stroke-glass">
            <b className="text-white block mb-1">Loan Duration & Return</b>
            Both Students and Staff must return books within 15 days. Books can be renewed before due date if no pending reservations exist.
          </div>
          <div className="p-3 rounded-xl bg-surface-low border border-stroke-glass">
            <b className="text-white block mb-1">Reservation Pickup</b>
            Approved reservations are held at the ECE Department Library Desk for 24 hours before automatic release.
          </div>
        </div>
      </div>
    </div>
  );
}
