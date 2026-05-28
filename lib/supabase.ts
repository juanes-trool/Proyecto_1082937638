// lib/supabase.ts
// Supabase client initialization

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeAnonKey = supabaseAnonKey || 'placeholder-anon-key';
const safeServiceRoleKey = supabaseServiceRoleKey || 'placeholder-service-role-key';

export const supabaseClient = createClient(safeSupabaseUrl, safeAnonKey);
export const supabaseServiceClient = createClient(safeSupabaseUrl, safeServiceRoleKey);

// Get the connection string for migrations
export const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || '';
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);
};
