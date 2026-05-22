// app/admin/db-setup/page.tsx
// Database setup and diagnostics page

'use client';

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components/ui';

interface Diagnostics {
  systemMode: 'seed' | 'live';
  supabaseConfigured: boolean;
  databaseInitialized: boolean;
  blobConfigured: boolean;
  categoriesCount: number;
  configKeys: string[];
}

export default function DbSetupPage() {
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system/diagnose');
      const data = await response.json();
      setDiagnostics(data.diagnostics);
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
      setMessage({ type: 'error', text: 'Error cargando diagnóstico' });
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async () => {
    if (!confirm('¿Deseas ejecutar el bootstrap? Esto inicializará la base de datos con las categorías y configuración por defecto.')) {
      return;
    }

    try {
      setBootstrapping(true);
      const token = process.env.NEXT_PUBLIC_BOOTSTRAP_TOKEN || prompt('Ingresa el token de bootstrap:');

      const response = await fetch('/api/system/bootstrap', {
        method: 'POST',
        headers: { 'x-bootstrap-token': token || '' },
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(fetchDiagnostics, 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error ejecutando bootstrap' });
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
      setMessage({ type: 'error', text: 'Error ejecutando bootstrap' });
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">⚙️ Configuración de Base de Datos</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando diagnóstico...</p>
          </div>
        ) : diagnostics ? (
          <>
            {/* Diagnostics */}
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-xl font-bold">📊 Estado del Sistema</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Modo del Sistema</p>
                    <Badge
                      variant={diagnostics.systemMode === 'live' ? 'success' : 'warning'}
                    >
                      {diagnostics.systemMode === 'live' ? '🟢 Live' : '🟡 Semilla'}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Supabase Configurado</p>
                    <Badge variant={diagnostics.supabaseConfigured ? 'success' : 'danger'}>
                      {diagnostics.supabaseConfigured ? '✓ Sí' : '✗ No'}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Base de Datos Inicializada</p>
                    <Badge variant={diagnostics.databaseInitialized ? 'success' : 'danger'}>
                      {diagnostics.databaseInitialized ? '✓ Sí' : '✗ No'}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Blob Configurado</p>
                    <Badge variant={diagnostics.blobConfigured ? 'success' : 'danger'}>
                      {diagnostics.blobConfigured ? '✓ Sí' : '✗ No'}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Categorías</p>
                    <p className="text-lg font-semibold">{diagnostics.categoriesCount}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Bootstrap Section */}
            {diagnostics.systemMode === 'seed' && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <h2 className="text-xl font-bold text-amber-900">⚠️ Sistema en Modo Semilla</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-amber-800 mb-4">
                    La base de datos no ha sido inicializada. El bootstrap:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 mb-6">
                    <li><strong>Aplicará 3 migrations</strong> (usuarios, catálogo, pedidos)</li>
                    <li>Cargará <strong>1 usuario admin</strong> predeterminado</li>
                    <li>Cargará <strong>6 categorías predeterminadas</strong>: Maquillaje, Skincare, Cabello, Uñas, Fragancias, Accesorios</li>
                    <li>Configurará el umbral de stock bajo por defecto (5 unidades)</li>
                  </ul>

                  <Button
                    onClick={handleBootstrap}
                    loading={bootstrapping}
                    disabled={!diagnostics.supabaseConfigured}
                    className="w-full"
                  >
                    🚀 Ejecutar Bootstrap
                  </Button>

                  {!diagnostics.supabaseConfigured && (
                    <p className="text-sm text-amber-700 mt-3">
                      ⚠️ Supabase debe estar configurado para ejecutar bootstrap
                    </p>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Success State */}
            {diagnostics.systemMode === 'live' && (
              <Card className="border-green-200 bg-green-50">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">✅</span>
                    <div>
                      <p className="font-semibold text-green-900">Sistema Operativo</p>
                      <p className="text-green-800 text-sm">La base de datos está inicializada y lista para usar</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
