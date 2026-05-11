// app/api/auth/change-password/route.ts
// POST /api/auth/change-password - Change user password

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { findUserById, updateUserPassword } from '@/lib/dataService';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current and new password required' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password must be different' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid current password' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    const updated = await updateUserPassword(user.id, hashedPassword);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
