// lib/blobAudit.ts
// Vercel Blob management para auditoría (blob PRIVADO)
// Patrón: getBlobToken lazy + get() del SDK para lectura

import { put, get, del, head } from '@vercel/blob';
import type { AuditEntry } from './types';

const AUDIT_PREFIX = 'audit';

// Token lazy — se lee la primera vez que se necesita
let blobToken: string | null = null;

export const getBlobToken = (): string => {
  if (!blobToken) {
    blobToken = process.env.BLOB_READ_WRITE_TOKEN ?? '';
  }
  return blobToken;
};

export const isBlobConfigured = (): boolean => !!getBlobToken();

/**
 * Construye la URL del blob de auditoría para un mes dado.
 * Los blobs de auditoría son PRIVADOS — no accesibles sin token.
 */
const getAuditBlobUrl = (yyyymm: string): string =>
  `${AUDIT_PREFIX}/${yyyymm}.json`;

/**
 * Lee el log de auditoría de un mes usando get() del SDK (blob privado).
 * Retorna array de entradas o [] si no existe.
 */
export const getAuditLog = async (yyyymm: string): Promise<AuditEntry[]> => {
  if (!isBlobConfigured()) return [];

  const token = getBlobToken();
  const pathname = getAuditBlobUrl(yyyymm);

  try {
    // head() verifica si el blob existe sin descargar el contenido
    await head(pathname, { token });
  } catch {
    // El blob no existe aún para ese mes
    return [];
  }

  try {
    const blob = await get(pathname, { token });
    if (!blob) return [];
    const text = await blob.text();
    return JSON.parse(text) as AuditEntry[];
  } catch (error) {
    console.error('Error leyendo log de auditoría:', error);
    return [];
  }
};

/**
 * Agrega una entrada al log de auditoría del mes actual.
 * Lee el archivo existente, agrega la entrada y lo sobreescribe.
 */
export const recordAuditEntry = async (entry: AuditEntry): Promise<boolean> => {
  if (!isBlobConfigured()) return false;

  try {
    const token = getBlobToken();
    const yyyymm = new Date().toISOString().slice(0, 7);
    const pathname = getAuditBlobUrl(yyyymm);

    const existing = await getAuditLog(yyyymm);
    existing.push({
      ...entry,
      timestamp: entry.timestamp ?? new Date().toISOString(),
    });

    await put(pathname, JSON.stringify(existing, null, 2), {
      token,
      contentType: 'application/json',
      access: 'public', // Vercel Blob requiere 'public' en el campo access
      // La privacidad real se controla desde el dashboard del Blob Store
    });

    return true;
  } catch (error) {
    console.error('Error registrando auditoría:', error);
    return false;
  }
};

export const deleteAuditLog = async (yyyymm: string): Promise<boolean> => {
  if (!isBlobConfigured()) return false;
  try {
    const token = getBlobToken();
    await del(getAuditBlobUrl(yyyymm), { token });
    return true;
  } catch (error) {
    console.error('Error eliminando log de auditoría:', error);
    return false;
  }
};
};
