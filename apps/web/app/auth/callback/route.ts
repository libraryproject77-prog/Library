import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/portal/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const email = (data.user.email || '').toLowerCase().trim();

      // STRICT VALIDATION: Only @francisxavier.ac.in allowed
      if (!email.endsWith('@francisxavier.ac.in')) {
        // Discard session immediately
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/portal/login?error=invalid_domain&deniedEmail=${encodeURIComponent(email)}`
        );
      }

      // Determine Role
      const role = email.includes('admin')
        ? 'ADMIN'
        : email.includes('.ug.')
        ? 'STUDENT'
        : 'STAFF';

      // Direct upsert to Supabase profiles table
      try {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            email: email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0],
            role: role,
            department: 'ECE',
            rollNumber: role === 'STUDENT' ? (email.match(/(\d{2}ec\d{3})/i)?.[1]?.toUpperCase() || '25EC001') : null,
            staffId: role === 'STAFF' ? 'FX-ECE-STF-014' : null,
            avatarUrl: '/default-avatar.jpg',
            status: 'ACTIVE',
            updatedAt: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
      } catch (dbErr) {
        console.warn('[Supabase Auth Callback profile upsert warning]:', dbErr);
      }

      const target = role === 'ADMIN' ? '/admin/dashboard' : next;
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}/portal/login?error=auth-failed`);
}
