// lib/auth.ts
// Authentication utilities: hashing, JWT, validation

import { hash, compare } from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';
import { AuthPayload } from './types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this');
const JWT_EXPIRATION = '7d'; // 7 days

/**
 * Hash a password using bcryptjs
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashed = await hash(password, 10);
    return hashed;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    const isValid = await compare(password, hash);
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Generate a JWT token
 */
export const generateJWT = async (payload: Omit<AuthPayload, 'iat' | 'exp'>): Promise<string> => {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION)
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw error;
  }
};

/**
 * Verify and decode a JWT token
 */
export const verifyJWT = async (token: string): Promise<AuthPayload | null> => {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as AuthPayload;
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // RNF-05: mínimo 8 caracteres, al menos una letra y un número
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
