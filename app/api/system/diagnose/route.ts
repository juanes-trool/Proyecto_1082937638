// app/api/system/diagnose/route.ts
// GET /api/system/diagnose - System diagnostics

import { NextRequest, NextResponse } from 'next/server';
import { getSystemHealth } from '@/lib/dataService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isDatabaseInitialized } from '@/lib/pgMigrate';
import { isAuditConfigured } from '@/lib/auditService';

export async function GET(request: NextRequest) {
  try {
    const health = await getSystemHealth();
    const dbInit = await isDatabaseInitialized();

    return NextResponse.json({
      success: true,
      diagnostics: {
        systemMode: health.mode,
        supabaseConfigured: isSupabaseConfigured(),
        databaseInitialized: dbInit,
        auditConfigured: isAuditConfigured(),
        categoriesCount: health.categories,
        defaultMinStock: health.defaultMinStock,
        // Presencia de variables (solo booleanos, sin exponer valores)
        env: {
          NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    console.error('Diagnostics error:', error);
    return NextResponse.json(
      { success: false, error: 'Diagnostics failed' },
      { status: 500 }
    );
  }
}
