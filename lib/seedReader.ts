// lib/seedReader.ts
// Read seed data from data/seed.json

import { readFileSync } from 'fs';
import { join } from 'path';

export interface SeedData {
  users?: Array<{
    email: string;
    password_hash: string;
    name: string;
    role: 'admin' | 'employee';
    must_change_password?: boolean;
  }>;
  system_config?: Record<string, any>;
  categories?: Array<{
    name: string;
    description: string;
  }>;
}

let seedCache: SeedData | null = null;

/**
 * Read seed data from file
 */
export const readSeed = (): SeedData => {
  if (seedCache) {
    return seedCache;
  }

  try {
    const seedPath = join(process.cwd(), 'data', 'seed.json');
    const content = readFileSync(seedPath, 'utf-8');
    seedCache = JSON.parse(content);
    return seedCache || {};
  } catch (error) {
    console.error('Error reading seed data:', error);
    seedCache = {};
    return seedCache;
  }
};

/**
 * Get seed users
 */
export const getSeedUsers = () => {
  const seed = readSeed();
  return seed.users || [];
};

/**
 * Get seed system config
 */
export const getSeedSystemConfig = () => {
  const seed = readSeed();
  return seed.system_config || {};
};

/**
 * Get seed categories
 */
export const getSeedCategories = () => {
  const seed = readSeed();
  return seed.categories || [];
};

/**
 * Clear seed cache (useful for testing or reloading)
 */
export const clearSeedCache = () => {
  seedCache = null;
};
