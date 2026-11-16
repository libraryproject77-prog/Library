import { dbStore } from './store';
import { Book, BookCopy } from '@library/shared';

export class BookService {
  public getAllBooks(query?: { search?: string; categoryId?: string; availability?: string }) {
    let result = [...dbStore.books];

    if (query?.categoryId && query.categoryId !== 'all') {
      result = result.filter(b => b.categoryId === query.categoryId);
    }

    if (query?.availability) {
      if (query.availability === 'available') {
        result = result.filter(b => b.availableCopies > 0);
      } else if (query.availability === 'low') {
        result = result.filter(b => b.availableCopies > 0 && b.availableCopies <= 2);
      } else if (query.availability === 'out') {
        result = result.filter(b => b.availableCopies === 0);
      }
    }

    if (query?.search && query.search.trim() !== '') {
      const term = query.search.toLowerCase().trim();
      result = result.filter(b => 
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        b.isbn.toLowerCase().includes(term) ||
        b.rackLocation.toLowerCase().includes(term) ||
        b.copies?.some(c => c.copyNumber.toLowerCase().includes(term))
      );
    }

    return result;
  }

  public getBookById(id: string) {
    const book = dbStore.books.find(b => b.id === id);
    if (!book) return null;
    const copies = dbStore.copies.filter(c => c.bookId === id);
    return {
      ...book,
      copies
    };
  }

  public createBook(data: {
    isbn: string;
    title: string;
    author: string;
    publisher?: string;
    edition?: string;
    categoryId: string;
    coverImage?: string;
    description?: string;
    totalCopies: number;
    rackLocation: string;
    prefix: string;
  }, adminId: string, adminName: string) {
    const existing = dbStore.books.find(b => b.isbn === data.isbn);
    if (existing) {
      throw new Error(`A book with ISBN ${data.isbn} already exists`);
    }

    const bookId = `bk-${Date.now()}`;
    const copies: BookCopy[] = [];

    for (let i = 1; i <= data.totalCopies; i++) {
      const copyNumStr = i.toString().padStart(3, '0');
      const copyNumber = `${data.prefix.toUpperCase()}-${copyNumStr}`;
      const copyId = `cp-${bookId}-${i}`;

      const newCopy: BookCopy = {
        id: copyId,
        bookId,
        copyNumber,
        status: 'AVAILABLE',
        conditionNotes: 'New copy added to inventory',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      copies.push(newCopy);
      dbStore.copies.push(newCopy);
    }

    const category = dbStore.categories.find(c => c.id === data.categoryId);

    const newBook: Book = {
      id: bookId,
      isbn: data.isbn,
      title: data.title,
      author: data.author,
      publisher: data.publisher,
      edition: data.edition,
      categoryId: data.categoryId,
      category,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      description: data.description,
      totalCopies: data.totalCopies,
      availableCopies: data.totalCopies,
      reservedCopies: 0,
      borrowedCopies: 0,
      rackLocation: data.rackLocation,
      copies,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbStore.books.unshift(newBook);

    // Activity log
    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: adminId,
      userName: adminName,
      action: 'BOOK_CREATED',
      details: `Added new book "${newBook.title}" with ${newBook.totalCopies} copies.`,
      createdAt: new Date().toISOString()
    });

    return newBook;
  }

  public updateBook(id: string, data: Partial<Book>, adminId: string, adminName: string) {
    const bookIndex = dbStore.books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
      throw new Error('Book not found');
    }

    const book = dbStore.books[bookIndex];
    const updated = {
      ...book,
      ...data,
      updatedAt: new Date().toISOString()
    };

    if (data.categoryId) {
      updated.category = dbStore.categories.find(c => c.id === data.categoryId);
    }

    dbStore.books[bookIndex] = updated;

    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: adminId,
      userName: adminName,
      action: 'BOOK_UPDATED',
      details: `Updated details for book "${updated.title}"`,
      createdAt: new Date().toISOString()
    });

    return updated;
  }

  public deleteBook(id: string, adminId: string, adminName: string) {
    const bookIndex = dbStore.books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
      throw new Error('Book not found');
    }

    const book = dbStore.books[bookIndex];
    // Check if copies are borrowed
    const borrowed = dbStore.copies.filter(c => c.bookId === id && c.status === 'BORROWED');
    if (borrowed.length > 0) {
      throw new Error(`Cannot delete book: ${borrowed.length} copies are currently borrowed.`);
    }

    // Remove copies
    dbStore.copies = dbStore.copies.filter(c => c.bookId !== id);
    dbStore.books.splice(bookIndex, 1);

    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: adminId,
      userName: adminName,
      action: 'BOOK_DELETED',
      details: `Deleted book "${book.title}" (ISBN: ${book.isbn})`,
      createdAt: new Date().toISOString()
    });

    return { success: true };
  }

  public addCopy(bookId: string, copyNumber: string, notes?: string) {
    const book = dbStore.books.find(b => b.id === bookId);
    if (!book) throw new Error('Book not found');

    const existingCopy = dbStore.copies.find(c => c.copyNumber.toUpperCase() === copyNumber.toUpperCase());
    if (existingCopy) throw new Error(`Copy ID "${copyNumber}" already exists`);

    const newCopy: BookCopy = {
      id: `cp-${bookId}-${Date.now()}`,
      bookId,
      copyNumber: copyNumber.toUpperCase(),
      status: 'AVAILABLE',
      conditionNotes: notes || 'New copy added',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbStore.copies.push(newCopy);
    dbStore.syncBookCounters(bookId);

    return newCopy;
  }

  public updateCopyStatus(copyId: string, status: BookCopy['status'], notes?: string) {
    const copy = dbStore.copies.find(c => c.id === copyId);
    if (!copy) throw new Error('Copy not found');

    copy.status = status;
    if (notes) copy.conditionNotes = notes;
    copy.updatedAt = new Date().toISOString();

    dbStore.syncBookCounters(copy.bookId);

    return copy;
  }
}

export const bookService = new BookService();
