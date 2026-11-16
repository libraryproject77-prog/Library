-- ========================================================
-- FXEC ECE LIBRARY - SUPABASE QUICKSTART SCHEMA & POLICIES
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cjwykoevlivvilciuctl/sql
-- ========================================================

-- 1. Create Enums safely
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'STUDENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "BookCopyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'BORROWED', 'DAMAGED', 'LOST');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Create Profiles Table (Members)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role "Role" NOT NULL DEFAULT 'STUDENT',
    department TEXT NOT NULL DEFAULT 'ECE',
    "rollNumber" TEXT,
    "staffId" TEXT,
    "avatarUrl" TEXT DEFAULT '/default-avatar.jpg',
    status "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY,
    isbn TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publisher TEXT,
    edition TEXT,
    "coverImage" TEXT,
    description TEXT,
    "rackLocation" TEXT,
    "categoryId" TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Book Copies Table
CREATE TABLE IF NOT EXISTS public.book_copies (
    id TEXT PRIMARY KEY,
    "bookId" TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    "copyNumber" TEXT NOT NULL UNIQUE,
    status "BookCopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "conditionNotes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Reservations Table
CREATE TABLE IF NOT EXISTS public.reservations (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    "bookCopyId" TEXT NOT NULL REFERENCES public.book_copies(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create Borrow Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    "bookCopyId" TEXT NOT NULL REFERENCES public.book_copies(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'BORROWED',
    "borrowedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "dueDate" TIMESTAMPTZ NOT NULL,
    "returnedAt" TIMESTAMPTZ,
    "fineAmount" NUMERIC DEFAULT 0,
    "fineWaived" BOOLEAN DEFAULT false,
    condition TEXT DEFAULT 'GOOD',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Disable RLS on all tables so Add, Update, and Delete work seamlessly from both Web & API
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_copies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- 10. Grant Full Permissions to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 11. Seed ECE Categories
INSERT INTO public.categories (id, name, code, description)
VALUES 
  ('cat-circuits', 'Circuits, Devices & Linear ICs', 'CIRC', 'Department library standard references and textbooks for Circuits, Devices & Linear ICs.'),
  ('cat-mgmt', 'Management, Humanities & Sciences', 'MGMT', 'Department library standard references and textbooks for Management, Humanities & Sciences.'),
  ('cat-ss', 'Signals, Systems & Control Engineering', 'CTRL', 'Department library standard references and textbooks for Signals, Systems & Control Engineering.'),
  ('cat-mpmc', 'Microprocessors, Architecture & Computing', 'COMP', 'Department library standard references and textbooks for Microprocessors, Architecture & Computing.'),
  ('cat-comm', 'Communication Networks, RF & Optical', 'COMM', 'Department library standard references and textbooks for Communication Networks, RF & Optical.'),
  ('cat-dsp', 'Digital Signal & Image Processing', 'DSP', 'Department library standard references and textbooks for Digital Signal & Image Processing.'),
  ('cat-emft', 'Electromagnetics & Transmission Lines', 'EMFT', 'Department library standard references and textbooks for Electromagnetics & Transmission Lines.'),
  ('cat-vlsi', 'VLSI Design & Embedded Systems', 'VLSI', 'Department library standard references and textbooks for VLSI Design & Embedded Systems.')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 12. Seed Profiles with In-built Silhouette Avatar
INSERT INTO public.profiles (id, email, name, role, department, "rollNumber", "staffId", "avatarUrl", status)
VALUES 
  ('usr-admin-1', 'admin.ece@francisxavier.ac.in', 'Dr. S. K. Rajan (HOD)', 'ADMIN', 'ECE', NULL, 'FX-ECE-STF-001', '/default-avatar.jpg', 'ACTIVE'),
  ('usr-staff-1', 'revathi@francisxavier.ac.in', 'Prof. M. Revathi', 'STAFF', 'ECE', NULL, 'FX-ECE-STF-014', '/default-avatar.jpg', 'ACTIVE'),
  ('usr-student-1', 'madasamym.ug.25.ec@francisxavier.ac.in', 'Madasamy M', 'STUDENT', 'ECE', '25EC001', NULL, '/default-avatar.jpg', 'ACTIVE'),
  ('usr-student-2', 'kumar.ug.25.ec@francisxavier.ac.in', 'Kumar S', 'STUDENT', 'ECE', '25EC045', NULL, '/default-avatar.jpg', 'ACTIVE')
ON CONFLICT (email) DO UPDATE SET
  "avatarUrl" = '/default-avatar.jpg';

-- 13. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
