// middleware.ts
// Route protection middleware

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './lib/auth';

// Routes that are publicly accessible (no auth required)
const PUBLIC_ROUTES = ['/', '/login', '/catalog', '/order'];

// Routes that require admin role
const ADMIN_ROUTES = ['/admin', '/reports', '/categories', '/config'];

// Routes that require authentication but not necessarily admin
const PROTECTED_ROUTES = ['/dashboard', '/inventory', '/orders', '/profile'];

/**
 * Check if a route matches a pattern
 */
const matchesRoute = (pathname: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => {
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      return pathname.startsWith(prefix);
    }
    return pathname === pattern;
  });
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify JWT
  const payload = await verifyJWT(token);

  if (!payload) {
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  // Check for admin-only routes
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Check for protected routes (any authenticated user)
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    // Already authenticated, allow
  }

  // Allow everything else if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};
