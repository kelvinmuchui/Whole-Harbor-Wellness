import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase.ts';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

interface Database {
  public: {
    Tables: {
      whw_records: {
        Row: {
          collection: string;
          record_id: string;
          data: Json;
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          collection: string;
          record_id: string;
          data: Json;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          collection?: string;
          record_id?: string;
          data?: Json;
          is_demo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

let supabaseClient: ReturnType<typeof createClient<Database>> | undefined;

export function isSupabaseConfigured(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !publishableKey) return false;
  if (!/^https?:\/\//i.test(supabaseUrl)) return false;
  if (
    publishableKey.includes('your-') ||
    publishableKey.includes('placeholder') ||
    supabaseUrl.includes('your-')
  ) {
    return false;
  }

  return true;
}

export function getSupabaseClientOrNull() {
  if (!isSupabaseConfigured()) return null;
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!.trim();

  supabaseClient = createClient<Database>(supabaseUrl, publishableKey, {
    accessToken: async () => (await auth.currentUser?.getIdToken()) ?? null
  });
  return supabaseClient;
}

export function getSupabaseClient() {
  const client = getSupabaseClientOrNull();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return client;
}
