-- ========================================================
-- FXEC ECE LIBRARY - SUPABASE DATABASE SCHEMA (STEP 1)
-- Run this script FIRST in Supabase SQL Editor to create all 11 tables
-- ========================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'STUDENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BookCopyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'BORROWED', 'DAMAGED', 'LOST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM ('BORROWED', 'RETURNED', 'OVERDUE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "FineStatus" AS ENUM ('UNPAID', 'PAID', 'WAIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('RESERVATION', 'DUE_REMINDER', 'OVERDUE', 'ANNOUNCEMENT', 'GENERAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ScheduleType" AS ENUM ('REMINDER_15D', 'REMINDER_7D', 'REMINDER_3D', 'REMINDER_1D', 'DUE_DAY', 'OVERDUE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "department" TEXT NOT NULL DEFAULT 'ECE',
    "rollNumber" TEXT,
    "staffId" TEXT,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "books" (
    "id" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "edition" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "rackLocation" TEXT NOT NULL DEFAULT 'Rack ECE-01, Shelf A',
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "book_copies" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "copyNumber" TEXT NOT NULL,
    "status" "BookCopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "conditionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "book_copies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "reservations" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "borrow_transactions" (
    "id" TEXT NOT NULL,
    "copyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "status" "TransactionStatus" NOT NULL DEFAULT 'BORROWED',
    "issuedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "borrow_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "fines" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "overdueDays" INTEGER NOT NULL DEFAULT 0,
    "status" "FineStatus" NOT NULL DEFAULT 'UNPAID',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "fines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "scheduleType" "ScheduleType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- 3. Unique Indexes & Constraints
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_email_key" ON "profiles"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_rollNumber_key" ON "profiles"("rollNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_staffId_key" ON "profiles"("staffId");
CREATE INDEX IF NOT EXISTS "profiles_role_idx" ON "profiles"("role");
CREATE INDEX IF NOT EXISTS "profiles_department_idx" ON "profiles"("department");

CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_code_key" ON "categories"("code");

CREATE UNIQUE INDEX IF NOT EXISTS "books_isbn_key" ON "books"("isbn");
CREATE INDEX IF NOT EXISTS "books_title_idx" ON "books"("title");
CREATE INDEX IF NOT EXISTS "books_author_idx" ON "books"("author");
CREATE INDEX IF NOT EXISTS "books_isbn_idx" ON "books"("isbn");
CREATE INDEX IF NOT EXISTS "books_categoryId_idx" ON "books"("categoryId");

CREATE UNIQUE INDEX IF NOT EXISTS "book_copies_copyNumber_key" ON "book_copies"("copyNumber");
CREATE INDEX IF NOT EXISTS "book_copies_bookId_idx" ON "book_copies"("bookId");
CREATE INDEX IF NOT EXISTS "book_copies_status_idx" ON "book_copies"("status");
CREATE INDEX IF NOT EXISTS "book_copies_copyNumber_idx" ON "book_copies"("copyNumber");

CREATE INDEX IF NOT EXISTS "reservations_userId_idx" ON "reservations"("userId");
CREATE INDEX IF NOT EXISTS "reservations_copyId_idx" ON "reservations"("copyId");
CREATE INDEX IF NOT EXISTS "reservations_status_idx" ON "reservations"("status");

CREATE INDEX IF NOT EXISTS "borrow_transactions_userId_idx" ON "borrow_transactions"("userId");
CREATE INDEX IF NOT EXISTS "borrow_transactions_copyId_idx" ON "borrow_transactions"("copyId");
CREATE INDEX IF NOT EXISTS "borrow_transactions_status_idx" ON "borrow_transactions"("status");
CREATE INDEX IF NOT EXISTS "borrow_transactions_dueDate_idx" ON "borrow_transactions"("dueDate");

CREATE UNIQUE INDEX IF NOT EXISTS "fines_transactionId_key" ON "fines"("transactionId");
CREATE INDEX IF NOT EXISTS "fines_userId_idx" ON "fines"("userId");
CREATE INDEX IF NOT EXISTS "fines_status_idx" ON "fines"("status");

CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "notification_logs_userId_idx" ON "notification_logs"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "notification_logs_transactionId_scheduleType_key" ON "notification_logs"("transactionId", "scheduleType");

CREATE INDEX IF NOT EXISTS "activity_logs_userId_idx" ON "activity_logs"("userId");
CREATE INDEX IF NOT EXISTS "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- 4. Foreign Keys
DO $$ BEGIN
    ALTER TABLE "books" ADD CONSTRAINT "books_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "book_copies" ADD CONSTRAINT "book_copies_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "reservations" ADD CONSTRAINT "reservations_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "book_copies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "reservations" ADD CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "borrow_transactions" ADD CONSTRAINT "borrow_transactions_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "book_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "borrow_transactions" ADD CONSTRAINT "borrow_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "fines" ADD CONSTRAINT "fines_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "borrow_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "fines" ADD CONSTRAINT "fines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "borrow_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
