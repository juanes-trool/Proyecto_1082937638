'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Loader2, AlertTriangle, Package, Tags,
  BarChart3, ArrowRight, Clock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout';
import type { Order, Product } from '@/lib/types';

export default function DashboardPage() {
  const [pendientes, setPendientes] = useState(0);
  const [enProceso, setEnProceso] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [oRes, pRes] = await Promise.all([fetch('/api/orders'), fetch('/api/products')]);
        if (oRes.ok) {
          const orders: Order[] = (await oRes.json()).data ?? [];
          setPendientes(orders.filter((o) => o.status === 'pendiente').length);
          setEnProceso(orders.filter((o) => o.status === 'en_proceso').length);
        }
        if (pRes.ok) {
          const products: Product[] = (await pRes.json()).data ?? [];
          setLowStock(products.filter((p) => p.current_stock <= p.min_stock).length);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: 'Pedidos pendientes', value: pendientes, Icon: ShoppingCart, href: '/admin/orders', accent: '#7C3AED', bg: '#F5F3FF' },
    { label: 'En proceso', value: enProceso, Icon: Loader2, href: '/admin/orders', accent: '#2563EB', bg: '#EFF6FF' },
    { label: 'Productos con stock bajo', value: lowStock, Icon: AlertTriangle, href: '/admin/inventory', accent: '#D97706', bg: '#FFFBEB' },
  ];

  const actions = [
    { label: 'Inventario', href: '/admin/inventory', Icon: Package },
    { label: 'Ver pedidos', href: '/admin/orders', Icon: ShoppingCart },
    { label: 'Categorías', href: '/categories', Icon: Tags },
    { label: 'Reportes', href: '/admin/reports', Icon: BarChart3 },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20 text-ink-soft">
          <Loader2 className="mr-2 animate-spin" size={18} /> Cargando dashboard…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Panel interno</p>
      <h1 className="font-display text-3xl text-brand-900">Resumen de la tienda</h1>
      <p className="mt-1 text-sm text-ink-soft">Estado actual de pedidos e inventario.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {stats.map(({ label, value, Icon, href, accent, bg }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: bg, color: accent }}>
                <Icon size={20} />
              </span>
              <ArrowRight size={18} className="text-brand-200 transition group-hover:text-brand-500" />
            </div>
            <p className="mt-4 font-display text-4xl text-brand-900">{value}</p>
            <p className="mt-1 text-sm text-ink-soft">{label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl text-brand-900">Accesos rápidos</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map(({ label, href, Icon }) => (
          <Link key={label} href={href} className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon size={18} />
            </span>
            <span className="text-sm font-semibold text-ink">{label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
        <Clock size={18} className="mt-0.5 shrink-0 text-brand-500" />
        <p className="text-sm text-ink-soft">
          Los pedidos nuevos del catálogo público entran como <strong className="text-ink">pendientes</strong>.
          Gestiónalos desde <Link href="/admin/orders" className="font-semibold text-brand-700 underline-offset-2 hover:underline">Pedidos</Link>.
        </p>
      </div>
    </AppLayout>
  );
}
