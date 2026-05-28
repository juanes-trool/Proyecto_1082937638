// app/api/products/[id]/stock/route.ts
// PATCH — ajuste manual de stock (entrada/salida). Empleado y admin (RF-09).

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth';
import { adjustStock, recordAudit } from '@/lib/dataService';
import { adjustStockSchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withAuth(request, async (authRequest: AuthenticatedRequest) => {
    const { id } = await params;

    const body = await authRequest.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Cuerpo de petición inválido' }, { status: 400 });
    }

    const parsed = adjustStockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    try {
      const product = await adjustStock(id, authRequest.user!.userId, parsed.data);
      if (!product) {
        return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
      }

      await recordAudit({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        user_id: authRequest.user!.userId,
        user_email: authRequest.user!.email,
        user_role: authRequest.user!.role as 'admin' | 'empleado',
        action: 'adjust_stock',
        entity: 'product',
        entity_id: id,
        summary: `Ajuste de stock (${parsed.data.type} ${parsed.data.quantity}) — ${parsed.data.reason}`,
        metadata: { type: parsed.data.type, quantity: parsed.data.quantity, new_stock: product.current_stock },
      });

      return NextResponse.json({ success: true, data: product });
    } catch (err) {
      if (err instanceof Error && err.message === 'INSUFFICIENT_STOCK') {
        return NextResponse.json(
          { success: false, error: 'El stock no puede quedar negativo (RN-03)' },
          { status: 409 }
        );
      }
      throw err;
    }
  });
}
