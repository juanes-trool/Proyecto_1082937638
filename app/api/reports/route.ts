// app/api/reports/route.ts
// Endpoints de reportes disponibles (lista y descripciones)

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    // Endpoints disponibles
    const reports = [
      {
        id: 'inventory',
        name: 'Reporte de Inventario',
        description: 'Estado actual de todos los productos',
        endpoint: '/api/reports/inventory',
        method: 'GET',
      },
      {
        id: 'top-products',
        name: 'Productos Más Pedidos',
        description: 'Top productos por cantidad pedida en un período',
        endpoint: '/api/reports/top-products?from=YYYY-MM-DD&to=YYYY-MM-DD',
        method: 'GET',
        params: ['from', 'to'],
      },
      {
        id: 'by-period',
        name: 'Órdenes por Período',
        description: 'Historial de órdenes en un rango de fechas',
        endpoint: '/api/reports/by-period?from=YYYY-MM-DD&to=YYYY-MM-DD',
        method: 'GET',
        params: ['from', 'to'],
      },
      {
        id: 'export',
        name: 'Exportar Reporte',
        description: 'Descargar reporte en CSV',
        endpoint: '/api/reports/export?type=inventory|top-products|by-period&from=&to=&format=csv',
        method: 'GET',
        params: ['type', 'format'],
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: reports,
      },
      { status: 200 }
    );
  });
};
