// components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role: 'admin' | 'employee';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['admin', 'employee'] },
    { label: 'Inventario', href: '/inventory', icon: '📦', roles: ['admin', 'employee'] },
    { label: 'Pedidos', href: '/orders', icon: '🛒', roles: ['admin', 'employee'] },
    { label: 'Categorías', href: '/categories', icon: '🏷️', roles: ['admin'] },
    { label: 'Reportes', href: '/reports', icon: '📈', roles: ['admin'] },
    { label: 'Configuración', href: '/config', icon: '⚙️', roles: ['admin'] },
    { label: 'Admin DB', href: '/admin/db-setup', icon: '🗄️', roles: ['admin'] },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-700">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="text-3xl">✨</div>
          <div>
            <h1 className="text-lg font-bold">SGIB</h1>
            <p className="text-xs text-gray-400">Panel de control</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="py-6">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-6 py-3 flex items-center gap-3 transition-colors ${
              isActive(item.href)
                ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white border-r-4 border-pink-300'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Role Badge */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gray-800 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Rol:</div>
        <div className="bg-gray-700 px-3 py-1 rounded text-sm font-medium capitalize">
          {role === 'admin' ? '👑 Administrador' : '👤 Empleado'}
        </div>
      </div>
    </aside>
  );
};
