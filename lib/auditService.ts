// lib/auditService.ts
// Auditoría en Supabase Postgres (tabla audit_log). Sustituye a Vercel Blob.
// Solo lo importa dataService.

import { supabaseServiceClient, isSupabaseConfigured } from './supabase';
import type { AuditEntry } from './types';

/**
 * Registra una entrada de auditoría. Append-only.
 * created_at lo asigna la DB (DEFAULT NOW()); id lo genera gen_random_uuid().
 */
export const recordAuditEntry = async (entry: AuditEntry): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabaseServiceClient.from('audit_log').insert({
    user_id: entry.user_id ?? null,
    user_email: entry.user_email ?? null,
    user_role: entry.user_role ?? null,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entity_id ?? null,
    summary: entry.summary,
    metadata: entry.metadata ?? null,
  });

  if (error) {
    console.error('Error registrando auditoría:', error.message);
    return false;
  }
  return true;
};

const monthRange = (yyyymm: string): { from: string; to: string } => {
  const year = Number(yyyymm.slice(0, 4));
  const month = Number(yyyymm.slice(4, 6)); // 1-12
  const from = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const to = new Date(Date.UTC(year, month, 1)).toISOString(); // inicio del mes siguiente
  return { from, to };
};

/**
 * Lee las entradas de auditoría de un mes (formato YYYYMM).
 */
export const getAuditLog = async (yyyymm: string): Promise<AuditEntry[]> => {
  if (!isSupabaseConfigured()) return [];
  if (!/^\d{6}$/.test(yyyymm)) return [];

  const { from, to } = monthRange(yyyymm);

  const { data, error } = await supabaseServiceClient
    .from('audit_log')
    .select('*')
    .gte('created_at', from)
    .lt('created_at', to)
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('Error leyendo auditoría:', error.message);
    return [];
  }

  return data.map((row): AuditEntry => ({
    id: row.id,
    timestamp: row.created_at,
    user_id: row.user_id ?? undefined,
    user_email: row.user_email ?? undefined,
    user_role: row.user_role ?? undefined,
    action: row.action,
    entity: row.entity,
    entity_id: row.entity_id ?? undefined,
    summary: row.summary,
    metadata: row.metadata ?? undefined,
  }));
};

// Compat: el diagnóstico consultaba "blobConfigured". Con todo en Supabase,
// la auditoría está disponible si Supabase está configurado.
export const isAuditConfigured = (): boolean => isSupabaseConfigured();
