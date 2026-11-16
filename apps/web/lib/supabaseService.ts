import { createClient, isSupabaseConfigured } from '@/utils/supabase/client';
import defaultCatalog from '@/data/dept_library_dataset.json';

export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  department?: string;
  rollNumber?: string;
  staffId?: string;
  avatarUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

class SupabaseService {
  public isAvailable(): boolean {
    return isSupabaseConfigured();
  }

  public getClient() {
    return createClient();
  }

  // -------------------------------------------------------------
  // AUTHENTICATION & MEMBERS (PROFILES)
  // -------------------------------------------------------------

  /**
   * Register a user with Supabase Auth and insert profile into 'profiles' table
   */
  public async registerUser(payload: {
    email: string;
    password?: string;
    name: string;
    role: 'STUDENT' | 'STAFF' | 'ADMIN';
    department?: string;
    rollNumber?: string;
    staffId?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      let userId = `usr-${Date.now()}`;
      const fallbackAvatar = '/default-avatar.jpg';

      if (payload.password) {
        // 1. Supabase Auth Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          options: {
            data: {
              full_name: payload.name,
              role: payload.role,
              department: payload.department || 'ECE',
              roll_number: payload.rollNumber,
              staff_id: payload.staffId,
              avatar_url: fallbackAvatar,
            },
          },
        });

        if (!authError && authData?.user?.id) {
          userId = authData.user.id;
        }
      }

      // 2. Direct upsert into 'profiles' table
      const profileRecord = {
        id: userId,
        email: payload.email.trim().toLowerCase(),
        name: payload.name,
        role: payload.role,
        department: payload.department || 'ECE',
        rollNumber: payload.rollNumber || null,
        staffId: payload.staffId || null,
        avatarUrl: fallbackAvatar,
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileRecord, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        console.warn('[Supabase] profiles table upsert warning:', error.message);
      }

      return {
        success: true,
        user: data || profileRecord,
      };
    } catch (err: any) {
      console.error('[Supabase registerUser error]:', err);
      return { success: false, error: err.message || 'Supabase registration failed.' };
    }
  }

  /**
   * Log in with Email and Password via Supabase Auth
   */
  public async loginUser(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: any; session?: any; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password.trim(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const user = data.user;
      const metadata = user.user_metadata || {};

      // Also fetch from profiles table if exists
      let profileRow: any = null;
      try {
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        profileRow = pData;
      } catch (e) {}

      const profile: SupabaseUserProfile = {
        id: profileRow?.id || user.id,
        email: profileRow?.email || user.email || cleanEmail,
        name: profileRow?.name || metadata.full_name || metadata.name || cleanEmail.split('@')[0],
        role: profileRow?.role || metadata.role || (cleanEmail.includes('admin') ? 'ADMIN' : (cleanEmail.includes('.ug.') ? 'STUDENT' : 'STAFF')),
        department: profileRow?.department || metadata.department || 'ECE',
        rollNumber: profileRow?.rollNumber || metadata.roll_number || metadata.rollNumber,
        staffId: profileRow?.staffId || metadata.staff_id || metadata.staffId,
        avatarUrl: '/default-avatar.jpg',
      };

      return {
        success: true,
        user: profile,
        session: data.session,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Supabase login failed.' };
    }
  }

  /**
   * Initiate Google OAuth through Supabase
   */
  public async signInWithGoogle(options?: {
    redirectTo?: string;
    loginHint?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = options?.redirectTo || `${origin}/portal/dashboard`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            hd: 'francisxavier.ac.in',
            access_type: 'offline',
            prompt: 'consent',
            ...(options?.loginHint ? { login_hint: options.loginHint } : {}),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Supabase Google OAuth failed.' };
    }
  }

  /**
   * Sign out from Supabase
   */
  public async signOut(): Promise<void> {
    const supabase = this.getClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
  }

  /**
   * Fetch all members from profiles table
   */
  public async getMembers(params?: { role?: string; search?: string }): Promise<any[]> {
    const supabase = this.getClient();
    if (!supabase) return [];

    try {
      let query = supabase.from('profiles').select('*').order('name', { ascending: true });
      if (params?.role && params.role !== 'all') {
        query = query.eq('role', params.role.toUpperCase());
      }
      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,rollNumber.ilike.%${params.search}%`);
      }
      const { data, error } = await query;
      if (error) {
        console.warn('[Supabase getMembers error]:', error.message);
        return [];
      }
      return (data || []).map((m: any) => ({
        ...m,
        avatarUrl: '/default-avatar.jpg',
      }));
    } catch (err) {
      console.warn('[Supabase getMembers failed]:', err);
      return [];
    }
  }

  public async getMemberById(id: string): Promise<any | null> {
    const supabase = this.getClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      return { ...data, avatarUrl: '/default-avatar.jpg' };
    } catch (err) {
      return null;
    }
  }

  public async toggleMemberStatus(id: string, newStatus?: string): Promise<{ success: boolean; member?: any }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false };

    try {
      let statusToSet = newStatus;
      if (!statusToSet) {
        const current = await this.getMemberById(id);
        statusToSet = current?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ status: statusToSet, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, member: data };
    } catch (err: any) {
      console.warn('[Supabase toggleMemberStatus error]:', err.message);
      return { success: false };
    }
  }

  public async deleteMember(id: string): Promise<{ success: boolean }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false };

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('[Supabase deleteMember error]:', err.message);
      return { success: false };
    }
  }

  // -------------------------------------------------------------
  // BOOKS & COPIES (ADD, UPDATE, DELETE, RETRIEVE)
  // -------------------------------------------------------------

  /**
   * Fetch all books with copies and categories from Supabase
   * Seamlessly falls back to the complete 581 department library books if Supabase is initializing.
   */
  public async getBooks(params?: { search?: string; categoryId?: string; availability?: string }): Promise<any[]> {
    const supabase = this.getClient();

    if (supabase) {
      try {
        let query = supabase
          .from('books')
          .select('*, copies:book_copies(*), category:categories(*)')
          .order('createdAt', { ascending: false });

        if (params?.categoryId && params.categoryId !== 'all') {
          query = query.eq('categoryId', params.categoryId);
        }
        if (params?.search) {
          query = query.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%,isbn.ilike.%${params.search}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          // Compute copy availability stats for frontend
          return data.map((b: any) => {
            const copies = b.copies || [];
            const availableCopies = copies.filter((c: any) => c.status === 'AVAILABLE').length;
            const reservedCopies = copies.filter((c: any) => c.status === 'RESERVED').length;
            const borrowedCopies = copies.filter((c: any) => c.status === 'BORROWED').length;

            return {
              ...b,
              totalCopies: copies.length,
              availableCopies,
              reservedCopies,
              borrowedCopies,
              copies,
            };
          });
        }
      } catch (err) {
        console.warn('[Supabase getBooks failed]:', err);
      }
    }

    // Comprehensive Fallback: 581 Official ECE Department Library volumes
    let datasetBooks = (defaultCatalog.books as any[]) || [];

    if (params?.categoryId && params.categoryId !== 'all') {
      datasetBooks = datasetBooks.filter(b => b.categoryId === params.categoryId);
    }
    if (params?.search && params.search.trim() !== '') {
      const s = params.search.toLowerCase().trim();
      datasetBooks = datasetBooks.filter(b =>
        b.title?.toLowerCase().includes(s) ||
        b.author?.toLowerCase().includes(s) ||
        b.isbn?.toLowerCase().includes(s) ||
        b.rackLocation?.toLowerCase().includes(s) ||
        b.copies?.some((c: any) => c.copyNumber?.toLowerCase().includes(s))
      );
    }
    if (params?.availability && params.availability !== 'all') {
      if (params.availability === 'available') {
        datasetBooks = datasetBooks.filter(b => b.availableCopies > 0);
      } else if (params.availability === 'low') {
        datasetBooks = datasetBooks.filter(b => b.availableCopies > 0 && b.availableCopies <= 2);
      } else if (params.availability === 'out') {
        datasetBooks = datasetBooks.filter(b => b.availableCopies === 0);
      }
    }

    return datasetBooks;
  }

  public async getBookById(id: string): Promise<any | null> {
    const supabase = this.getClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*, copies:book_copies(*), category:categories(*)')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const copies = data.copies || [];
          const availableCopies = copies.filter((c: any) => c.status === 'AVAILABLE').length;
          const reservedCopies = copies.filter((c: any) => c.status === 'RESERVED').length;
          const borrowedCopies = copies.filter((c: any) => c.status === 'BORROWED').length;

          return {
            ...data,
            totalCopies: copies.length,
            availableCopies,
            reservedCopies,
            borrowedCopies,
            copies,
          };
        }
      } catch (err) {}
    }

    const found = (defaultCatalog.books as any[]).find(b => b.id === id);
    return found || null;
  }

  /**
   * Automatically Insert a new Book and its Copies into Supabase
   */
  public async createBook(payload: {
    isbn: string;
    title: string;
    author: string;
    publisher?: string;
    edition?: string;
    coverImage?: string;
    description?: string;
    rackLocation?: string;
    categoryId?: string;
    totalCopies?: number;
    prefix?: string;
  }): Promise<{ success: boolean; book?: any; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      const bookId = `bk-${Date.now()}`;
      const totalCopies = Number(payload.totalCopies) || 1;
      const prefix = payload.prefix || (payload.isbn ? payload.isbn.slice(-4) : 'ECE');

      // 1. Insert book record
      const bookRecord = {
        id: bookId,
        isbn: payload.isbn.trim(),
        title: payload.title.trim(),
        author: payload.author.trim(),
        publisher: payload.publisher || 'FXEC Academic Publications',
        edition: payload.edition || '1st Edition',
        coverImage: payload.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
        description: payload.description || 'ECE Department Library title.',
        rackLocation: payload.rackLocation || 'Rack ECE-01, Shelf A',
        categoryId: payload.categoryId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .insert(bookRecord)
        .select()
        .single();

      if (bookError) {
        console.error('[Supabase createBook error]:', bookError);
        return { success: false, error: bookError.message };
      }

      // 2. Insert corresponding book copies
      const copiesToInsert = [];
      for (let i = 1; i <= totalCopies; i++) {
        copiesToInsert.push({
          id: `cp-${bookId}-${i}`,
          bookId: bookId,
          copyNumber: `${prefix}-${String(i).padStart(2, '0')}`,
          status: 'AVAILABLE',
          conditionNotes: 'Brand new copy added to library',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (copiesToInsert.length > 0) {
        const { error: copiesError } = await supabase
          .from('book_copies')
          .insert(copiesToInsert);

        if (copiesError) {
          console.warn('[Supabase createBook copies insert warning]:', copiesError.message);
        }
      }

      return {
        success: true,
        book: {
          ...bookData,
          copies: copiesToInsert,
          totalCopies,
          availableCopies: totalCopies,
          reservedCopies: 0,
          borrowedCopies: 0,
        },
      };
    } catch (err: any) {
      console.error('[Supabase createBook exception]:', err);
      return { success: false, error: err.message || 'Failed to create book in Supabase' };
    }
  }

  /**
   * Automatically Update a Book in Supabase
   */
  public async updateBook(
    id: string,
    payload: any
  ): Promise<{ success: boolean; book?: any; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false, error: 'Supabase client is not configured.' };

    try {
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };
      if (payload.title) updateData.title = payload.title;
      if (payload.author) updateData.author = payload.author;
      if (payload.publisher) updateData.publisher = payload.publisher;
      if (payload.edition) updateData.edition = payload.edition;
      if (payload.coverImage) updateData.coverImage = payload.coverImage;
      if (payload.description) updateData.description = payload.description;
      if (payload.rackLocation) updateData.rackLocation = payload.rackLocation;
      if (payload.categoryId) updateData.categoryId = payload.categoryId;

      const { data, error } = await supabase
        .from('books')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, book: data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Automatically Delete a Book and its Copies in Supabase
   */
  public async deleteBook(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false, error: 'Supabase client is not configured.' };

    try {
      // 1. Delete associated copies first (in case cascading is off)
      await supabase.from('book_copies').delete().eq('bookId', id);

      // 2. Delete the book record
      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Add a single book copy in Supabase
   */
  public async addBookCopy(payload: {
    bookId: string;
    copyNumber: string;
    conditionNotes?: string;
  }): Promise<{ success: boolean; copy?: any; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false, error: 'Supabase client is not configured.' };

    try {
      const copyRecord = {
        id: `cp-${payload.bookId}-${Date.now()}`,
        bookId: payload.bookId,
        copyNumber: payload.copyNumber.trim(),
        status: 'AVAILABLE',
        conditionNotes: payload.conditionNotes || 'Active copy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('book_copies')
        .insert(copyRecord)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, copy: data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Update a book copy status in Supabase
   */
  public async updateCopyStatus(
    copyId: string,
    payload: { status: string; conditionNotes?: string }
  ): Promise<{ success: boolean; copy?: any; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false, error: 'Supabase client is not configured.' };

    try {
      const updateData: any = {
        status: payload.status,
        updatedAt: new Date().toISOString(),
      };
      if (payload.conditionNotes !== undefined) {
        updateData.conditionNotes = payload.conditionNotes;
      }

      const { data, error } = await supabase
        .from('book_copies')
        .update(updateData)
        .eq('id', copyId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, copy: data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete a single copy in Supabase
   */
  public async deleteCopy(copyId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false, error: 'Supabase client is not configured.' };

    try {
      const { error } = await supabase.from('book_copies').delete().eq('id', copyId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // -------------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------------

  public async getCategories(): Promise<any[]> {
    const supabase = this.getClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) return data;
      } catch (err) {}
    }

    return (defaultCatalog.categories as any[]) || [];
  }

  // -------------------------------------------------------------
  // RESERVATIONS & BORROW TRANSACTIONS
  // -------------------------------------------------------------

  public async getReservations(status?: string): Promise<any[]> {
    const supabase = this.getClient();
    if (!supabase) return [];

    try {
      let query = supabase.from('reservations').select('*').order('createdAt', { ascending: false });
      if (status && status !== 'all') {
        query = query.eq('status', status.toUpperCase());
      }
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    } catch (err) {
      return [];
    }
  }

  public async requestReservation(payload: {
    copyId: string;
    userId: string;
    durationHours?: number;
  }): Promise<{ success: boolean; reservation?: any; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false };

    try {
      const expiresAt = new Date(Date.now() + (payload.durationHours || 24) * 60 * 60 * 1000).toISOString();
      const resId = `res-${Date.now()}`;

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          id: resId,
          userId: payload.userId,
          bookCopyId: payload.copyId,
          status: 'PENDING',
          expiresAt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error) {
        // Mark copy reserved
        await this.updateCopyStatus(payload.copyId, { status: 'RESERVED' });
      }

      return { success: !error, reservation: data, error: error?.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async cancelReservation(id: string): Promise<{ success: boolean }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false };

    try {
      const { data: res } = await supabase.from('reservations').select('*').eq('id', id).single();
      const { error } = await supabase.from('reservations').update({ status: 'CANCELLED' }).eq('id', id);

      if (res?.bookCopyId) {
        await this.updateCopyStatus(res.bookCopyId, { status: 'AVAILABLE' });
      }

      return { success: !error };
    } catch (err) {
      return { success: false };
    }
  }

  public async issueBook(payload: {
    copyId: string;
    userId: string;
    days: number;
  }): Promise<{ success: boolean; transaction?: any; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false };

    try {
      const dueDate = new Date(Date.now() + (payload.days || 14) * 24 * 60 * 60 * 1000).toISOString();
      const txId = `tx-${Date.now()}`;

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          id: txId,
          userId: payload.userId,
          bookCopyId: payload.copyId,
          status: 'BORROWED',
          borrowedAt: new Date().toISOString(),
          dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error) {
        await this.updateCopyStatus(payload.copyId, { status: 'BORROWED' });
      }

      return { success: !error, transaction: data, error: error?.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async returnBook(
    id: string,
    payload: { condition: string; waiveFine: boolean }
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = this.getClient();
    if (!supabase) return { success: false };

    try {
      const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single();
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'RETURNED',
          returnedAt: new Date().toISOString(),
          condition: payload.condition || 'GOOD',
          fineWaived: !!payload.waiveFine,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id);

      if (tx?.bookCopyId) {
        await this.updateCopyStatus(tx.bookCopyId, { status: 'AVAILABLE' });
      }

      return { success: !error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const supabaseService = new SupabaseService();
