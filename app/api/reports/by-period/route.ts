// app/api/reports/by-period/route.ts
// Reporte de órdenes por período

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { getOrdersByPeriodData } from '@/lib/dataService';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(authRequest.url);
      const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

      // Validar formato de fechas
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Formato de fecha inválido. Use YYYY-MM-DD',
          },
          { status: 400 }
        );
      }

      // Obtener órdenes del período
      const reportData = await getOrdersByPeriodData(from, to);

      return NextResponse.json(
        {
          success: true,
          data: reportData,
          count: reportData.length,
          type: 'by-period',
          period: { from, to },
          generatedAt: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error generando reporte de período:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al generar reporte',
        },
        { status: 500 }
      );
    }
  });
};
