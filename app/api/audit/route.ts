// app/api/audit/route.ts
// Obtener registros de auditoría

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { readAuditMonth } from '@/lib/dataService';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(authRequest.url);
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7).replace('-', '');

      // Validar formato YYYYMM
      if (!/^\d{6}$/.test(month)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Formato de mes inválido. Use YYYYMM',
          },
          { status: 400 }
        );
      }

      // Obtener logs del mes
      const auditLogs = await readAuditMonth(month);

      return NextResponse.json(
        {
          success: true,
          data: auditLogs,
          count: auditLogs.length,
          month: month,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error obteniendo auditoría:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al obtener auditoría',
        },
        { status: 500 }
      );
    }
  });
};
