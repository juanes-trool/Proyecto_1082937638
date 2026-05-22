// app/api/public/catalog/route.ts
// GET /api/public/catalog — catálogo público (sin autenticación)

import { NextRequest, NextResponse } from 'next/server';
import { getPublicCatalog } from '@/lib/dataService';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId') ?? undefined;

  const products = await getPublicCatalog(categoryId);
  return NextResponse.json({ success: true, data: products });
}
