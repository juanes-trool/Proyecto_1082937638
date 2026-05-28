// lib/imageStorage.ts
// Imágenes de productos en Supabase Storage (bucket público). Sustituye a Vercel Blob.
// Path dentro del bucket: <productId>/<filename>. Solo lo importa dataService.

import { supabaseServiceClient, isSupabaseConfigured } from './supabase';

export const PRODUCT_BUCKET = 'product-images';

/** Sanea el nombre del archivo para usarlo como key de Storage. */
const safeName = (filename: string): string =>
  filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'image';

/**
 * Sube la imagen de un producto al bucket público y retorna su URL pública.
 * Retorna null si Supabase no está configurado o si falla la subida.
 */
export const uploadProductImage = async (
  productId: string,
  filename: string,
  content: Buffer,
  contentType: string,
): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;

  const path = `${productId}/${Date.now()}-${safeName(filename)}`;

  const { error } = await supabaseServiceClient.storage
    .from(PRODUCT_BUCKET)
    .upload(path, content, { contentType, upsert: true });

  if (error) {
    console.error('Error subiendo imagen a Storage:', error.message);
    return null;
  }

  const { data } = supabaseServiceClient.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

/** Extrae el path interno del bucket a partir de la URL pública. */
const pathFromPublicUrl = (publicUrl: string): string | null => {
  const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
};

/**
 * Elimina la imagen anterior de un producto a partir de su URL pública.
 */
export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !imageUrl) return false;

  const path = pathFromPublicUrl(imageUrl);
  if (!path) return false;

  const { error } = await supabaseServiceClient.storage
    .from(PRODUCT_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Error eliminando imagen de Storage:', error.message);
    return false;
  }
  return true;
};
