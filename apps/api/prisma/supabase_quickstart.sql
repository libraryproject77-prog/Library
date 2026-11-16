-- ========================================================
-- FXEC ECE LIBRARY - SUPABASE QUICKSTART SCHEMA & POLICIES
-- Copy and Run this in Supabase SQL Editor
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

-- 2. Create Profiles Table
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

-- 6. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_copies ENABLE ROW LEVEL SECURITY;

-- Allow read & write for portal operations
DO $$ BEGIN
    CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read books" ON public.books FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read book_copies" ON public.book_copies FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 7. Grant API Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 8. Seed Default Profiles
INSERT INTO public.profiles (id, email, name, role, department, "rollNumber", "staffId", "avatarUrl", status)
VALUES 
  ('usr-admin-1', 'admin.ece@francisxavier.ac.in', 'Dr. S. K. Rajan (HOD)', 'ADMIN', 'ECE', NULL, 'FX-ECE-STF-001', '/default-avatar.jpg', 'ACTIVE'),
  ('usr-staff-1', 'revathi@francisxavier.ac.in', 'Prof. M. Revathi', 'STAFF', 'ECE', NULL, 'FX-ECE-STF-014', '/default-avatar.jpg', 'ACTIVE'),
  ('usr-student-1', 'madasamym.ug.25.ec@francisxavier.ac.in', 'Madasamy M', 'STUDENT', 'ECE', '25EC001', NULL, '/default-avatar.jpg', 'ACTIVE'),
  ('usr-student-2', 'kumar.ug.25.ec@francisxavier.ac.in', 'Kumar S', 'STUDENT', 'ECE', '25EC045', NULL, '/default-avatar.jpg', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- 9. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
