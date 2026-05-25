'use client';

import Link from 'next/link';
import { Order } from '@/lib/types';

type OrderConfirmationProps = {
  order: Order;
};

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const priceFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const createdDate = new Date(order.created_at).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Animación de éxito */}
      <div className="flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-12 w-12 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Título de éxito */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">
          ¡Tu pedido fue recibido!
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Gracias por tu compra. Recibirás confirmación en tu teléfono.
        </p>
      </div>

      {/* Número de pedido destacado */}
      <div className="rounded-3xl border-4 border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Número de pedido</p>
        <p className="mt-3 text-5xl font-black text-rose-600 font-mono">#{orderNumber}</p>
        <p className="mt-4 text-xs text-slate-500">{createdDate}</p>
      </div>

      {/* Detalles del pedido */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Detalles</h2>
        <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Producto:</span>
            <span className="font-semibold text-slate-900">{order.product_name_snapshot}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Cantidad:</span>
            <span className="font-semibold text-slate-900">{order.quantity} unidad(es)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Precio unitario:</span>
            <span className="font-semibold text-slate-900">
              {priceFormatter.format(order.unit_price_snapshot)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total:</span>
              <span className="text-2xl font-black text-rose-600">
                {priceFormatter.format(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de entrega */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          Información de entrega
        </h2>
        <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Nombre</p>
            <p className="mt-1 text-slate-900">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Teléfono</p>
            <p className="mt-1 text-slate-900">{order.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Dirección</p>
            <p className="mt-1 text-slate-900 whitespace-pre-wrap">{order.address}</p>
          </div>
          {order.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                Observaciones
              </p>
              <p className="mt-1 text-slate-900">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de seguimiento */}
      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6">
        <p className="text-sm text-blue-900">
          ℹ️ <strong>Próximos pasos:</strong> El vendedor confirmará tu pedido por teléfono. 
          El envío se realizará según los tiempos acordados.
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/catalog"
          className="flex-1 rounded-lg border border-rose-200 bg-white px-6 py-4 text-center font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          ← Seguir comprando
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-lg bg-rose-500 px-6 py-4 text-center font-semibold text-white transition hover:bg-rose-600"
        >
          Ir al inicio
        </Link>
      </div>

      {/* Pequeño disclaimer */}
      <p className="text-center text-xs text-slate-500">
        Pedido #{orderNumber} • {createdDate}
      </p>
    </div>
  );
}
