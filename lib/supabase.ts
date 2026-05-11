// lib/supabase.ts
// Supabase client initialization

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

// Get the connection string for migrations
export const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || '';
};

export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey;
};
