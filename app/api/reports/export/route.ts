// app/api/reports/export/route.ts
// Exportar reporte en CSV

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';
import {
  getInventoryReportData,
  getTopProductsData,
  getOrdersByPeriodData,
} from '@/lib/dataService';
import {
  generateInventoryCSV,
  generateTopProductsCSV,
  generateOrderPeriodCSV,
  generateReportFilename,
} from '@/lib/reportService';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(authRequest.url);
      const type = searchParams.get('type') as 'inventory' | 'top-products' | 'by-period' | null;
      const format = searchParams.get('format') || 'csv';
      const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

      // Validar parámetros
      if (!type) {
        return NextResponse.json(
          {
            success: false,
            error: 'Parámetro "type" requerido: inventory, top-products, o by-period',
          },
          { status: 400 }
        );
      }

      if (format !== 'csv') {
        return NextResponse.json(
          {
            success: false,
            error: 'Formato no soportado. Solo CSV disponible en v1',
          },
          { status: 400 }
        );
      }

      let csvContent: string;
      let filename: string;

      if (type === 'inventory') {
        // Reporte de inventario
        const inventoryData = await getInventoryReportData();
        const categoriesMap = inventoryData.reduce(
          (acc, row) => ({ ...acc, [row.id]: row.category_name }),
          {} as Record<string, string>
        );

        csvContent = await generateInventoryCSV(inventoryData as any, categoriesMap);
        filename = generateReportFilename('inventory');
      } else if (type === 'top-products') {
        // Reporte de top productos
        const orderData = await getTopProductsData(from, to);
        csvContent = generateTopProductsCSV(orderData);
        filename = generateReportFilename('top-products', from, to);
      } else if (type === 'by-period') {
        // Reporte por período
        const orderData = await getOrdersByPeriodData(from, to);
        csvContent = generateOrderPeriodCSV(orderData);
        filename = generateReportFilename('by-period', from, to);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Tipo de reporte no válido',
          },
          { status: 400 }
        );
      }

      // Retornar con headers de descarga
      return new NextResponse(Buffer.from(csvContent, 'utf8'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (error) {
      console.error('Error exportando reporte:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al exportar reporte',
        },
        { status: 500 }
      );
    }
  });
};
