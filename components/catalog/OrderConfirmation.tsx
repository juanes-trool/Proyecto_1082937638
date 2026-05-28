'use client';

import Link from 'next/link';
import { Check, Info, ArrowLeft, Home } from 'lucide-react';
import { Order } from '@/lib/types';

type OrderConfirmationProps = { order: Order };

// Piezas de confeti deterministas (evita mismatch de hidratación)
const CONFETTI = [
  { left: '6%', delay: '0s', color: '#F43F5E' }, { left: '16%', delay: '0.25s', color: '#D946EF' },
  { left: '26%', delay: '0.1s', color: '#E7C8A0' }, { left: '36%', delay: '0.4s', color: '#FB7193' },
  { left: '46%', delay: '0.15s', color: '#F43F5E' }, { left: '56%', delay: '0.5s', color: '#D946EF' },
  { left: '66%', delay: '0.05s', color: '#E7C8A0' }, { left: '76%', delay: '0.35s', color: '#FB7193' },
  { left: '86%', delay: '0.2s', color: '#F43F5E' }, { left: '94%', delay: '0.45s', color: '#D946EF' },
  { left: '11%', delay: '0.55s', color: '#FB7193' }, { left: '71%', delay: '0.6s', color: '#E7C8A0' },
];

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const createdDate = new Date(order.created_at).toLocaleString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="relative mx-auto max-w-2xl space-y-8">
      {/* Confeti */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span key={i} className="confetti-piece" style={{ left: c.left, animationDelay: c.delay, background: c.color }} />
        ))}
      </div>

      <div className="flex justify-center animate-rise">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check size={48} strokeWidth={2.5} />
        </div>
      </div>

      <div className="text-center animate-rise">
        <h1 className="font-display text-4xl text-brand-900 sm:text-5xl">¡Tu pedido fue recibido!</h1>
        <p className="mt-4 text-lg text-ink-soft">Gracias por tu compra. Recibirás confirmación en tu teléfono.</p>
      </div>

      <div className="rounded-3xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-pink-50 p-10 text-center animate-rise">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Número de pedido</p>
        <p className="mt-3 font-mono text-5xl font-black text-brand-600">#{orderNumber}</p>
        <p className="mt-4 text-xs text-ink-soft">{createdDate}</p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-soft">Detalles</h2>
        <div className="mt-6 space-y-4 border-t border-brand-50 pt-6">
          <Row label="Producto" value={order.product_name_snapshot} />
          <Row label="Cantidad" value={`${order.quantity} unidad(es)`} />
          <Row label="Precio unitario" value={cop.format(order.unit_price_snapshot)} />
          <div className="flex items-center justify-between border-t border-brand-50 pt-4">
            <span className="font-semibold text-ink">Total</span>
            <span className="font-display text-2xl text-brand-600">{cop.format(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-soft">Información de entrega</h2>
        <div className="mt-6 grid gap-4 border-t border-brand-50 pt-6 sm:grid-cols-2">
          <Field label="Nombre" value={order.customer_name} />
          <Field label="Teléfono" value={order.phone} />
          <Field label="Dirección" value={order.address} full />
          {order.notes && <Field label="Observaciones" value={order.notes} full />}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-500" />
        <p className="text-sm text-ink-soft">
          <strong className="text-ink">Próximos pasos:</strong> el vendedor confirmará tu pedido por teléfono. El envío se realizará según los tiempos acordados.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/catalog" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-4 text-center font-semibold text-brand-700 transition hover:bg-brand-50">
          <ArrowLeft size={16} /> Seguir comprando
        </Link>
        <Link href="/catalog" className="btn-brand flex-1">
          <Home size={16} /> Ir al catálogo
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-soft">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-ink">{value}</p>
    </div>
  );
}
