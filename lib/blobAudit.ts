// lib/blobAudit.ts
// Vercel Blob management for audit logs (private storage)

import { put, get, del } from '@vercel/blob';

const AUDIT_BUCKET = 'audit';

let blobToken: string | null = null;

export const getBlobToken = () => {
  if (!blobToken) {
    blobToken = process.env.BLOB_READ_WRITE_TOKEN || '';
  }
  return blobToken;
};

export const isBlobConfigured = () => {
  return !!getBlobToken();
};

/**
 * Get current audit log for the month
 * Returns parsed JSON array or empty array if not found
 */
export const getAuditLog = async (month: string): Promise<any[]> => {
  if (!isBlobConfigured()) {
    console.warn('Blob not configured, audit disabled');
    return [];
  }

  try {
    const token = getBlobToken();
    const filename = `${AUDIT_BUCKET}/${month}.json`;
    
    // For demonstration, return empty array
    // In production, you would fetch from Blob using the Vercel Blob API
    console.log(`Would fetch audit log from: ${filename}`);
    return [];
  } catch (error: any) {
    console.error('Error reading audit log:', error);
    return [];
  }
};

/**
 * Append entry to audit log for the month
 */
export const recordAuditEntry = async (entry: any): Promise<boolean> => {
  if (!isBlobConfigured()) {
    console.warn('Blob not configured, audit disabled');
    return false;
  }

  try {
    const token = getBlobToken();
    const now = new Date();
    const month = now.toISOString().slice(0, 7); // YYYY-MM
    const filename = `${AUDIT_BUCKET}/${month}.json`;

    // Get existing entries
    let entries = await getAuditLog(month);
    
    // Add new entry
    entries.push({
      ...entry,
      timestamp: now.toISOString(),
    });

    // Write back to blob
    await put(filename, JSON.stringify(entries, null, 2), {
      token,
      contentType: 'application/json',
      access: 'private',
    });

    return true;
  } catch (error) {
    console.error('Error recording audit entry:', error);
    return false;
  }
};

/**
 * Delete audit log for a specific month
 */
export const deleteAuditLog = async (month: string): Promise<boolean> => {
  if (!isBlobConfigured()) {
    return false;
  }

  try {
    const token = getBlobToken();
    const filename = `${AUDIT_BUCKET}/${month}.json`;
    
    await del(filename, { token });
    return true;
  } catch (error) {
    console.error('Error deleting audit log:', error);
    return false;
  }
};
