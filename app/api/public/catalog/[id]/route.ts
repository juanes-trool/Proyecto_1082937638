// app/api/public/catalog/[id]/route.ts
// GET /api/public/catalog/[id] — producto público por ID

import { NextRequest, NextResponse } from 'next/server';
import { getPublicProductById } from '@/lib/dataService';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  const product = await getPublicProductById(id);
  if (!product) {
    return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: product });
}
