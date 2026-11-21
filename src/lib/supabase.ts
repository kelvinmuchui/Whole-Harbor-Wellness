import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | undefined;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  supabaseClient = createClient(supabaseUrl, publishableKey);
  return supabaseClient;
}
