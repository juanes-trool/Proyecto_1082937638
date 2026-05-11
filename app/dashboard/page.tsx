// app/dashboard/page.tsx
// Main dashboard page

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout';
import { Card, CardBody, CardHeader, Button, EmptyState } from '@/components/ui';

interface DashboardData {
  newOrders: number;
  inProgressOrders: number;
  lowStockProducts: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // For now, we'll show placeholder data since these endpoints don't exist yet
        // They'll be implemented in later phases
        setData({
          newOrders: 5,
          inProgressOrders: 3,
          lowStockProducts: 2,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
        <p className="text-gray-600 mb-8">Resumen del estado actual de tu tienda</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* New Orders Card */}
          <Card>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pedidos Nuevos</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{data?.newOrders || 0}</p>
                </div>
                <span className="text-3xl">🆕</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">Hoy</p>
            </CardBody>
          </Card>

          {/* In Progress Orders Card */}
          <Card>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">En Proceso</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{data?.inProgressOrders || 0}</p>
                </div>
                <span className="text-3xl">⏳</span>
              </div>
              <Link
                href="/orders"
                className="text-xs text-pink-600 hover:text-pink-700 font-medium mt-4 inline-block"
              >
                Ver todos →
              </Link>
            </CardBody>
          </Card>

          {/* Low Stock Products Card */}
          <Card>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Stock Bajo</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{data?.lowStockProducts || 0}</p>
                </div>
                <span className="text-3xl">⚠️</span>
              </div>
              <Link
                href="/inventory"
                className="text-xs text-pink-600 hover:text-pink-700 font-medium mt-4 inline-block"
              >
                Revisar inventario →
              </Link>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">⚡ Acciones Rápidas</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/inventory/new"
                className="p-4 bg-gradient-to-br from-pink-50 to-fuchsia-50 border border-pink-200 rounded-lg hover:shadow-md transition-all text-center group"
              >
                <p className="text-2xl mb-2">➕</p>
                <p className="text-sm font-medium text-gray-900 group-hover:text-pink-600">Nuevo Producto</p>
              </Link>

              <Link
                href="/orders"
                className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg hover:shadow-md transition-all text-center group"
              >
                <p className="text-2xl mb-2">🛒</p>
                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">Ver Pedidos</p>
              </Link>

              <Link
                href="/inventory"
                className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:shadow-md transition-all text-center group"
              >
                <p className="text-2xl mb-2">📦</p>
                <p className="text-sm font-medium text-gray-900 group-hover:text-amber-600">Inventario</p>
              </Link>

              <Link
                href="/admin/db-setup"
                className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-lg hover:shadow-md transition-all text-center group"
              >
                <p className="text-2xl mb-2">⚙️</p>
                <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Configuración</p>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Placeholder for Future Features */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardBody>
            <div className="flex items-start gap-4">
              <span className="text-3xl">💡</span>
              <div>
                <p className="font-semibold text-blue-900">Información</p>
                <p className="text-sm text-blue-800 mt-1">
                  El dashboard completo estará disponible en la Fase 5 con gráficos de vendidores, análisis de tendencias y más.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
