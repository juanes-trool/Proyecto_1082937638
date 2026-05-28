// components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Tags, BarChart3,
  User, Users, ScrollText, Database, Crown, type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

interface SidebarProps {
  role: UserRole;
  userName?: string;
}

interface NavItem {
  label: string;
  href: string;
  Icon: LucideIcon;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    href: '/dashboard',       Icon: LayoutDashboard, roles: ['admin', 'empleado'] },
  { label: 'Inventario',   href: '/admin/inventory', Icon: Package,         roles: ['admin', 'empleado'] },
  { label: 'Pedidos',      href: '/admin/orders',    Icon: ShoppingCart,    roles: ['admin', 'empleado'] },
  { label: 'Categorías',   href: '/categories',      Icon: Tags,            roles: ['admin'] },
  { label: 'Reportes',     href: '/admin/reports',   Icon: BarChart3,       roles: ['admin'] },
  { label: 'Perfil',       href: '/profile',         Icon: User,            roles: ['admin', 'empleado'] },
  { label: 'Usuarios',     href: '/admin/users',     Icon: Users,           roles: ['admin'] },
  { label: 'Auditoría',    href: '/admin/audit',     Icon: ScrollText,      roles: ['admin'] },
  { label: 'Base de Datos', href: '/admin/db-setup', Icon: Database,        roles: ['admin'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, userName }) => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const filtered = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className="w-64 h-screen sticky top-0 flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(to bottom, #4A1126, #2A0A18)' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect x="14" y="20" width="20" height="22" rx="4" fill="#F43F5E" />
            <rect x="18" y="13" width="12" height="8" rx="2" fill="#F43F5E" />
            <rect x="16" y="9" width="16" height="5" rx="2.5" fill="#FB7193" />
            <rect x="18" y="23" width="4" height="10" rx="2" fill="white" fillOpacity="0.35" />
          </svg>
          <div>
            <span className="text-white font-bold text-base leading-none" style={{ fontFamily: 'var(--font-display)' }}>SGIB</span>
            <p className="text-xs text-rose-200/60 mt-0.5">Panel de control</p>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4">
        {filtered.map(({ label, href, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'text-white border-r-[3px] border-[#F43F5E]'
                  : 'text-rose-200/60 hover:text-white hover:bg-white/5'
              }`}
              style={active ? { background: 'rgba(244,63,94,0.16)' } : undefined}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: rol */}
      <div className="px-5 py-4 border-t border-white/10">
        {userName && <p className="text-xs text-rose-200/60 mb-1 truncate">{userName}</p>}
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(244,63,94,0.22)', color: '#FDA4AF' }}
        >
          {role === 'admin' ? <Crown size={13} /> : <User size={13} />}
          {role === 'admin' ? 'Administrador' : 'Empleado'}
        </span>
      </div>
    </aside>
  );
};
