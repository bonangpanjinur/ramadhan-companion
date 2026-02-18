import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These environment variables must be defined in your .env file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("Supabase environment variables are missing. Please check your .env file.");
}

export const supabase = createClient<Database>(
  SUPABASE_URL || '', 
  SUPABASE_PUBLISHABLE_KEY || '', 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
