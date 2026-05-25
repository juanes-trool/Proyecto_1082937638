// components/admin/ReportFilters.tsx
// Filtros para reportes (fechas, tipos)

'use client';

import { useState } from 'react';

type ReportType = 'inventory' | 'top-products' | 'by-period';

interface ReportFiltersProps {
  onTypeChange: (type: ReportType) => void;
  onDateChange?: (from: string, to: string) => void;
  selectedType: ReportType;
  selectedFrom?: string;
  selectedTo?: string;
  isLoading?: boolean;
  onExport?: (type: ReportType, from?: string, to?: string) => void;
}

export function ReportFilters({
  onTypeChange,
  onDateChange,
  selectedType,
  selectedFrom,
  selectedTo,
  isLoading = false,
  onExport,
}: ReportFiltersProps) {
  const [from, setFrom] = useState(selectedFrom || getDefaultFrom());
  const [to, setTo] = useState(selectedTo || new Date().toISOString().split('T')[0]);

  function getDefaultFrom(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  const handleApplyDates = () => {
    if (onDateChange) {
      onDateChange(from, to);
    }
  };

  const reportTypes: { id: ReportType; name: string; description: string }[] = [
    {
      id: 'inventory',
      name: 'Inventario',
      description: 'Estado actual de todos los productos',
    },
    {
      id: 'top-products',
      name: 'Top Productos',
      description: 'Productos más pedidos en un período',
    },
    {
      id: 'by-period',
      name: 'Por Período',
      description: 'Historial de órdenes en un rango de fechas',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      {/* Selección de tipo de reporte */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tipo de Reporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id)}
              className={`p-4 rounded-lg border-2 text-left transition ${
                selectedType === type.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <p className="font-semibold text-gray-900">{type.name}</p>
              <p className="text-xs text-gray-600 mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros de fecha (excepto para inventario) */}
      {selectedType !== 'inventory' && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Período</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleApplyDates}
            disabled={isLoading}
            className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Aplicar fechas
          </button>
        </div>
      )}

      {/* Botón de exportación */}
      <div className="flex gap-3">
        <button
          onClick={() => onExport?.(selectedType, selectedType !== 'inventory' ? from : undefined, selectedType !== 'inventory' ? to : undefined)}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin">⟳</span> Exportando...
            </>
          ) : (
            <>
              📥 Exportar CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
}
