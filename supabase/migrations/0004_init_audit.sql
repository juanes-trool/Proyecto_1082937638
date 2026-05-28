-- Migration 0004: auditoría en Supabase Postgres
-- Reemplaza el almacenamiento en Vercel Blob: TODO va a Supabase.
-- Append-only: el sistema solo inserta y lee, nunca actualiza ni borra.

CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID,                       -- null en acciones públicas (place_order)
  user_email  VARCHAR(120),
  user_role   VARCHAR(10),                -- 'admin' | 'empleado' | 'public'
  action      VARCHAR(40)  NOT NULL,
  entity      VARCHAR(20)  NOT NULL,      -- product | category | order | user | system
  entity_id   VARCHAR(64),
  summary     TEXT         NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action  ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity  ON audit_log(entity, entity_id);
