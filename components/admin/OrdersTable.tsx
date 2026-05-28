// components/admin/OrdersTable.tsx
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const STATUS_STYLE: Record<OrderStatus, string> = {
  pendiente: 'bg-violet-100 text-violet-700',
  en_proceso: 'bg-blue-100 text-blue-700',
  entregado: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-rose-100 text-rose-700',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrdersTable({ orders, isLoading = false, onStatusChange }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleConfirmStatus = (newStatus: OrderStatus) => {
    if (selectedOrder && onStatusChange) {
      onStatusChange(selectedOrder.id, newStatus);
      setShowModal(false);
      setSelectedOrder(null);
    }
  };

  if (isLoading) return <div className="flex h-40 items-center justify-center text-ink-soft">Cargando pedidos…</div>;
  if (orders.length === 0)
    return <div className="flex h-40 items-center justify-center text-ink-soft">No hay pedidos para mostrar</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-100 bg-brand-50/50 text-left text-xs uppercase tracking-wide text-ink-soft">
            <th className="px-4 py-3 font-semibold">Pedido</th>
            <th className="px-4 py-3 font-semibold">Producto</th>
            <th className="px-4 py-3 font-semibold">Cliente</th>
            <th className="px-4 py-3 font-semibold">Teléfono</th>
            <th className="px-4 py-3 text-right font-semibold">Cant.</th>
            <th className="px-4 py-3 text-right font-semibold">Total</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
              <td className="px-4 py-3 font-mono text-xs text-ink-soft">#{order.id.substring(0, 8).toUpperCase()}</td>
              <td className="px-4 py-3 font-medium text-ink">{order.product_name_snapshot}</td>
              <td className="px-4 py-3 text-ink-soft">{order.customer_name}</td>
              <td className="px-4 py-3 text-ink-soft">{order.phone}</td>
              <td className="px-4 py-3 text-right text-ink-soft">{order.quantity}</td>
              <td className="px-4 py-3 text-right font-semibold text-ink">{cop.format(order.total)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${STATUS_STYLE[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </button>
              </td>
              <td className="px-4 py-3 text-ink-soft">{new Date(order.created_at).toLocaleDateString('es-CO')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedOrder && (
        <StatusTransitionModal
          order={selectedOrder}
          onConfirm={handleConfirmStatus}
          onCancel={() => { setShowModal(false); setSelectedOrder(null); }}
        />
      )}
    </div>
  );
}

interface StatusTransitionModalProps {
  order: Order;
  onConfirm: (newStatus: OrderStatus) => void;
  onCancel: () => void;
}

function StatusTransitionModal({ order, onConfirm, onCancel }: StatusTransitionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [confirmCancelation, setConfirmCancelation] = useState(false);

  const getAvailableStates = (s: OrderStatus): OrderStatus[] => {
    if (s === 'pendiente') return ['en_proceso', 'cancelado'];
    if (s === 'en_proceso') return ['entregado', 'cancelado'];
    return [];
  };

  const availableStates = getAvailableStates(order.status);
  const isInProcesoCancelation = order.status === 'en_proceso' && selectedStatus === 'cancelado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl text-brand-900">
          Pedido #{order.id.substring(0, 8).toUpperCase()}
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          Estado actual: <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>{STATUS_LABELS[order.status]}</span>
        </p>

        <div className="mt-5 space-y-2">
          {availableStates.length > 0 ? availableStates.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${
                selectedStatus === status ? `${STATUS_STYLE[status]} border-current` : 'border-brand-100 text-ink hover:border-brand-300'
              }`}
            >
              Cambiar a: {STATUS_LABELS[status]}
            </button>
          )) : (
            <p className="text-sm text-ink-soft">Este pedido ya está finalizado; no admite más cambios.</p>
          )}
        </div>

        {isInProcesoCancelation && (
          <div className="mt-5 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
              <AlertTriangle size={15} /> Advertencia (RN-14)
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Este pedido está en proceso. Al cancelarlo, el stock <strong>NO se restaura automáticamente</strong>. Si quieres devolver las unidades, haz un ajuste de stock manual.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm text-amber-800">
              <input type="checkbox" checked={confirmCancelation} onChange={(e) => setConfirmCancelation(e.target.checked)} />
              Entiendo que el stock no se restaurará
            </label>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-brand-50">Cerrar</button>
          <button
            onClick={() => selectedStatus && onConfirm(selectedStatus)}
            disabled={!selectedStatus || (isInProcesoCancelation && !confirmCancelation)}
            className="btn-brand flex-1 disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
