// middleware.ts
// Protección de rutas — separación público/privado del SGIB

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './lib/auth';

/**
 * Rutas públicas: accesibles SIN autenticación.
 * El catálogo, el formulario de pedido y las API públicas son la cara
 * pública del sistema — un cliente las abre desde Instagram sin cuenta.
 */
const PUBLIC_PREFIXES = [
  '/catalog',       // /catalog y /catalog/*
  '/order',         // /order/* (formulario de pedido)
  '/api/public',    // /api/public/* (catálogo + pedido públicos)
  '/login',
  '/_next',
  '/favicon.ico',
  '/public',
];

/**
 * Rutas exclusivas del admin
 */
const ADMIN_PREFIXES = [
  '/admin',
  '/reports',
  '/categories',
  '/config',
  '/api/reports',
  '/api/categories',
  '/api/users',
  '/api/audit',
];

const isPublic = (pathname: string): boolean =>
  pathname === '/' ||
  PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

const isAdminOnly = (pathname: string): boolean =>
  ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin verificar token
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Verificar token en cookie HttpOnly
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Para API routes: 401; para páginas: redirect a /login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  // Verificar rol para rutas exclusivas del admin
  if (isAdminOnly(pathname) && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto archivos estáticos de Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};


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
