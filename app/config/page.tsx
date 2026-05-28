'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SystemConfig } from '@/lib/types';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    default_min_stock: 5,
  });

  // Cargar configuración
  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config', { method: 'GET' });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar configuración');
      const json = await res.json();
      setConfig(json.data);
      setForm({ default_min_stock: json.data.default_min_stock });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Guardar configuración
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Error al guardar configuración');
        return;
      }

      const json = await res.json();
      setConfig(json.data);
      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando configuración...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración del Sistema</h1>
        <p className="text-gray-600">
          Ajusta los parámetros globales de SGIB.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <Card>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo por Defecto
            </label>
            <p className="text-gray-600 text-sm mb-3">
              Este valor se usa como referencia para alertas de stock bajo cuando se crean nuevos productos.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="100"
                value={form.default_min_stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    default_min_stock: parseInt(e.target.value) || 5,
                  })
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <span className="text-gray-500">unidades</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Información del Sistema</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Última actualización:</span>
                <p className="font-medium">
                  {config?.updated_at
                    ? new Date(config.updated_at).toLocaleDateString('es-ES')
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Actualizado por:</span>
                <p className="font-medium">{config?.updated_by || 'Sistema'}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Guardar Configuración
            </Button>
            <Button
              type="button"
              onClick={() => loadConfig()}
              className="flex-1 bg-gray-300 hover:bg-gray-400"
            >
              Descartar Cambios
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tip</h3>
        <p className="text-sm text-blue-800">
          Los cambios de configuración afectan solo a los nuevos productos. Los productos existentes mantienen su stock mínimo personalizado.
        </p>
      </div>
      </div>
    </AppLayout>
  );
}
