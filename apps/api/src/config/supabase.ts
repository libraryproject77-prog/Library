import { createClient } from '@supabase/supabase-js';
import { config } from './env';

const supabaseUrl = config.supabaseUrl || 'https://cjwykoevlivvilciuctl.supabase.co';
const supabaseKey = config.supabaseAnonKey || 'sb_publishable_QpPQwzew8G5My7O-cgeNSw_5YSiQiH6';

export const supabase = createClient(supabaseUrl, supabaseKey);
