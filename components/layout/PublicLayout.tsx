// components/layout/PublicLayout.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/catalog" className="flex items-center gap-2 group">
            <div className="text-2xl">✨</div>
            <div>
              <h1 className="text-xl font-bold">SGIB</h1>
              <p className="text-pink-100 text-xs">Belleza & Cuidado Personal</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/catalog" className="hover:text-pink-100 transition-colors font-medium">
              Catálogo
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-100 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2026 SGIB — Sistema de Gestión de Inventario de Belleza</p>
          <p className="text-gray-400 text-sm mt-2">Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
};
