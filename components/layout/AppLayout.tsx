// components/layout/AppLayout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import type { AuthPayload } from '@/lib/types';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data ?? null);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#FFF8FA' }}>
        <div className="text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 48 48"
            fill="none"
            className="mx-auto mb-3 animate-pulse"
          >
            <rect x="14" y="20" width="20" height="22" rx="4" fill="#F43F5E" />
            <rect x="18" y="13" width="12" height="8" rx="2" fill="#F43F5E" />
            <rect x="16" y="9" width="16" height="5" rx="2.5" fill="#9F1239" />
          </svg>
          <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen" style={{ background: '#FFF8FA' }}>
      {/* Sidebar */}
      <Sidebar role={user.role} userName={user.name} />

      {/* Columna de contenido */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0" style={{ borderColor: '#FCE7F3' }}>
          <p className="text-sm text-gray-500">
            Bienvenido, <span className="font-semibold text-gray-800">{user.name}</span>
          </p>
          <button
            onClick={handleLogout}
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: '#DC2626' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Cerrar sesión
          </button>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
