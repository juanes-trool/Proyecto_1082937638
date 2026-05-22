// lib/schemas.ts
// Esquemas Zod para validación en servidor

import { z } from 'zod';

// ============================================================================
// CATEGORÍAS
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(80, 'Máximo 80 caracteres').trim(),
  description: z.string().max(500, 'Máximo 500 caracteres').trim().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(80).trim().optional(),
  description: z.string().max(500).trim().optional(),
  is_active: z.boolean().optional(),
});

// ============================================================================
// PRODUCTOS
// ============================================================================

export const createProductSchema = z.object({
  category_id: z.string().uuid('ID de categoría inválido'),      // RN-06
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(150).trim(),
  description: z.string().max(1000).trim().optional(),
  brand: z.string().max(80).trim().optional(),
  price: z.number({ invalid_type_error: 'El precio debe ser un número' }).positive('El precio debe ser mayor a 0'), // RN-02
  current_stock: z.number({ invalid_type_error: 'El stock debe ser un número' }).int().min(0, 'El stock no puede ser negativo'), // RN-03
  min_stock: z.number().int().min(0).optional().default(5),
});

export const updateProductSchema = z.object({
  category_id: z.string().uuid().optional(),
  name: z.string().min(2).max(150).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  brand: z.string().max(80).trim().optional(),
  price: z.number().positive().optional(),
  min_stock: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const adjustStockSchema = z.object({
  type: z.enum(['entrada', 'salida'], { required_error: 'Tipo de ajuste requerido' }),
  quantity: z.number({ invalid_type_error: 'La cantidad debe ser un número' }).int().positive('La cantidad debe ser mayor a 0'),
  reason: z.string().min(3, 'El motivo debe tener al menos 3 caracteres').max(200).trim(),
});

// ============================================================================
// PEDIDOS (Fase 4, definidos aquí para su uso en productSchema)
// ============================================================================

export const placeOrderSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  customerName: z.string().min(2, 'El nombre es obligatorio').max(150).trim(),
  phone: z.string().min(7, 'Teléfono inválido').max(20).trim(),
  address: z.string().min(5, 'La dirección es obligatoria').max(300).trim(),
  notes: z.string().max(500).trim().optional(),
});

// Tipos inferidos
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
