// app/api/categories/route.ts
// GET /api/categories — lista de categorías (cualquier usuario autenticado)
// POST /api/categories — crear categoría (admin)

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { getCategories, createCategory, recordAudit } from '@/lib/dataService';
import { createCategorySchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withAuth(request, async () => {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    const body = await authRequest.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Cuerpo de petición inválido' }, { status: 400 });
    }

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    const category = await createCategory(
      parsed.data.name,
      parsed.data.description ?? ''
    );

    if (!category) {
      return NextResponse.json({ success: false, error: 'Error al crear la categoría' }, { status: 500 });
    }

    await recordAudit({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: authRequest.user!.userId,
      user_email: authRequest.user!.email,
      user_role: authRequest.user!.role as 'admin' | 'empleado',
      action: 'create_category',
      entity: 'category',
      entity_id: category.id,
      summary: `Categoría "${category.name}" creada`,
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  });
}
