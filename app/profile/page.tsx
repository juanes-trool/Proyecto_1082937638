'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';

type Me = {
  name: string;
  email: string;
  role: string;
  must_change_password?: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setMe(j.data))
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.newPassword !== form.confirm) {
      setError('La confirmación no coincide con la nueva contraseña');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'No se pudo cambiar la contraseña'); return; }
      setSuccess('Contraseña actualizada correctamente');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      if (me?.must_change_password) {
        setTimeout(() => router.push('/dashboard'), 1200);
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">Tu cuenta</p>
        <h1 className="font-display text-3xl text-brand-900">Perfil</h1>

        {me && (
          <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-ink-soft">Nombre</span><p className="font-semibold text-ink">{me.name}</p></div>
              <div><span className="text-ink-soft">Correo</span><p className="font-semibold text-ink">{me.email}</p></div>
              <div><span className="text-ink-soft">Rol</span><p className="font-semibold text-ink capitalize">{me.role}</p></div>
            </div>
          </div>
        )}

        {me?.must_change_password && (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            🔒 Debes cambiar tu contraseña temporal antes de continuar.
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl text-brand-900">Cambiar contraseña</h2>
          <p className="mt-1 text-sm text-ink-soft">Mínimo 8 caracteres, con al menos una letra y un número.</p>

          {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          {success && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

          <form onSubmit={submit} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Contraseña actual</span>
              <input type="password" className="field" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Nueva contraseña</span>
              <input type="password" className="field" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Confirmar nueva contraseña</span>
              <input type="password" className="field" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </label>
            <button type="submit" disabled={saving} className="btn-brand">{saving ? 'Guardando…' : 'Actualizar contraseña'}</button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
