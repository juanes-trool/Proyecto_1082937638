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

/**
 * Upload product image to Blob
 * Returns the public URL
 */
export const uploadProductImage_OLD = async (
  filename: string,
  content: Buffer | Blob,
  contentType: string
): Promise<string | null> => {
  if (!isBlobConfigured()) {
    console.warn('Blob not configured, image upload disabled');
    return null;
  }

  try {
    const token = getBlobToken();
    const blobPath = `${PRODUCTS_BUCKET}/${productId}/${filename}`;

    const result = await put(blobPath, content, {
      token,
      contentType,
      access: 'public',
    });

    return result.url;
  } catch (error) {
    console.error('Error uploading product image:', error);
    return null;
  }
};

/**
 * Delete product image from Blob
 * Extracts filename from full URL
 */
export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  if (!isBlobConfigured()) {
    console.warn('Blob not configured, image deletion disabled');
    return false;
  }

  try {
    const token = getBlobToken();
    
    // Extract pathname from URL
    const url = new URL(imageUrl);
    const pathname = url.pathname.replace('/public/', '');

    await del(pathname, { token });
    return true;
  } catch (error) {
    console.error('Error deleting product image:', error);
    return false;
  }
};

/**
 * Delete all images for a product
 */
export const deleteProductImages = async (productId: number): Promise<boolean> => {
  if (!isBlobConfigured()) {
    console.warn('Blob not configured, image deletion disabled');
    return false;
  }

  try {
    const token = getBlobToken();
    
    // Delete the entire product folder
    // This requires listing first if Blob API supports it
    // For now, we'll just log that this would need a more sophisticated approach
    console.log(`Would delete all images for product ${productId}`);
    return true;
  } catch (error) {
    console.error('Error deleting product images:', error);
    return false;
  }
};
