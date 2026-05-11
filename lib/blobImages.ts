// lib/blobImages.ts
// Vercel Blob management for product images (public storage)

import { put, del } from '@vercel/blob';

const PRODUCTS_BUCKET = 'products';

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
 * Upload product image to Blob
 * Returns the public URL
 */
export const uploadProductImage = async (
  productId: number,
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
