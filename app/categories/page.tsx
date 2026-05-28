'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) setCategories((await res.json()).data ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setFormError(''); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, description: c.description ?? '' }); setFormError(''); setShowForm(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? 'Error al guardar'); return; }
      setShowForm(false);
      flash(editing ? 'Categoría actualizada' : 'Categoría creada');
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { flash(data.error ?? 'No se pudo eliminar', false); return; }
    flash('Categoría eliminada');
    load();
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
          <h1 className="font-display text-3xl text-brand-900">Categorías</h1>
          <p className="mt-1 text-sm text-ink-soft">{categories.length} categorías activas</p>
        </div>
        <button onClick={openCreate} className="btn-brand">+ Nueva categoría</button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-10 text-center text-ink-soft">Cargando…</p>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-xl text-brand-900">Sin categorías</p>
            <button onClick={openCreate} className="btn-brand mt-5">+ Nueva categoría</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 bg-brand-50/50 text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Descripción</th>
                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
                  <td className="px-5 py-3 font-semibold text-ink">{c.name}</td>
                  <td className="px-5 py-3 text-ink-soft">{c.description || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">Editar</button>
                      <button onClick={() => remove(c)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-brand-900">{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
            {formError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
            <form onSubmit={submit} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Nombre</span>
                <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Descripción</span>
                <textarea className="field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-brand-50">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-brand">{saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
