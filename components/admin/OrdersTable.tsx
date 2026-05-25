// components/admin/OrdersTable.tsx
// Tabla de órdenes con acciones (admin, empleado)

'use client';

import { useState } from 'react';
import { Order, OrderStatus } from '@/lib/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
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

export function OrdersTable({
  orders,
  isLoading = false,
  onStatusChange,
}: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleStatusClick = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleConfirmStatus = (newStatus: OrderStatus) => {
    if (selectedOrder && onStatusChange) {
      onStatusChange(selectedOrder.id, newStatus);
      setShowModal(false);
      setSelectedOrder(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500">Cargando órdenes...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No hay órdenes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pedido #</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cantidad</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono text-gray-700">
                #{order.id.substring(0, 8).toUpperCase()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {order.product_name_snapshot}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {order.customer_name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {order.phone}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-700">
                {order.quantity} unidad{order.quantity !== 1 ? 'es' : ''}
              </td>
              <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                ${order.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </td>
              <td className="px-4 py-3 text-sm">
                <button
                  onClick={() => handleStatusClick(order)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition ${
                    STATUS_COLORS[order.status]
                  }`}
                >
                  {STATUS_LABELS[order.status]}
                </button>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString('es-CO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de cambio de estado */}
      {showModal && selectedOrder && (
        <StatusTransitionModal
          order={selectedOrder}
          onConfirm={handleConfirmStatus}
          onCancel={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

// StatusTransitionModal subcomponente
interface StatusTransitionModalProps {
  order: Order;
  onConfirm: (newStatus: OrderStatus) => void;
  onCancel: () => void;
}

function StatusTransitionModal({
  order,
  onConfirm,
  onCancel,
}: StatusTransitionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [confirmCancelation, setConfirmCancelation] = useState(false);

  // Determinar estados posibles según el estado actual
  const getAvailableStates = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'pendiente':
        return ['en_proceso', 'cancelado'];
      case 'en_proceso':
        return ['entregado', 'cancelado'];
      case 'entregado':
        return [];
      case 'cancelado':
        return [];
      default:
        return [];
    }
  };

  const availableStates = getAvailableStates(order.status);
  const isAttemptingCancelation = selectedStatus === 'cancelado';
  const isInProcesoCancelation = order.status === 'en_proceso' && isAttemptingCancelation;

  const handleConfirm = () => {
    if (!selectedStatus) return;
    if (isInProcesoCancelation && !confirmCancelation) return;
    onConfirm(selectedStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Cambiar estado del pedido #{order.id.substring(0, 8).toUpperCase()}
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          Estado actual: <span className={`font-semibold ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </p>

        <div className="space-y-3 mb-6">
          {availableStates.length > 0 ? (
            availableStates.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left font-semibold transition ${
                  selectedStatus === status
                    ? `${STATUS_COLORS[status]} border-current`
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay estados disponibles para este pedido</p>
          )}
        </div>

        {/* Advertencia RN-14 */}
        {isInProcesoCancelation && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
            <p className="text-sm font-semibold text-orange-800">⚠️ Advertencia</p>
            <p className="text-sm text-orange-700 mt-1">
              Este pedido ya está en proceso. Al cancelarlo, el stock <strong>NO se restaurará automáticamente</strong>. Si deseas devolver las unidades al inventario, deberás hacer un ajuste de stock manual.
            </p>
            <label className="flex items-center mt-3 text-sm text-orange-800">
              <input
                type="checkbox"
                checked={confirmCancelation}
                onChange={(e) => setConfirmCancelation(e.target.checked)}
                className="mr-2"
              />
              Entiendo que el stock no se restaurará
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedStatus || (isInProcesoCancelation && !confirmCancelation)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
