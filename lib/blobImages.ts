// lib/blobImages.ts
// Vercel Blob management para imágenes de productos (blob PÚBLICO)
// Path: products/<productId>/<filename>

import { put, del } from '@vercel/blob';

const PRODUCTS_PREFIX = 'products';

let blobToken: string | null = null;

export const getBlobToken = (): string => {
  if (!blobToken) {
    blobToken = process.env.BLOB_READ_WRITE_TOKEN ?? '';
  }
  return blobToken;
};

export const isBlobConfigured = (): boolean => !!getBlobToken();

/**
 * Sube la imagen de un producto a Blob (acceso público).
 * Retorna la URL pública o null si no está configurado.
 */
export const uploadProductImage = async (
  productId: string,
  filename: string,
  content: Buffer,
  contentType: string
): Promise<string | null> => {
  if (!isBlobConfigured()) return null;

  try {
    const token = getBlobToken();
    const blobPath = `${PRODUCTS_PREFIX}/${productId}/${filename}`;

    const result = await put(blobPath, content, {
      token,
      contentType,
      access: 'public',
    });

    return result.url;
  } catch (error) {
    console.error('Error subiendo imagen de producto:', error);
    return null;
  }
};

/**
 * Elimina la imagen de un producto del Blob.
 * Acepta la URL pública completa del blob.
 */
export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  if (!isBlobConfigured() || !imageUrl) return false;

  try {
    const token = getBlobToken();
    // del() del SDK acepta la URL completa del blob
    await del(imageUrl, { token });
    return true;
  } catch (error) {
    console.error('Error eliminando imagen de producto:', error);
    return false;
  }
};
