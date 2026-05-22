// app/api/categories/[id]/route.ts
// GET /api/categories/[id]    — obtener categoría
// PUT /api/categories/[id]    — actualizar (admin)
// DELETE /api/categories/[id] — eliminar (admin)

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { getCategoryById, updateCategory, deleteCategory, recordAudit } from '@/lib/dataService';
import { updateCategorySchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withAuth(request, async () => {
    const { id } = await params;
    const category = await getCategoryById(id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    const { id } = await params;

    const body = await authRequest.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: 'Cuerpo de petición inválido' }, { status: 400 });
    }

    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    const category = await updateCategory(id, parsed.data.name, parsed.data.description);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Categoría no encontrada o error al actualizar' }, { status: 404 });
    }

    await recordAudit({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: authRequest.user!.userId,
      user_email: authRequest.user!.email,
      user_role: authRequest.user!.role as 'admin' | 'empleado',
      action: 'update_category',
      entity: 'category',
      entity_id: id,
      summary: `Categoría "${category.name}" actualizada`,
    });

    return NextResponse.json({ success: true, data: category });
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    const { id } = await params;

    const ok = await deleteCategory(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar: la categoría tiene productos activos o no existe' },
        { status: 409 }
      );
    }

    await recordAudit({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: authRequest.user!.userId,
      user_email: authRequest.user!.email,
      user_role: authRequest.user!.role as 'admin' | 'empleado',
      action: 'delete_category',
      entity: 'category',
      entity_id: id,
      summary: `Categoría ${id} eliminada`,
    });

    return NextResponse.json({ success: true, message: 'Categoría eliminada' });
  });
}
