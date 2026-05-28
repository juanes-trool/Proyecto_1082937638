// app/admin/orders/page.tsx
// Panel de gestión de órdenes (admin, empleado)

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { OrdersTable } from '@/components/admin/OrdersTable';
import type { Order, OrderStatus, OrderFilters } from '@/lib/types';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Cargar órdenes
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedStatus) params.append('status', selectedStatus);
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);

        const response = await fetch(`/api/orders?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Error cargando órdenes');
        }

        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [selectedStatus, fromDate, toDate, router]);

  // Cambiar estado de orden
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          previousStatus: orders.find((o) => o.id === orderId)?.status,
        }),
      });

      if (!response.ok) {
        throw new Error('Error actualizando estado');
      }

      const data = await response.json();
      if (data.success) {
        // Actualizar orden localmente
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === orderId ? data.data : o))
        );
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  // Contar órdenes por estado
  const countByStatus = (status: OrderStatus): number => {
    return orders.filter((o) => o.status === status).length;
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Panel interno</p>
        <h1 className="font-display text-3xl text-brand-900">Gestión de pedidos</h1>
        <p className="mt-1 mb-6 text-sm text-ink-soft">
          Ve todos los pedidos y cambia su estado. Haz clic en el badge de estado.
        </p>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-yellow-700 uppercase">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{countByStatus('pendiente')}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase">En Proceso</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{countByStatus('en_proceso')}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-green-700 uppercase">Entregados</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{countByStatus('entregado')}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-red-700 uppercase">Cancelados</p>
            <p className="text-2xl font-bold text-red-900 mt-1">{countByStatus('cancelado')}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Estado</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Desde</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Hasta</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tabla de órdenes */}
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
          <OrdersTable
            orders={orders}
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </AppLayout>
  );
}
