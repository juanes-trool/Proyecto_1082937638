// app/api/products/route.ts
// GET  /api/products — inventario (cualquier usuario autenticado)
// POST /api/products — crear producto con imagen (admin, multipart/form-data)

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, AuthenticatedRequest } from '@/lib/withAuth';
import { getInventory, createProduct, recordAudit } from '@/lib/dataService';
import { createProductSchema } from '@/lib/schemas';
import { randomUUID } from 'crypto';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withAuth(request, async () => {
    const { searchParams } = new URL(request.url);
    const products = await getInventory({
      category_id: searchParams.get('categoryId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      in_stock: searchParams.get('inStock') === 'true',
    });
    return NextResponse.json({ success: true, data: products });
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withRole(['admin'])(request, async (authRequest: AuthenticatedRequest) => {
    const formData = await authRequest.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ success: false, error: 'Formato de petición inválido' }, { status: 400 });
    }

    // Parsear campos del formulario
    const raw = {
      category_id: formData.get('category_id'),
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      brand: formData.get('brand') || undefined,
      price: Number(formData.get('price')),
      current_stock: Number(formData.get('current_stock')),
      min_stock: formData.get('min_stock') ? Number(formData.get('min_stock')) : undefined,
    };

    const parsed = createProductSchema.safeParse(raw);
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
      const product = await createProduct(
        authRequest.user!.userId,
        parsed.data,
        imageBuffer,
        imageName,
        imageType,
      );

      if (!product) {
        return NextResponse.json({ success: false, error: 'Error al crear el producto' }, { status: 500 });
      }

      await recordAudit({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        user_id: authRequest.user!.userId,
        user_email: authRequest.user!.email,
        user_role: authRequest.user!.role as 'admin' | 'empleado',
        action: 'create_product',
        entity: 'product',
        entity_id: product.id,
        summary: `Producto "${product.name}" creado`,
      });

      return NextResponse.json({ success: true, data: product }, { status: 201 });
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
