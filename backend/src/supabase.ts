import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from example first, then override with actual .env
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw Error("Supabase URL and/or Anon Key are not set in environment variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
