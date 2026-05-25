// app/api/users/route.ts
// CRUD de usuarios (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { listUsers, createUser, generateTemporaryPassword } from '@/lib/dataService';
import { createUserSchema } from '@/lib/schemas';
import * as bcrypt from 'bcryptjs';

// GET /api/users - Listar usuarios
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const users = await listUsers();
      return NextResponse.json(
        {
          success: true,
          data: users,
          count: users.length,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error listando usuarios:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al listar usuarios',
        },
        { status: 500 }
      );
    }
  });
};

// POST /api/users - Crear nuevo usuario
export const POST = async (request: NextRequest): Promise<NextResponse> => {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    try {
      const body = await request.json();

      // Validar con Zod
      const validation = createUserSchema.safeParse(body);
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

      const { name, email, role } = validation.data;

      // Generar contraseña temporal
      const tempPassword = generateTemporaryPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Crear usuario
      const user = await createUser(name, email, passwordHash, role);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Error al crear usuario',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            must_change_password: user.must_change_password,
          },
          // La contraseña temporal se retorna UNA SOLA VEZ
          temporaryPassword: tempPassword,
          message: 'Usuario creado exitosamente. Comparta la contraseña temporal con el usuario.',
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creando usuario:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al crear usuario',
        },
        { status: 500 }
      );
    }
  });
};
