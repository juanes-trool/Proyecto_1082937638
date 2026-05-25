// components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/types';

interface SidebarProps {
  role: UserRole;
  userName?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',       icon: '📊', roles: ['admin', 'empleado'] },
  { label: 'Inventario',   href: '/admin/inventory', icon: '📦', roles: ['admin', 'empleado'] },
  { label: 'Pedidos',      href: '/admin/orders',    icon: '🛒', roles: ['admin', 'empleado'] },
  { label: 'Perfil',       href: '/dashboard',       icon: '👤', roles: ['admin', 'empleado'] },
  { label: 'Categorías',   href: '/dashboard',       icon: '🏷️', roles: ['admin'] },
  { label: 'Reportes',     href: '/admin/reports',   icon: '📈', roles: ['admin'] },
  { label: 'Configuración', href: '/config',         icon: '⚙️', roles: ['admin'] },
  { label: 'Usuarios',     href: '/admin/users',     icon: '👥', roles: ['admin'] },
  { label: 'Auditoría',    href: '/admin/audit',     icon: '🔍', roles: ['admin'] },
  { label: 'Base de Datos', href: '/admin/db-setup', icon: '🗄️', roles: ['admin'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, userName }) => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const filtered = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className="w-64 h-screen sticky top-0 flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(to bottom, #1F2937, #111827)' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect x="14" y="20" width="20" height="22" rx="4" fill="#F43F5E" />
            <rect x="18" y="13" width="12" height="8" rx="2" fill="#F43F5E" />
            <rect x="16" y="9" width="16" height="5" rx="2.5" fill="#9F1239" />
            <rect x="18" y="23" width="4" height="10" rx="2" fill="white" fillOpacity="0.35" />
          </svg>
          <div>
            <span className="text-white font-bold text-base leading-none">SGIB</span>
            <p className="text-xs text-gray-400 mt-0.5">Panel de control</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {filtered.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'text-white border-r-[3px] border-[#F43F5E]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            style={
              isActive(item.href)
                ? { background: 'rgba(244,63,94,0.15)' }
                : undefined
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer: rol del usuario */}
      <div className="px-5 py-4 border-t border-white/10">
        {userName && (
          <p className="text-xs text-gray-400 mb-1 truncate">{userName}</p>
        )}
        <span
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
          style={{ background: 'rgba(244,63,94,0.2)', color: '#FDA4AF' }}
        >
          {role === 'admin' ? '👑 Administrador' : '👤 Empleado'}
        </span>
      </div>
    </aside>
  );
};
