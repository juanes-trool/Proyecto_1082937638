// lib/orderService.ts
// Lógica de pedidos — operación pública atómica
// Importa desde dataService, no accede a la DB directamente

import { getPublicProductById } from './dataService';
import { supabaseServiceClient } from './supabase';
import { PlaceOrderRequest, Order } from './types';

export class OrderError extends Error {
  constructor(
    public code: 'PRODUCT_NOT_FOUND' | 'PRODUCT_NOT_AVAILABLE' | 'INSUFFICIENT_STOCK' | 'DB_ERROR',
    message: string,
    public statusCode: number = 409,
  ) {
    super(message);
  }
}

/**
 * Crea un pedido público sin autenticación.
 * Flujo atómico (RN-07 a RN-13):
 * 1. Verificar producto existe y está EN STOCK (RN-07)
 * 2. Verificar cantidad suficiente (RN-11)
 * 3. Descontar stock (RN-08)
 * 4. Registrar pedido con snapshots (RN-12, RN-13)
 */
export async function placeOrder(data: PlaceOrderRequest): Promise<Order> {
  const { productId, quantity, customerName, phone, address, notes } = data;

  // 1. Verificar que el producto existe y está EN STOCK (RN-07)
  const product = await getPublicProductById(productId);
  if (!product) {
    throw new OrderError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);
  }

  if (product.current_stock === 0) {
    throw new OrderError('PRODUCT_NOT_AVAILABLE', 'Este producto ya no está disponible', 404);
  }

  // 2. Verificar que la cantidad pedida no supera el stock (RN-11)
  if (product.current_stock < quantity) {
    throw new OrderError(
      'INSUFFICIENT_STOCK',
      `Stock insuficiente. Disponible: ${product.current_stock}`,
      409
    );
  }

  // 3. Descontar el stock (RN-08)
  const newStock = product.current_stock - quantity;
  const { error: stockError } = await supabaseServiceClient
    .from('products')
    .update({ current_stock: newStock })
    .eq('id', productId);

  if (stockError) {
    console.error('Error descuentando stock:', stockError);
    throw new OrderError('DB_ERROR', 'Error al procesar el pedido', 500);
  }

  // 4. Registrar el pedido con status 'pendiente' (RN-12, RN-13)
  const orderData = {
    product_id: productId,
    product_name_snapshot: product.name,   // snapshot del nombre (RN-12)
    unit_price_snapshot: product.price,    // snapshot del precio (RN-12)
    quantity,
    total: product.price * quantity,
    customer_name: customerName,
    phone,
    address,
    notes: notes ?? null,
    status: 'pendiente' as const,
    // created_at asignado por DEFAULT NOW() (RN-12)
  };

  const { data: order, error: orderError } = await supabaseServiceClient
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError || !order) {
    console.error('Error registrando pedido:', orderError);
    throw new OrderError('DB_ERROR', 'Error al registrar el pedido', 500);
  }

  return order as Order;
}
