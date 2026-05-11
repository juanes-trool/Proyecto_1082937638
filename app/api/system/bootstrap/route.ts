// app/api/system/bootstrap/route.ts
// POST /api/system/bootstrap - Bootstrap the database

import { NextRequest, NextResponse } from 'next/server';
import { runMigrations } from '@/lib/pgMigrate';
import { resetSystemMode } from '@/lib/dataService';
import { getSeedUsers, getSeedSystemConfig, getSeedCategories } from '@/lib/seedReader';
import { supabaseServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if bootstrap token is provided (security measure)
    const token = request.headers.get('x-bootstrap-token');
    const expectedToken = process.env.ADMIN_BOOTSTRAP_SECRET;

    if (token !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized bootstrap attempt' },
        { status: 401 }
      );
    }

    // Step 1: Run migrations
    const migrationResult = await runMigrations();
    if (!migrationResult.success) {
      return NextResponse.json(
        { success: false, error: migrationResult.message },
        { status: 500 }
      );
    }

    // Step 2: Insert seed data (users, system config, categories)
    const users = getSeedUsers();
    if (users.length > 0) {
      const user = users[0];
      if (user) {
        const { error } = await supabaseServiceClient
          .from('users')
          .upsert([
            {
              email: user.email,
              password_hash: user.password_hash,
              name: user.name,
              role: user.role,
              must_change_password: user.must_change_password || false,
            },
          ]);

        if (error) {
          console.error('Error inserting seed user:', error);
        }
      }
    }

    // Insert system config
    const config = getSeedSystemConfig();
    for (const [key, value] of Object.entries(config)) {
      await supabaseServiceClient
        .from('system_config')
        .upsert([
          {
            key,
            value: JSON.stringify(value),
          },
        ]);
    }

    // Insert categories
    const categories = getSeedCategories();
    if (categories.length > 0) {
      const { error: categoryError } = await supabaseServiceClient
        .from('categories')
        .upsert(categories.map((cat) => ({ name: cat.name, description: cat.description })));

      if (categoryError) {
        console.error('Error inserting seed categories:', categoryError);
      }
    }

    // Reset system mode cache so it detects live mode
    resetSystemMode();

    return NextResponse.json({
      success: true,
      message: 'Bootstrap completed successfully',
      migration: migrationResult.message,
    });
  } catch (error) {
    console.error('Bootstrap error:', error);
    return NextResponse.json(
      { success: false, error: 'Bootstrap failed' },
      { status: 500 }
    );
  }
}
