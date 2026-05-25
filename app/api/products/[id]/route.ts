// app/api/products/[id]/route.ts
// GET /api/products/[id] — obtener producto por id (autenticado)
// PATCH /api/products/[id] — editar producto (admin)
// DELETE /api/products/[id] — eliminar producto (admin)

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { getProductById, updateProduct, deleteProduct, recordAudit } from '@/lib/dataService';
import { updateProductSchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withAuth(request, async () => {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    const { id } = await params;

    const formData = await authRequest.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ success: false, error: 'Formato de petición inválido' }, { status: 400 });
    }

    const raw = {
      category_id: formData.get('category_id') || undefined,
      name: formData.get('name') || undefined,
      description: formData.get('description') || undefined,
      brand: formData.get('brand') || undefined,
      price: formData.get('price') ? Number(formData.get('price')) : undefined,
      min_stock: formData.get('min_stock') ? Number(formData.get('min_stock')) : undefined,
      is_active: formData.get('is_active') ? formData.get('is_active') === 'true' : undefined,
    };

    // Remover undefined para que Zod no las valide
    const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined));

    const parsed = updateProductSchema.safeParse(cleaned);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
        { status: 400 }
      );
    }

    // Procesar imagen si viene en el formulario
    let imageBuffer: Buffer | undefined;
    let imageName: string | undefined;
    let imageType: string | undefined;

    const imageFile = formData.get('image');
    if (imageFile && imageFile instanceof File) {
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ success: false, error: 'El archivo debe ser una imagen' }, { status: 400 });
      }
      if (imageFile.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ success: false, error: 'La imagen no puede superar 5 MB' }, { status: 400 });
      }
      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      imageName = imageFile.name;
      imageType = imageFile.type;
    }

    try {
      const product = await updateProduct(id, authRequest.user!.userId, parsed.data, imageBuffer, imageName, imageType);

      if (!product) {
        return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
      }

      await recordAudit({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        user_id: authRequest.user!.userId,
        user_email: authRequest.user!.email,
        user_role: authRequest.user!.role as 'admin' | 'empleado',
        action: 'update_product',
        entity: 'product',
        entity_id: product.id,
        summary: `Producto "${product.name}" actualizado`,
      });

      return NextResponse.json({ success: true, data: product });
    } catch (err) {
      if (err instanceof Error && err.message === 'DUPLICATE_NAME') {
        return NextResponse.json(
          { success: false, error: 'Ya existe un producto con ese nombre en esta categoría' },
          { status: 409 }
        );
      }
      throw err;
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    const { id } = await params;

    const result = await deleteProduct(id, authRequest.user!.userId);

    if (!result.ok) {
      if (result.reason === 'has_active_orders') {
        // Contar pedidos activos para el mensaje
        return NextResponse.json(
          { success: false, error: 'Este producto tiene pedidos activos y no puede eliminarse', reason: 'has_active_orders' },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: false, error: 'No se pudo eliminar el producto' }, { status: 500 });
    }

    await recordAudit({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: authRequest.user!.userId,
      user_email: authRequest.user!.email,
      user_role: authRequest.user!.role as 'admin' | 'empleado',
      action: 'delete_product',
      entity: 'product',
      entity_id: id,
      summary: `Producto "${id}" eliminado`,
    });

    return NextResponse.json({ success: true });
  });
}
