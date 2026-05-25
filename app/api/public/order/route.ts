// app/api/public/order/route.ts
// POST /api/public/order — hacer pedido sin autenticación
// Única operación pública de escritura del sistema

import { NextRequest, NextResponse } from 'next/server';
import { placeOrder, OrderError } from '@/lib/orderService';
import { recordAudit } from '@/lib/dataService';
import { placeOrderSchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Cuerpo de petición inválido' },
        { status: 400 }
      );
    }

    // Validar con Zod
    const parsed = placeOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Crear el pedido
    const order = await placeOrder(parsed.data);

    // Registrar auditoría (acción pública sin user_id)
    await recordAudit({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      user_role: 'public',
      action: 'place_order',
      entity: 'order',
      entity_id: order.id,
      summary: `Pedido creado por ${parsed.data.customerName}`,
      metadata: {
        product_name: order.product_name_snapshot,
        quantity: order.quantity,
      },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
          code: err.code,
        },
        { status: err.statusCode }
      );
    }

    console.error('Error en POST /api/public/order:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
