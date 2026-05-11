// app/api/system/mode/route.ts
// GET /api/system/mode - Get current system mode

import { NextRequest, NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const mode = await getSystemMode();
    return NextResponse.json({
      success: true,
      mode,
    });
  } catch (error) {
    console.error('Error getting system mode:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
