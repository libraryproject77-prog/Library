'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [copiesModalOpen, setCopiesModalOpen] = useState(false);
  const [selectedBookForCopies, setSelectedBookForCopies] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    edition: '1st Edition',
    categoryId: '',
    rackLocation: 'Rack ECE-01, Shelf A',
    totalCopies: 5,
    prefix: 'ECE-BOOK',
    coverImage: '',
    description: ''
  });

  const [newCopyNumber, setNewCopyNumber] = useState('');
  const [newCopyNotes, setNewCopyNotes] = useState('');

  useEffect(() => {
    loadBooks();
  }, [selectedCategory, selectedAvailability]);

  // Debounced live search
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
      if (res?.categories) {
        setCategories(res.categories);
        if (!formData.categoryId && res.categories.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: res.categories[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBook({
        ...formData,
        totalCopies: Number(formData.totalCopies)
      });
      setAddModalOpen(false);
      // Reset form
      setFormData({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        edition: '1st Edition',
        categoryId: categories[0]?.id || '',
        rackLocation: 'Rack ECE-01, Shelf A',
        totalCopies: 5,
        prefix: 'ECE-BOOK',
        coverImage: '',
        description: ''
      });
      loadBooks();
    } catch (err: any) {
      alert(err.message || 'Error creating book title');
    }
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will delete all its registered copies.`)) {
      try {
        await api.deleteBook(bookId);
        loadBooks();
      } catch (err: any) {
        alert(err.message || 'Error deleting book');
      }
    }
  };

  const openCopiesManager = (book: any) => {
    setSelectedBookForCopies(book);
    setNewCopyNumber(`${book.isbn ? book.isbn.slice(-4) : 'ECE'}-${(book.copies?.length || 0) + 1}`);
    setCopiesModalOpen(true);
  };

  const handleUpdateCopyStatus = async (copyId: string, newStatus: string) => {
    try {
      await api.updateCopyStatus(copyId, { status: newStatus });
      // Reload
      const updatedBook = await api.getBookById(selectedBookForCopies.id);
      setSelectedBookForCopies(updatedBook.book);
      loadBooks();
    } catch (err: any) {
      alert(err.message || 'Failed to update copy status');
    }
  };

  const handleAddIndividualCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForCopies || !newCopyNumber) return;
    try {
      await api.addCopy({
        bookId: selectedBookForCopies.id,
        copyNumber: newCopyNumber,
        conditionNotes: newCopyNotes
      });
      const updatedBook = await api.getBookById(selectedBookForCopies.id);
      setSelectedBookForCopies(updatedBook.book);
      setNewCopyNotes('');
      loadBooks();
    } catch (err: any) {
      alert(err.message || 'Failed to add copy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-aura-neon" />
            Book Catalog & Copy Management
          </h1>
          <p className="text-xs md:text-sm text-content-muted mt-1">
            Maintain ECE library titles, allocate unique physical Copy IDs, and inspect availability.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="aura-gradient-btn px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Book Title
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel-card p-4 rounded-2xl border border-stroke-subtle flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Debounced live search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-content-subtle absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Live search by Title, Author, ISBN, or Copy ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-white placeholder:text-content-subtle focus:outline-none focus:border-aura-purple"
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content-muted focus:outline-none focus:border-aura-purple cursor-pointer"
          >
            <option value="all">All ECE Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Availability Dropdown */}
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-xs text-content-muted focus:outline-none focus:border-aura-purple cursor-pointer"
          >
            <option value="all">All Copies Status</option>
            <option value="available">In Stock (Available &gt; 0)</option>
            <option value="low">Low Stock (&le; 2 copies)</option>
            <option value="out">All Borrowed (0 Available)</option>
          </select>
        </div>
      </div>

      {/* Book Catalog Cards / Table */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel-card p-12 rounded-2xl text-center text-content-muted text-xs">
            Loading book catalog...
          </div>
        ) : books.length === 0 ? (
          <div className="glass-panel-card p-12 rounded-2xl text-center text-content-muted text-xs">
            No books found matching your search.
          </div>
        ) : (
          books.map((book) => {
            const hasAvailable = book.availableCopies > 0;
            return (
              <div
                key={book.id}
                className="glass-panel-card p-5 rounded-2xl border border-stroke-subtle hover:border-aura-purple/40 transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                {/* Book Details */}
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  <div className="w-16 h-22 rounded-xl overflow-hidden bg-surface-high shrink-0 border border-stroke-glass shadow-md">
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80'}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-aura-neon bg-aura-purple/20 px-2 py-0.5 rounded">
                        {book.category?.code || 'ECE'}
                      </span>
                      <span className="text-[11px] text-content-subtle font-mono">
                        ISBN: {book.isbn}
                      </span>
                      <span className="text-[11px] text-content-subtle font-medium">
                        &bull; {book.rackLocation}
                      </span>
                    </div>

                    <h2 className="text-sm md:text-base font-bold text-white leading-snug">
                      {book.title}
                    </h2>
                    <p className="text-xs text-content-muted mt-0.5">
                      By <span className="text-content">{book.author}</span> &bull; {book.edition || 'Standard Edition'}
                    </p>

                    {/* Copy Counters Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-surface-low border border-stroke-glass text-content-muted">
                        Total: <b className="text-white">{book.totalCopies}</b>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border ${
                        hasAvailable 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        Available: <b>{book.availableCopies}</b>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border-amber-500/30 text-aura-amber">
                        Reserved: <b>{book.reservedCopies}</b>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border-blue-500/30 text-blue-400">
                        Borrowed: <b>{book.borrowedCopies}</b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => openCopiesManager(book)}
                    className="px-3 py-2 rounded-xl bg-surface-low hover:bg-surface-high border border-stroke-glass text-xs font-semibold text-aura-neon flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Manage {book.copies?.length || book.totalCopies} Copies
                  </button>

                  <button
                    onClick={() => handleDeleteBook(book.id, book.title)}
                    title="Delete Title"
                    className="p-2 rounded-xl bg-surface-low hover:bg-aura-errorBg/40 border border-stroke-glass text-content-subtle hover:text-aura-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Add New Book Title */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-glass w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stroke-subtle mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Add New Book Title & Copies</h2>
                <p className="text-xs text-content-muted">Register standard ECE textbook and auto-generate unique physical Copy IDs.</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-high text-content-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. CMOS VLSI Design"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Author(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Neil H. E. Weste, David Harris"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    ISBN Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-0131422797"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs focus:outline-none focus:border-aura-purple cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Publisher & Edition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      placeholder="Pearson"
                      className="w-full px-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs"
                    />
                    <input
                      type="text"
                      value={formData.edition}
                      onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                      placeholder="4th Edition"
                      className="w-full px-3 py-2 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Physical Rack Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rackLocation}
                    onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                    placeholder="Rack ECE-01, Shelf A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Number of Physical Copies to Add *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-muted mb-1.5">
                    Copy ID Prefix (e.g. ECE-VLSI)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                    placeholder="ECE-VLSI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs font-mono uppercase"
                  />
                  <p className="text-[10px] text-content-subtle mt-1">
                    Will auto-generate: {formData.prefix}-001 to {formData.prefix}-{String(formData.totalCopies).padStart(3, '0')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  Book Description / Synopsis
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive coverage of topics relevant to the ECE curriculum..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-low border border-stroke-glass text-white text-xs"
                />
              </div>

              <div className="pt-4 border-t border-stroke-subtle flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-low text-xs text-content-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aura-gradient-btn px-5 py-2 rounded-xl text-xs font-semibold text-white"
                >
                  Create Title & Generate Copies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Individual Physical Copies Manager */}
      {copiesModalOpen && selectedBookForCopies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass-panel-card p-6 md:p-8 rounded-3xl border border-stroke-glass w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stroke-subtle mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-aura-purple/20 text-aura-neon px-2 py-0.5 rounded font-bold uppercase">
                    {selectedBookForCopies.category?.code || 'ECE'}
                  </span>
                  <span className="text-xs text-content-subtle font-mono">
                    {selectedBookForCopies.rackLocation}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  Physical Copies for "{selectedBookForCopies.title}"
                </h2>
              </div>
              <button
                onClick={() => setCopiesModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface-high text-content-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Copies List */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Tracked Physical Copies ({selectedBookForCopies.copies?.length || 0})
              </h3>
              <div className="divide-y divide-stroke-subtle border border-stroke-subtle rounded-2xl overflow-hidden bg-surface-low">
                {selectedBookForCopies.copies?.map((copy: any) => {
                  let badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                  if (copy.status === 'RESERVED') badgeClass = 'bg-amber-500/20 text-aura-amber border-amber-500/30';
                  if (copy.status === 'BORROWED') badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                  if (copy.status === 'DAMAGED' || copy.status === 'LOST') badgeClass = 'bg-rose-500/20 text-rose-400 border-rose-500/30';

                  return (
                    <div
                      key={copy.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-surface-high/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-mono font-bold text-white">
                          <Copy className="w-3.5 h-3.5 text-aura-neon" />
                          <span>{copy.copyNumber}</span>
                          <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full border ${badgeClass}`}>
                            {copy.status}
                          </span>
                        </div>
                        {copy.conditionNotes && (
                          <p className="text-[11px] text-content-subtle mt-0.5">{copy.conditionNotes}</p>
                        )}
                      </div>

                      {/* Quick Status Modifier */}
                      <div className="flex items-center gap-2">
                        <select
                          value={copy.status}
                          onChange={(e) => handleUpdateCopyStatus(copy.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-surface-card border border-stroke-glass text-xs text-white focus:outline-none focus:border-aura-purple cursor-pointer"
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="RESERVED">RESERVED</option>
                          <option value="BORROWED">BORROWED</option>
                          <option value="DAMAGED">DAMAGED</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Extra Copy Form */}
            <form onSubmit={handleAddIndividualCopy} className="p-4 rounded-2xl bg-surface-low border border-stroke-glass space-y-3">
              <h4 className="text-xs font-bold text-white">Add Extra Copy to this Title</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-content-muted mb-1">Unique Copy ID</label>
                  <input
                    type="text"
                    required
                    value={newCopyNumber}
                    onChange={(e) => setNewCopyNumber(e.target.value)}
                    placeholder="e.g. ECE-VLSI-007"
                    className="w-full px-3 py-2 rounded-xl bg-surface-card border border-stroke-glass text-white text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-content-muted mb-1">Condition Notes</label>
                  <input
                    type="text"
                    value={newCopyNotes}
                    onChange={(e) => setNewCopyNotes(e.target.value)}
                    placeholder="e.g. Mint condition, new procurement"
                    className="w-full px-3 py-2 rounded-xl bg-surface-card border border-stroke-glass text-white text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="aura-gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
