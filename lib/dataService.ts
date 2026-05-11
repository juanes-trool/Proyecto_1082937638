// lib/dataService.ts
// Unified data access layer - ONLY point of access to data

import { supabaseClient, supabaseServiceClient, isSupabaseConfigured } from './supabase';
import { isDatabaseInitialized } from './pgMigrate';
import { getSeedUsers, getSeedSystemConfig, getSeedCategories } from './seedReader';
import { recordAuditEntry } from './blobAudit';
import { User, Category, SystemConfig } from './types';

// Determine system mode
let systemMode: 'seed' | 'live' | null = null;

/**
 * Get current system mode (seed or live)
 * In seed mode: only admin login from seed.json, no writes
 * In live mode: full database operations
 */
export const getSystemMode = async (): Promise<'seed' | 'live'> => {
  if (systemMode) {
    return systemMode;
  }

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using seed mode');
    systemMode = 'seed';
    return systemMode;
  }

  try {
    const isInitialized = await isDatabaseInitialized();
    systemMode = isInitialized ? 'live' : 'seed';
    return systemMode;
  } catch (error) {
    console.error('Error determining system mode:', error);
    systemMode = 'seed';
    return systemMode;
  }
};

/**
 * Force reset system mode cache (for testing or after bootstrap)
 */
export const resetSystemMode = () => {
  systemMode = null;
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Find user by email
 * In seed mode: searches seed.json
 * In live mode: queries Supabase
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const users = getSeedUsers();
    const user = users.find((u) => u.email === email);
    if (user) {
      return {
        id: 1,
        email: user.email,
        password_hash: user.password_hash,
        name: user.name,
        role: user.role as any,
        must_change_password: user.must_change_password || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

/**
 * Find user by ID
 */
export const findUserById = async (id: number): Promise<User | null> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    // In seed mode, only the admin user (id=1) exists
    if (id === 1) {
      const users = getSeedUsers();
      const user = users[0];
      if (user) {
        return {
          id: 1,
          email: user.email,
          password_hash: user.password_hash,
          name: user.name,
          role: user.role as any,
          must_change_password: user.must_change_password || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

/**
 * Create a new user (live mode only)
 */
export const createUser = async (
  email: string,
  passwordHash: string,
  name: string,
  role: 'admin' | 'employee'
): Promise<User | null> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    console.warn('Cannot create users in seed mode');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role,
        must_change_password: false,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating user:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (
  userId: number,
  newPasswordHash: string
): Promise<boolean> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    console.warn('Cannot update users in seed mode');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('users')
      .update({
        password_hash: newPasswordHash,
        must_change_password: false,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating password:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
};

// ============================================================================
// SYSTEM CONFIG
// ============================================================================

/**
 * Get system configuration
 */
export const getSystemConfig = async (): Promise<Record<string, any>> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    return getSeedSystemConfig();
  }

  try {
    const { data, error } = await supabaseClient
      .from('system_config')
      .select('key, value');

    if (error) {
      console.error('Error getting system config:', error);
      return {};
    }

    const config: Record<string, any> = {};
    for (const row of data || []) {
      config[row.key] = JSON.parse(row.value);
    }

    return config;
  } catch (error) {
    console.error('Error getting system config:', error);
    return {};
  }
};

/**
 * Get single config value
 */
export const getConfigValue = async (key: string): Promise<any> => {
  const config = await getSystemConfig();
  return config[key];
};

/**
 * Set config value (live mode only)
 */
export const setConfigValue = async (key: string, value: any): Promise<boolean> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    console.warn('Cannot set config in seed mode');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('system_config')
      .upsert({
        key,
        value: JSON.stringify(value),
      });

    if (error) {
      console.error('Error setting config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting config:', error);
    return false;
  }
};

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    const seedCategories = getSeedCategories();
    return seedCategories.map((cat, index) => ({
      id: index + 1,
      name: cat.name,
      description: cat.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error getting categories:', error);
      return [];
    }

    return (data || []) as Category[];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: number): Promise<Category | null> => {
  const categories = await getCategories();
  return categories.find((c) => c.id === id) || null;
};

/**
 * Create category (live mode only)
 */
export const createCategory = async (
  name: string,
  description: string
): Promise<Category | null> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    console.warn('Cannot create categories in seed mode');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return null;
    }

    return data as Category;
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
};

/**
 * Update category
 */
export const updateCategory = async (
  id: number,
  name?: string,
  description?: string
): Promise<Category | null> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    console.warn('Cannot update categories in seed mode');
    return null;
  }

  try {
    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (description) updates.description = description;

    const { data, error } = await supabaseClient
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return null;
    }

    return data as Category;
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (id: number): Promise<boolean> => {
  const mode = await getSystemMode();

  if (mode === 'seed') {
    console.warn('Cannot delete categories in seed mode');
    return false;
  }

  try {
    const { error } = await supabaseClient.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

// ============================================================================
// AUDIT
// ============================================================================

/**
 * Record an audit entry
 */
export const recordAudit = async (entry: any): Promise<void> => {
  try {
    await recordAuditEntry(entry);
  } catch (error) {
    console.error('Error recording audit:', error);
  }
};

// ============================================================================
// HEALTH & DIAGNOSTICS
// ============================================================================

/**
 * Get system health information
 */
export const getSystemHealth = async () => {
  const mode = await getSystemMode();
  const config = await getSystemConfig();

  return {
    mode,
    supabaseConfigured: isSupabaseConfigured(),
    categories: (await getCategories()).length,
    configKeys: Object.keys(config),
  };
};
