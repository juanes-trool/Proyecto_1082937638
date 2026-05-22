-- Migration: 0001_init_users
-- Description: Initialize users table, system_config, and migrations tracking

-- Create _migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(120) UNIQUE NOT NULL,
  password_hash        VARCHAR(255) NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'empleado'
                       CHECK (role IN ('admin', 'empleado')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

-- Create system_config table (single row — umbral global)
CREATE TABLE IF NOT EXISTS system_config (
  id                SERIAL    PRIMARY KEY,
  default_min_stock INTEGER   NOT NULL DEFAULT 5,
  updated_by        UUID      REFERENCES users(id) ON DELETE SET NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Mark this migration as executed
INSERT INTO _migrations (filename) VALUES ('0001_init_users.sql') ON CONFLICT DO NOTHING;
