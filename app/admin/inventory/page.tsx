'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout';
import type { Product, Category } from '@/lib/types';

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

type FormState = {
  name: string;
  brand: string;
  description: string;
  category_id: string;
  price: string;
  current_stock: string;
  min_stock: string;
};

const emptyForm: FormState = {
  name: '', brand: '', description: '', category_id: '',
  price: '', current_stock: '', min_stock: '5',
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // modal crear/editar
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // modal stock
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockForm, setStockForm] = useState({ type: 'entrada', quantity: '', reason: '' });

  const categoryName = useMemo(() => {
    const m = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => m.get(id) ?? '—';
  }, [categories]);

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
      if (p.ok) setProducts((await p.json()).data ?? []);
      if (c.ok) setCategories((await c.json()).data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? '' });
    setImageFile(null); setImagePreview(null); setFormError('');
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, brand: p.brand ?? '', description: p.description ?? '',
      category_id: p.category_id, price: String(p.price),
      current_stock: String(p.current_stock), min_stock: String(p.min_stock),
    });
    setImageFile(null); setImagePreview(p.image_url ?? null); setFormError('');
    setShowForm(true);
  };

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('brand', form.brand.trim());
      fd.append('description', form.description.trim());
      fd.append('category_id', form.category_id);
      fd.append('price', form.price);
      fd.append('min_stock', form.min_stock || '5');
      if (!editing) fd.append('current_stock', form.current_stock || '0');
      if (imageFile) fd.append('image', imageFile);

      const url = editing ? `/api/products/${editing.id}` : '/api/products';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? 'Error al guardar'); return; }

      setShowForm(false);
      flash(editing ? 'Producto actualizado' : 'Producto creado');
      load();
    } catch {
      setFormError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción lo desactiva del catálogo.`)) return;
    const res = await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { flash(data.error ?? 'No se pudo eliminar', false); return; }
    flash('Producto eliminado');
    load();
  };

  const submitStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;
    const res = await fetch(`/api/products/${stockProduct.id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: stockForm.type,
        quantity: Number(stockForm.quantity),
        reason: stockForm.reason,
      }),
    });
    const data = await res.json();
    if (!res.ok) { flash(data.error ?? 'Error al ajustar stock', false); return; }
    setStockProduct(null);
    setStockForm({ type: 'entrada', quantity: '', reason: '' });
    flash('Stock ajustado');
    load();
  };

  const stockBadge = (p: Product) => {
    if (p.current_stock === 0)
      return <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Sin stock</span>;
    if (p.current_stock <= p.min_stock)
      return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Stock bajo · {p.current_stock}</span>;
    return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">En stock · {p.current_stock}</span>;
  };

  return (
    <AppLayout>
      {toast && (
        <div className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Panel interno</p>
          <h1 className="font-display text-3xl text-brand-900">Inventario</h1>
          <p className="mt-1 text-sm text-ink-soft">{products.length} productos · {categories.length} categorías</p>
        </div>
        <button onClick={openCreate} className="btn-brand">+ Nuevo producto</button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-10 text-center text-ink-soft">Cargando inventario…</p>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-xl text-brand-900">Aún no hay productos</p>
            <p className="mt-2 text-sm text-ink-soft">Crea el primero para que aparezca en el catálogo.</p>
            <button onClick={openCreate} className="btn-brand mt-5">+ Nuevo producto</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-brand-50/50 text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-semibold">Producto</th>
                  <th className="px-5 py-3 font-semibold">Categoría</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-brand-100 bg-brand-50">
                          {p.image_url
                            ? <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                            : <div className="flex h-full w-full items-center justify-center text-brand-300">💄</div>}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{p.name}</p>
                          {p.brand && <p className="text-xs text-ink-soft">{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{categoryName(p.category_id)}</td>
                    <td className="px-5 py-3 font-semibold text-ink">{cop.format(p.price)}</td>
                    <td className="px-5 py-3">{stockBadge(p)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setStockProduct(p)} className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">Stock</button>
                        <button onClick={() => openEdit(p)} className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">Editar</button>
                        <button onClick={() => remove(p)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-brand-900">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
            {formError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
            <form onSubmit={submitForm} className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-brand-100 bg-brand-50">
                  {imagePreview
                    ? <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-2xl text-brand-300">💄</div>}
                </div>
                <label className="cursor-pointer rounded-lg border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                  {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                  <input type="file" accept="image/*" onChange={onImage} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre"><input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
                <Field label="Marca"><input className="field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Field>
              </div>

              <Field label="Categoría">
                <select className="field" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                  <option value="">Selecciona…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>

              <Field label="Descripción">
                <textarea className="field" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Precio (COP)"><input className="field" type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></Field>
                {!editing && <Field label="Stock inicial"><input className="field" type="number" min="0" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: e.target.value })} required /></Field>}
                <Field label="Stock mín."><input className="field" type="number" min="0" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} /></Field>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-brand-50">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-brand">{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal stock */}
      {stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setStockProduct(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-brand-900">Ajustar stock</h2>
            <p className="mt-1 text-sm text-ink-soft">{stockProduct.name} · actual: {stockProduct.current_stock}</p>
            <form onSubmit={submitStock} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <select className="field" value={stockForm.type} onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })}>
                    <option value="entrada">Entrada (+)</option>
                    <option value="salida">Salida (−)</option>
                  </select>
                </Field>
                <Field label="Cantidad"><input className="field" type="number" min="1" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required /></Field>
              </div>
              <Field label="Motivo"><input className="field" value={stockForm.reason} onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })} placeholder="Ej: compra a proveedor" required /></Field>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setStockProduct(null)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-brand-50">Cancelar</button>
                <button type="submit" className="btn-brand">Aplicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
