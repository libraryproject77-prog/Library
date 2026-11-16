import { createBrowserClient } from "@supabase/ssr";

export const DEFAULT_SUPABASE_URL = "https://cjwykoevlivvilciuctl.supabase.co";
export const DEFAULT_SUPABASE_KEY = "sb_publishable_QpPQwzew8G5My7O-cgeNSw_5YSiQiH6";

export const getSupabaseUrl = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;

export const getSupabaseKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(url && key && url.startsWith('http'));
};

export const createClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url || !key || !url.startsWith('http')) {
    return null as any;
  }
  return createBrowserClient(url, key);
};
