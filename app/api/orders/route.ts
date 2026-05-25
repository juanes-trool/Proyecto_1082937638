// app/api/orders/route.ts
// Obtener lista de órdenes con filtros (admin, empleado)

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth';
import { getOrders } from '@/lib/dataService';
import type { OrderFilters } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withAuth(request, async (authRequest: AuthenticatedRequest) => {
    try {
      // Extraer parámetros de búsqueda
      const { searchParams } = new URL(authRequest.url);
      const status = searchParams.get('status');
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      const productId = searchParams.get('productId');

      // Construir filtros
      const filters: OrderFilters = {};
      if (status) filters.status = status as any;
      if (from) filters.from = from;
      if (to) filters.to = to;
      if (productId) filters.product_id = productId;

      // Obtener órdenes
      const orders = await getOrders(filters);

      return NextResponse.json(
        {
          success: true,
          data: orders,
          count: orders.length,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al obtener órdenes',
        },
        { status: 500 }
      );
    }
  });
}
