// app/api/reports/top-products/route.ts
// Reporte de productos más pedidos en un período

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { getTopProductsData } from '@/lib/dataService';
import { buildTopProductsReport } from '@/lib/reportService';

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

      // Obtener datos del período
      const orderData = await getTopProductsData(from, to);
      
      // Construir reporte (agrupa y ordena)
      const reportData = buildTopProductsReport(orderData);

      return NextResponse.json(
        {
          success: true,
          data: reportData,
          count: reportData.length,
          type: 'top-products',
          period: { from, to },
          generatedAt: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error generando reporte de top productos:', error);
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
