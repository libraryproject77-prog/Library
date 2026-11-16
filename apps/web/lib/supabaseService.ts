import { createClient, isSupabaseConfigured } from '@/utils/supabase/client';

export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  department?: string;
  rollNumber?: string;
  staffId?: string;
  avatarUrl?: string;
}

class SupabaseService {
  public isAvailable(): boolean {
    return isSupabaseConfigured();
  }

  public getClient() {
    return createClient();
  }

  /**
   * Register a user with Supabase Auth and insert profile into 'profiles' table
   */
  public async registerUser(payload: {
    email: string;
    password: string;
    name: string;
    role: 'STUDENT' | 'STAFF';
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
      // 1. Supabase Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.name,
            role: payload.role,
            department: payload.department || 'ECE',
            roll_number: payload.rollNumber,
            staff_id: payload.staffId,
            avatar_url: payload.avatarUrl || '/default-avatar.jpg',
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const userId = authData.user?.id || `usr-${Date.now()}`;

      // 2. Insert or Upsert into profiles table
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          email: payload.email.toLowerCase(),
          name: payload.name,
          role: payload.role,
          department: payload.department || 'ECE',
          roll_number: payload.rollNumber,
          staff_id: payload.staffId,
          avatar_url: payload.avatarUrl || '/default-avatar.jpg',
          status: 'ACTIVE',
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('[Supabase] Profiles table upsert optional warning:', dbErr);
      }

      return {
        success: true,
        user: {
          id: userId,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          department: payload.department || 'ECE',
          rollNumber: payload.rollNumber,
          staffId: payload.staffId,
          avatarUrl: payload.avatarUrl || '/default-avatar.jpg',
        },
      };
    } catch (err: any) {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const user = data.user;
      const metadata = user.user_metadata || {};

      const profile: SupabaseUserProfile = {
        id: user.id,
        email: user.email || email,
        name: metadata.full_name || metadata.name || email.split('@')[0],
        role: metadata.role || (email.includes('admin') ? 'ADMIN' : (email.includes('.ug.') ? 'STUDENT' : 'STAFF')),
        department: metadata.department || 'ECE',
        rollNumber: metadata.roll_number || metadata.rollNumber,
        staffId: metadata.staff_id || metadata.staffId,
        avatarUrl: metadata.avatar_url || '/default-avatar.jpg',
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
}

export const supabaseService = new SupabaseService();
