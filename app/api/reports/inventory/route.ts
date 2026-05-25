// app/api/reports/inventory/route.ts
// Reporte de inventario actual

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { getInventoryReportData } from '@/lib/dataService';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const reportData = await getInventoryReportData();

      return NextResponse.json(
        {
          success: true,
          data: reportData,
          count: reportData.length,
          type: 'inventory',
          generatedAt: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error generando reporte de inventario:', error);
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
