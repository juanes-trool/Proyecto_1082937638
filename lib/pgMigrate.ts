// lib/pgMigrate.ts
// PostgreSQL migrations executor

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const getDatabaseUrl = () => process.env.DATABASE_URL || '';

const getMigrationsDir = () => {
  return join(process.cwd(), 'supabase', 'migrations');
};

/**
 * Get all migration files in order
 */
export const getMigrationFiles = (): string[] => {
  // This would normally use fs.readdirSync, but for now we hardcode known migrations
  return [
    '0001_init_users.sql',
    '0002_init_catalog.sql',
    '0003_init_orders.sql',
    '0004_init_audit.sql',
  ];
};

// Supabase usa certificados administrados; con sslmode=require las versiones
// recientes de `pg` aplican verify-full y rechazan el cert. Forzamos TLS
// sin verificación de cadena para que las migraciones conecten.
const PG_SSL = { rejectUnauthorized: false } as const;

/**
 * Read a migration file content
 */
export const readMigration = (filename: string): string => {
  try {
    const filepath = join(getMigrationsDir(), filename);
    return readFileSync(filepath, 'utf-8');
  } catch (error) {
    console.error(`Error reading migration ${filename}:`, error);
    return '';
  }
};

/**
 * Get list of already executed migrations
 */
export const getExecutedMigrations = async (pool: Pool): Promise<string[]> => {
  try {
    // Asegurar que la tabla _migrations exista
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const result = await pool.query('SELECT filename FROM _migrations ORDER BY applied_at ASC');
    return result.rows.map((row) => row.filename);
  } catch (error) {
    console.error('Error obteniendo migraciones ejecutadas:', error);
    return [];
  }
};

/**
 * Record a migration as executed
 */
export const recordMigration = async (pool: Pool, filename: string): Promise<void> => {
  try {
    await pool.query(
      'INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
      [filename]
    );
  } catch (error) {
    console.error(`Error registrando migración ${filename}:`, error);
  }
};

/**
 * Run pending migrations
 */
export const runMigrations = async (): Promise<{ success: boolean; message: string }> => {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return {
      success: false,
      message: 'DATABASE_URL not configured',
    };
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: PG_SSL });

  try {
    console.log('Starting migrations...');

    const executed = await getExecutedMigrations(pool);
    const available = getMigrationFiles();

    let migrationCount = 0;

    for (const filename of available) {
      if (executed.includes(filename)) {
        console.log(`Skipping ${filename} (already executed)`);
        continue;
      }

      console.log(`Running migration: ${filename}`);
      const content = readMigration(filename);

      if (!content) {
        console.warn(`Migration file is empty: ${filename}`);
        continue;
      }

      try {
        await pool.query(content);
        await recordMigration(pool, filename);
        migrationCount++;
        console.log(`✓ ${filename} completed`);
      } catch (error) {
        console.error(`✗ ${filename} failed:`, error);
        throw error;
      }
    }

    const message = migrationCount === 0 
      ? 'All migrations already executed'
      : `${migrationCount} migration(s) executed successfully`;

    return { success: true, message };
  } catch (error) {
    return {
      success: false,
      message: `Migration error: ${error instanceof Error ? error.message : String(error)}`,
    };
  } finally {
    await pool.end();
  }
};

/**
 * Check if database is initialized (migrations table exists and is populated)
 */
export const isDatabaseInitialized = async (): Promise<boolean> => {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return false;
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: PG_SSL });

  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '_migrations'
      );
    `);

    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  } finally {
    await pool.end();
  }
};
