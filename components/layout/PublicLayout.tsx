// components/layout/PublicLayout.tsx
// Layout público — catálogo de la tienda. Sin autenticación.
// El cliente llega desde Instagram; su primera impresión es esta barra.

'use client';

import React from 'react';
import Link from 'next/link';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF8FA' }}>
      {/* Barra superior: logo + nombre de la tienda + link discreto al panel */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ background: '#FFFFFF', borderColor: '#FCE7F3' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo SGIB + nombre de la tienda */}
          <Link href="/catalog" className="flex items-center gap-2.5">
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              aria-label="SGIB logo"
            >
              <rect x="14" y="20" width="20" height="22" rx="4" fill="#F43F5E" />
              <rect x="18" y="13" width="12" height="8" rx="2" fill="#F43F5E" />
              <rect x="16" y="9" width="16" height="5" rx="2.5" fill="#9F1239" />
              <rect x="18" y="23" width="4" height="10" rx="2" fill="white" fillOpacity="0.35" />
            </svg>
            <div>
              <span
                className="font-bold leading-none"
                style={{ color: '#9F1239', fontSize: '16px' }}
              >
                SGIB
              </span>
              <p className="text-xs leading-none mt-0.5" style={{ color: '#6B7280' }}>
                Tienda de Belleza
              </p>
            </div>
          </Link>

          {/* Link discreto al panel de administración */}
          <Link
            href="/login"
            className="text-xs transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F43F5E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
          >
            Panel de Administración
          </Link>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer mínimo */}
      <footer className="py-6 text-center text-xs" style={{ color: '#9CA3AF', borderTop: '1px solid #FCE7F3' }}>
        © 2026 SGIB — Sistema de Gestión de Inventario de Belleza
      </footer>
    </div>
  );
};
