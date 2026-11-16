import { z } from 'zod';

// ==========================================
// ROLES & ENUMS
// ==========================================
export type UserRole = 'ADMIN' | 'STAFF' | 'STUDENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type BookCopyStatus = 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'DAMAGED' | 'LOST';

export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export type TransactionStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export type NotificationType = 'RESERVATION' | 'DUE_REMINDER' | 'OVERDUE' | 'ANNOUNCEMENT' | 'GENERAL';

export type ReminderSchedule = '15D' | '7D' | '3D' | '1D' | 'DUE_DAY' | 'OVERDUE';

// ==========================================
// MODELS & INTERFACES
// ==========================================
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  rollNumber?: string | null;
  staffId?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  bookCount?: number;
}

export interface BookCopy {
  id: string;
  bookId: string;
  copyNumber: string; // e.g. ECE-DBMS-001
  status: BookCopyStatus;
  conditionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  currentBorrower?: {
    id: string;
    name: string;
    email: string;
    dueDate?: string;
  } | null;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher?: string | null;
  edition?: string | null;
  categoryId: string;
  category?: Category;
  coverImage?: string | null;
  description?: string | null;
  totalCopies: number;
  availableCopies: number;
  reservedCopies: number;
  borrowedCopies: number;
  rackLocation: string; // e.g. "Rack ECE-04, Shelf B"
  copies?: BookCopy[];
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  copyId: string;
  copy?: BookCopy & { book?: Book };
  userId: string;
  user?: UserProfile;
  status: ReservationStatus;
  requestDate: string;
  expiresAt: string;
  returnDueDate?: string;
  loanDurationDays?: number;
  rejectionReason?: string | null;
  approvedAt?: string | null;
}

export interface BorrowTransaction {
  id: string;
  copyId: string;
  copy?: BookCopy & { book?: Book };
  userId: string;
  user?: UserProfile;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: TransactionStatus;
  issuedBy: string;
  fine?: Fine | null;
}

export interface Fine {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  overdueDays: number;
  status: FineStatus;
  paidAt?: string | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
  targetRole?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  priority: 'NORMAL' | 'HIGH';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  details: string;
  ipAddress?: string | null;
  createdAt: string;
}

export interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  reservedCopies: number;
  borrowedCopies: number;
  overdueBooks: number;
  totalStudents: number;
  totalStaff: number;
  monthlyBorrowing: { month: string; borrows: number; returns: number }[];
  mostBorrowedBooks: { title: string; author: string; count: number; category: string }[];
  categoryDistribution: { name: string; count: number }[];
}

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================
export const createBookSchema = z.object({
  isbn: z.string().min(3, 'ISBN is required'),
  title: z.string().min(2, 'Title is required'),
  author: z.string().min(2, 'Author is required'),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  coverImage: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  totalCopies: z.number().int().min(1, 'Must add at least 1 copy').default(1),
  rackLocation: z.string().min(2, 'Rack location is required (e.g., ECE Rack 2, Shelf A)'),
  prefix: z.string().default('ECE')
});

export const updateBookSchema = createBookSchema.partial();

export const createCopySchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  copyNumber: z.string().min(2, 'Copy Number is required (e.g., ECE-VLSI-004)'),
  status: z.enum(['AVAILABLE', 'RESERVED', 'BORROWED', 'DAMAGED', 'LOST']).default('AVAILABLE'),
  conditionNotes: z.string().optional()
});

export const updateCopyStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'RESERVED', 'BORROWED', 'DAMAGED', 'LOST']),
  conditionNotes: z.string().optional()
});

export const reservationRequestSchema = z.object({
  copyId: z.string().min(1, 'Copy ID is required'),
  durationHours: z.number().int().min(1).max(72).default(24)
});

export const reservationActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'CANCEL']),
  rejectionReason: z.string().optional()
});

export const issueBookSchema = z.object({
  copyId: z.string().min(1, 'Copy ID is required'),
  userId: z.string().min(1, 'Borrower ID is required'),
  days: z.number().int().min(1).max(90).default(15)
});

export const returnBookSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  condition: z.enum(['GOOD', 'DAMAGED', 'LOST']).default('GOOD'),
  waiveFine: z.boolean().default(false)
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(5, 'Content is required'),
  priority: z.enum(['NORMAL', 'HIGH']).default('NORMAL')
});
