import { createBrowserClient } from "@supabase/ssr";

export const getSupabaseUrl = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export const getSupabaseKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(url && key && url.startsWith('http') && !url.includes('your-project'));
};

export const createClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key || !url.startsWith('http')) {
    return null as any;
  }
  return createBrowserClient(url, key);
};
