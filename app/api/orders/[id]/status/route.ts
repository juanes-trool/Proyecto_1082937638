// app/api/orders/[id]/status/route.ts
// Actualizar el estado de una orden (admin, empleado)

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth';
import { updateOrderStatus, recordAudit } from '@/lib/dataService';
import { updateOrderStatusSchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withAuth(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const body = await authRequest.json().catch(() => null);

      if (!body) {
        return NextResponse.json(
          { success: false, error: 'Cuerpo inválido' },
          { status: 400 }
        );
      }

      // Validar con Zod
      const validation = updateOrderStatusSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Datos inválidos',
            details: validation.error.issues,
          },
          { status: 400 }
        );
      }

      const { status, confirmCancelation } = validation.data;

      // Actualizar estado
      const updatedOrder = await updateOrderStatus(id, status, authRequest.user!.userId);
      if (!updatedOrder) {
        return NextResponse.json(
          {
            success: false,
            error: 'No se pudo actualizar la orden',
          },
          { status: 500 }
        );
      }

      // Registrar auditoría
      await recordAudit({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        user_id: authRequest.user!.userId,
        user_email: authRequest.user!.email,
        user_role: authRequest.user!.role as 'admin' | 'empleado',
        action: 'update_order_status',
        entity: 'order',
        entity_id: id,
        summary: `Orden ${id} pasó a estado "${status}"`,
        metadata: {
          previousStatus: body.previousStatus,
          newStatus: status,
          confirmCancelation,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: updatedOrder,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error actualizando estado de orden:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar estado de orden',
        },
        { status: 500 }
      );
    }
  });
}
