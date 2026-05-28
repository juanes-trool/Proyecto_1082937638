// app/api/config/route.ts
// Obtener y actualizar configuración del sistema

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { getSystemConfig, updateSystemConfig } from '@/lib/dataService';

// GET /api/config
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const config = await getSystemConfig();
      if (!config) {
        return NextResponse.json(
          {
            success: false,
            error: 'No se pudo obtener la configuración',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: config,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al obtener configuración',
        },
        { status: 500 }
      );
    }
  });
};

// PATCH /api/config
export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { default_min_stock } = body;

      // Validar input
      if (typeof default_min_stock !== 'number' || default_min_stock < 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'El stock mínimo debe ser un número positivo',
          },
          { status: 400 }
        );
      }

      // Actualizar configuración
      const userId = authRequest.user!.userId;
      const updated = await updateSystemConfig(userId, default_min_stock);
      
      if (!updated) {
        return NextResponse.json(
          {
            success: false,
            error: 'Error al actualizar configuración',
          },
          { status: 500 }
        );
      }

      // Obtener la configuración actualizada
      const config = await getSystemConfig();
      
      return NextResponse.json(
        {
          success: true,
          data: config,
          message: 'Configuración actualizada exitosamente',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar configuración',
        },
        { status: 500 }
      );
    }
  });
};
