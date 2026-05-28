// app/login/page.tsx — Acceso al panel SGIB (boutique de belleza editorial)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'No fue posible iniciar sesión');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-boutique grain relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-sm">
        {/* Marca */}
        <div className="text-center mb-7 animate-rise">
          <div className="inline-flex items-center justify-center mb-4">
            <svg width="58" height="58" viewBox="0 0 48 48" fill="none" aria-hidden="true"
                 className="drop-shadow-[0_8px_18px_rgba(244,63,94,0.45)]">
              <rect x="13" y="19" width="22" height="24" rx="5" fill="#F43F5E" />
              <rect x="13" y="19" width="22" height="24" rx="5" fill="url(#g)" fillOpacity="0.35" />
              <rect x="18" y="12" width="12" height="8" rx="2" fill="#E11D48" />
              <rect x="16" y="7" width="16" height="5" rx="2.5" fill="#9F1239" />
              <rect x="18" y="24" width="5" height="12" rx="2.5" fill="#fff" fillOpacity="0.45" />
              <defs>
                <linearGradient id="g" x1="13" y1="19" x2="35" y2="43" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fff" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#D946EF" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-brand-900 leading-none">
            SGIB
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Gestión de inventario de belleza
          </p>
        </div>

        {/* Tarjeta */}
        <div className="card-elevated card-topline p-8 animate-rise" style={{ animationDelay: '0.08s' }}>
          <h2 className="font-display text-2xl text-brand-900 mb-1">Iniciar sesión</h2>
          <p className="text-sm text-ink-soft mb-6">Bienvenido de vuelta ✨</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-sm animate-fade">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field" placeholder="admin@sgib.com" required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">
                Contraseña
              </label>
              <input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field" placeholder="••••••••" required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-brand w-full mt-2">
              {loading ? 'Iniciando sesión…' : 'Entrar al panel'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-soft mt-6 pt-5 border-t border-brand-100">
            Demo · <span className="font-medium text-brand-700">admin@sgib.com</span> / admin123
          </p>
        </div>

        <p className="text-center text-xs text-ink-soft/70 mt-6 animate-fade" style={{ animationDelay: '0.2s' }}>
          Catálogo público disponible sin iniciar sesión
        </p>
      </div>
    </div>
  );
}
