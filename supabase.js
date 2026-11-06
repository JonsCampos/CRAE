import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hubzdjxrotcrjbzjooha.supabase.co/';
const SUPABASE_ANON_KEY = 'sb_publishable_V3ndtlN57elIcYWcbXw-eQ_LVQFmTXx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
  },
});