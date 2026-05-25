// app/api/users/[id]/route.ts
// Actualizar o eliminar usuario individual

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { findUserById, updateUser, deleteUser } from '@/lib/dataService';
import { updateUserSchema } from '@/lib/schemas';

// PATCH /api/users/[id] - Actualizar usuario
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const body = await request.json();

      // Validar con Zod
      const validation = updateUserSchema.safeParse(body);
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

      // Verificar que el usuario existe
      const existingUser = await findUserById(id);
      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Usuario no encontrado',
          },
          { status: 404 }
        );
      }

      // Actualizar usuario
      const updatedUser = await updateUser(id, validation.data);
      if (!updatedUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Error al actualizar usuario',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            is_active: updatedUser.is_active,
            must_change_password: updatedUser.must_change_password,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar usuario',
        },
        { status: 500 }
      );
    }
  });
};

// DELETE /api/users/[id] - Eliminar usuario
export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const { id } = await params;

      // No permitir eliminar el usuario actual
      const authUser = (authRequest as any).user;
      if (authUser && authUser.id === id) {
        return NextResponse.json(
          {
            success: false,
            error: 'No puedes eliminar tu propia cuenta',
          },
          { status: 400 }
        );
      }

      // Verificar que el usuario existe
      const existingUser = await findUserById(id);
      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Usuario no encontrado',
          },
          { status: 404 }
        );
      }

      // Eliminar usuario
      const deleted = await deleteUser(id);
      if (!deleted) {
        return NextResponse.json(
          {
            success: false,
            error: 'Error al eliminar usuario',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Usuario eliminado exitosamente',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al eliminar usuario',
        },
        { status: 500 }
      );
    }
  });
};
