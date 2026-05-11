// components/layout/SeedModeBanner.tsx
'use client';

import React, { useEffect, useState } from 'react';

export const SeedModeBanner: React.FC = () => {
  const [mode, setMode] = useState<'seed' | 'live' | null>(null);

  useEffect(() => {
    const checkMode = async () => {
      try {
        const response = await fetch('/api/system/mode');
        const data = await response.json();
        setMode(data.mode);
      } catch (error) {
        console.error('Error checking system mode:', error);
      }
    };

    checkMode();
  }, []);

  if (mode !== 'seed') {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-800">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-semibold">Modo Semilla (Demo)</p>
          <p className="text-sm text-amber-700">
            La base de datos no ha sido inicializada. Los datos se cargan desde el archivo de configuración.
            Ve a <span className="font-mono bg-amber-100 px-1 rounded">/admin/db-setup</span> para ejecutar el bootstrap.
          </p>
        </div>
      </div>
    </div>
  );
};
