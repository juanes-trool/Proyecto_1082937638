'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { PublicProduct } from '@/lib/types';

type OrderFormProps = {
  product: PublicProduct;
};

export function OrderForm({ product }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    quantity: 1,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = name === 'quantity' ? parseInt(value, 10) || 1 : value;
    setFormData((prev) => ({ ...prev, [name]: numValue }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/public/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: formData.quantity,
          customerName: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al procesar el pedido');
        return;
      }

      // Redirigir a confirmación
      router.push(`/order/confirm?orderId=${data.data.id}`);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const maxQuantity = product.current_stock;
  const isQuantityValid = formData.quantity > 0 && formData.quantity <= maxQuantity;

  const priceFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  const totalPrice = product.price * formData.quantity;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumen del producto */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">Producto seleccionado</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">{product.name}</h3>
        {product.brand && <p className="mt-1 text-sm text-slate-500">Marca: {product.brand}</p>}
        <p className="mt-3 text-2xl font-black text-rose-600">{priceFormatter.format(product.price)}</p>
        <p className="mt-2 text-xs text-slate-600">Disponible: {maxQuantity} unidades</p>
      </div>

      {/* Cantidad */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-semibold text-slate-900">
          Cantidad
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            max={maxQuantity}
            value={formData.quantity}
            onChange={handleChange}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium ${
              !isQuantityValid && formData.quantity > 0
                ? 'border-rose-300 bg-rose-50 text-rose-900'
                : 'border-slate-200 bg-white text-slate-900'
            }`}
          />
          <span className="text-right text-sm font-semibold text-slate-600">
            Total: {priceFormatter.format(totalPrice)}
          </span>
        </div>
        {!isQuantityValid && formData.quantity > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-rose-600">
            <AlertTriangle size={14} /> Solo hay {maxQuantity} unidades disponibles
          </p>
        )}
      </div>

      {/* Nombre del cliente */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-semibold text-slate-900">
          Tu nombre
        </label>
        <input
          type="text"
          id="customerName"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          required
          placeholder="Juan Pérez"
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-slate-900">
          Teléfono
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+57 300 123 4567"
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400"
        />
      </div>

      {/* Dirección */}
      <div>
        <label htmlFor="address" className="block text-sm font-semibold text-slate-900">
          Dirección de entrega
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Calle 10 #20-30, Apartamento 502"
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400"
        />
      </div>

      {/* Observaciones */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-slate-900">
          Observaciones (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Instrucciones especiales para la entrega..."
          rows={2}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-900">{error}</p>
        </div>
      )}

      {/* Botón enviar */}
      <button
        type="submit"
        disabled={loading || !isQuantityValid}
        className={`w-full rounded-lg px-6 py-4 text-center font-semibold transition ${
          loading || !isQuantityValid
            ? 'cursor-not-allowed bg-slate-200 text-slate-500'
            : 'bg-rose-500 text-white hover:bg-rose-600'
        }`}
      >
        {loading ? 'Procesando…' : 'Confirmar pedido'}
      </button>

      {/* Link volver */}
      <p className="text-center text-sm text-slate-600">
        <a href="/catalog" className="font-semibold text-rose-600 hover:text-rose-700">
          ← Volver al catálogo
        </a>
      </p>
    </form>
  );
}
