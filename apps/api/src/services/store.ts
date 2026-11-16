import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  Category, 
  Book, 
  BookCopy, 
  Reservation, 
  BorrowTransaction, 
  Fine, 
  NotificationItem, 
  Announcement, 
  ActivityLog,
  LibraryStats 
} from '@library/shared';

class LibraryStore {
  public profiles: UserProfile[] = [];
  public categories: Category[] = [];
  public books: Book[] = [];
  public copies: BookCopy[] = [];
  public reservations: Reservation[] = [];
  public transactions: BorrowTransaction[] = [];
  public fines: Fine[] = [];
  public notifications: NotificationItem[] = [];
  public announcements: Announcement[] = [];
  public activityLogs: ActivityLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Profiles
    this.profiles = [
      {
        id: 'usr-admin-1',
        email: 'admin.ece@francisxavier.ac.in',
        name: 'Dr. S. K. Rajan (HOD / Admin)',
        role: 'ADMIN',
        department: 'ECE',
        staffId: 'FX-ECE-STF-001',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-staff-1',
        email: 'revathi.ece@francisxavier.ac.in',
        name: 'Prof. M. Revathi (Associate Professor)',
        role: 'STAFF',
        department: 'ECE',
        staffId: 'FX-ECE-STF-014',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-student-1',
        email: 'santhosh.21ec104@francisxavier.ac.in',
        name: 'Santhosh Kumar K',
        role: 'STUDENT',
        department: 'ECE',
        rollNumber: '21EC104',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-student-2',
        email: 'karthik.22ec045@francisxavier.ac.in',
        name: 'Karthik Raja S',
        role: 'STUDENT',
        department: 'ECE',
        rollNumber: '22EC045',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: new Date('2024-03-05').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-student-3',
        email: 'anitha.23ec012@francisxavier.ac.in',
        name: 'Anitha Lakshmi M',
        role: 'STUDENT',
        department: 'ECE',
        rollNumber: '23EC012',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: new Date('2024-04-12').toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Load Complete Department Library Dataset (from Dept_Lib_DB1.pdf)
    const datasetPath = path.resolve(__dirname, '../data/dept_library_dataset.json');
    if (fs.existsSync(datasetPath)) {
      try {
        const raw = fs.readFileSync(datasetPath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.categories = parsed.categories || [];
        this.books = parsed.books || [];

        // Flatten all copies
        this.copies = [];
        this.books.forEach(b => {
          if (b.copies) {
            this.copies.push(...b.copies);
          }
        });

        console.log(`[Store] Successfully loaded official FXEC ECE Department Library dataset: ${this.books.length} titles, ${this.copies.length} physical copies across ${this.categories.length} categories.`);
      } catch (e) {
        console.error('[Store] Error loading dept_library_dataset.json:', e);
      }
    } else {
      console.warn('[Store] dept_library_dataset.json not found, using minimal fallback.');
    }

    // Default Reservations
    const sampleCopy1 = this.copies.find(c => c.status === 'AVAILABLE') || this.copies[0];
    const sampleCopy2 = this.copies[1] || this.copies[0];

    if (sampleCopy1) {
      this.reservations.push({
        id: 'res-1',
        copyId: sampleCopy1.id,
        userId: 'usr-student-1',
        user: this.profiles.find(p => p.id === 'usr-student-1'),
        status: 'PENDING',
        requestDate: new Date(Date.now() - 3600000 * 4).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 20).toISOString()
      });
    }

    if (sampleCopy2) {
      this.reservations.push({
        id: 'res-2',
        copyId: sampleCopy2.id,
        userId: 'usr-student-2',
        user: this.profiles.find(p => p.id === 'usr-student-2'),
        status: 'APPROVED',
        requestDate: new Date(Date.now() - 3600000 * 18).toISOString(),
        expiresAt: new Date(Date.now() + 3600000 * 6).toISOString(),
        approvedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      });
    }

    // Default Borrow Transactions
    const borrowedCopies = this.copies.filter(c => c.status === 'BORROWED');
    if (borrowedCopies.length > 0) {
      this.transactions.push({
        id: 'tx-1',
        copyId: borrowedCopies[0].id,
        userId: 'usr-student-1',
        user: this.profiles.find(p => p.id === 'usr-student-1'),
        issueDate: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
        dueDate: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        status: 'OVERDUE',
        issuedBy: 'usr-admin-1',
        fine: {
          id: 'fine-1',
          transactionId: 'tx-1',
          userId: 'usr-student-1',
          amount: 30,
          overdueDays: 3,
          status: 'UNPAID'
        }
      });
    }

    if (borrowedCopies.length > 1) {
      this.transactions.push({
        id: 'tx-2',
        copyId: borrowedCopies[1].id,
        userId: 'usr-staff-1',
        user: this.profiles.find(p => p.id === 'usr-staff-1'),
        issueDate: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        dueDate: new Date(Date.now() + 3600000 * 24 * 10).toISOString(),
        status: 'BORROWED',
        issuedBy: 'usr-admin-1'
      });
    }

    // Announcements
    this.announcements = [
      {
        id: 'ann-1',
        title: 'FXEC ECE Department Library Catalog Digitization Complete',
        content: 'All 650+ physical volumes and accession registers (ECESC series) are now catalogued and searchable in the department portal.',
        authorId: 'usr-admin-1',
        authorName: 'Dr. S. K. Rajan',
        priority: 'HIGH',
        createdAt: new Date().toISOString()
      },
      {
        id: 'ann-2',
        title: 'Semester Clearance & Book Return Schedule',
        content: 'All final year and third year ECE students are requested to clear outstanding borrowed copies by the 25th of this month to receive No Due certificates.',
        authorId: 'usr-admin-1',
        authorName: 'Dr. S. K. Rajan',
        priority: 'NORMAL',
        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
      }
    ];

    // Activity Logs
    this.activityLogs = [
      {
        id: 'log-1',
        userId: 'usr-admin-1',
        userName: 'Dr. S. K. Rajan (HOD / Admin)',
        action: 'CATALOG_SYNCED',
        details: 'Imported 653 official physical accession records from department registers.',
        createdAt: new Date().toISOString()
      }
    ];

    // Notifications
    this.notifications = [
      {
        id: 'notif-1',
        userId: 'usr-admin-1',
        title: 'Department Catalog Synchronized',
        message: '653 physical copies with official accession numbers (ECESC series) loaded.',
        type: 'GENERAL',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Refresh computed availability counters
  public syncBookCounters(bookId: string) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;
    const copies = this.copies.filter(c => c.bookId === bookId);
    book.totalCopies = copies.length;
    book.availableCopies = copies.filter(c => c.status === 'AVAILABLE').length;
    book.reservedCopies = copies.filter(c => c.status === 'RESERVED').length;
    book.borrowedCopies = copies.filter(c => c.status === 'BORROWED').length;
    book.copies = copies;
  }

  public getStats(): LibraryStats {
    const totalBooks = this.books.length;
    const totalCopies = this.copies.length;
    const availableCopies = this.copies.filter(c => c.status === 'AVAILABLE').length;
    const reservedCopies = this.copies.filter(c => c.status === 'RESERVED').length;
    const borrowedCopies = this.copies.filter(c => c.status === 'BORROWED' || c.status === 'DAMAGED').length;
    const overdueBooks = this.transactions.filter(t => t.status === 'OVERDUE').length;
    const totalStudents = this.profiles.filter(p => p.role === 'STUDENT').length;
    const totalStaff = this.profiles.filter(p => p.role === 'STAFF').length;

    const monthlyBorrowing = [
      { month: 'Jun', borrows: 42, returns: 38 },
      { month: 'Jul', borrows: 56, returns: 50 },
      { month: 'Aug', borrows: 78, returns: 65 },
      { month: 'Sep', borrows: 92, register: 84, returns: 84 },
      { month: 'Oct', borrows: 110, returns: 96 },
      { month: 'Nov', borrows: 124, returns: 108 },
    ];

    const mostBorrowedBooks = this.books.slice(0, 5).map((b, i) => ({
      title: b.title,
      author: b.author,
      count: 25 - i * 3,
      category: b.category?.name || 'ECE Core'
    }));

    const categoryDistribution = this.categories.map(c => ({
      name: c.name,
      count: this.books.filter(b => b.categoryId === c.id).reduce((acc, curr) => acc + curr.totalCopies, 0)
    }));

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      reservedCopies,
      borrowedCopies,
      overdueBooks,
      totalStudents,
      totalStaff,
      monthlyBorrowing,
      mostBorrowedBooks,
      categoryDistribution
    };
  }
}

export const dbStore = new LibraryStore();
