// lib/supabase.ts
// Supabase client initialization

import { createClient } from '@supabase/supabase-js';

// Las NEXT_PUBLIC_* se incrustan en el build; estos clientes corren en el
// servidor, así que aceptamos también los nombres NO públicos como respaldo,
// que se leen en runtime sin depender del momento del build (clave en Vercel).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeAnonKey = supabaseAnonKey || 'placeholder-anon-key';
const safeServiceRoleKey = supabaseServiceRoleKey || 'placeholder-service-role-key';

export const supabaseClient = createClient(safeSupabaseUrl, safeAnonKey);
export const supabaseServiceClient = createClient(safeSupabaseUrl, safeServiceRoleKey);

// Get the connection string for migrations (acepta los nombres de la integración Vercel)
export const getDatabaseUrl = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    ''
  );
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey);
};
