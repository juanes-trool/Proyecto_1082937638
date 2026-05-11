// lib/withAuth.ts
// Middleware to protect routes and verify JWT

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './auth';
import { AuthPayload } from './types';

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthPayload;
}

/**
 * Middleware to verify JWT from cookies
 * Adds user data to request if valid
 */
export const withAuth = async (
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> => {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Create a new request with user data
    const authRequest = request as AuthenticatedRequest;
    authRequest.user = payload;

    return handler(authRequest);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
};

/**
 * Middleware to verify specific roles
 */
export const withRole = (allowedRoles: string[]) => {
  return async (
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    return withAuth(request, async (authRequest: AuthenticatedRequest) => {
      if (!authRequest.user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: No user data' },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(authRequest.user.role)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(authRequest);
    });
  };
};
