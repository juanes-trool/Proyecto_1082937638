// app/admin/reports/page.tsx
// Panel de reportes (admin)

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { ReportFilters } from '@/components/admin/ReportFilters';
import type { InventoryReportRow, TopProductRow, OrderReportRow } from '@/lib/types';

type ReportType = 'inventory' | 'top-products' | 'by-period';

interface ReportData {
  type: ReportType;
  data: (InventoryReportRow | TopProductRow | OrderReportRow)[];
  count: number;
  generatedAt: string;
  period?: { from: string; to: string };
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>('inventory');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState(getDefaultFrom());
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportingProgress, setExportingProgress] = useState(false);

  function getDefaultFrom(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  // Cargar datos del reporte
  const loadReport = async (type: ReportType, from?: string, to?: string) => {
    setIsLoading(true);
    try {
      let endpoint = `/api/reports/${type}`;
      if (type !== 'inventory' && from && to) {
        endpoint += `?from=${from}&to=${to}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Error cargando reporte');
      }

      const data = await response.json();
      if (data.success) {
        setReportData({
          type: data.type,
          data: data.data,
          count: data.count,
          generatedAt: data.generatedAt,
          period: data.period,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar reporte inicial
  useEffect(() => {
    loadReport(reportType);
  }, []);

  // Cambiar tipo de reporte
  const handleTypeChange = (type: ReportType) => {
    setReportType(type);
    loadReport(type, type !== 'inventory' ? fromDate : undefined, type !== 'inventory' ? toDate : undefined);
  };

  // Cambiar fechas
  const handleDateChange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    loadReport(reportType, from, to);
  };

  // Exportar CSV
  const handleExport = async (type: ReportType, from?: string, to?: string) => {
    setExportingProgress(true);
    try {
      let url = `/api/reports/export?type=${type}&format=csv`;
      if (type !== 'inventory' && from && to) {
        url += `&from=${from}&to=${to}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'text/csv' },
      });

      if (!response.ok) {
        throw new Error('Error exportando reporte');
      }

      // Obtener el nombre del archivo del header
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] || `reporte-${type}.csv`;

      // Descargar el archivo
      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_blob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_blob);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al exportar el reporte');
    } finally {
      setExportingProgress(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes</h1>
        <p className="text-gray-600 mb-6">
          Analiza el desempeño del negocio con reportes de inventario, productos populares y órdenes.
        </p>

        {/* Filtros y selector de tipo */}
        <ReportFilters
          selectedType={reportType}
          selectedFrom={fromDate}
          selectedTo={toDate}
          onTypeChange={handleTypeChange}
          onDateChange={handleDateChange}
          isLoading={isLoading}
          onExport={handleExport}
        />

        {/* Vista previa de datos */}
        {reportData && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {reportType === 'inventory' && 'Inventario Actual'}
                {reportType === 'top-products' && 'Productos Más Pedidos'}
                {reportType === 'by-period' && 'Órdenes del Período'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Total de registros: {reportData.count} |Generado: {new Date(reportData.generatedAt).toLocaleString('es-CO')}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {reportType === 'inventory' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Marca</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Categoría</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Mínimo</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Precio</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Estado</th>
                      </>
                    )}
                    {reportType === 'top-products' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Producto</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Cantidad Total</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Número Pedidos</th>
                      </>
                    )}
                    {reportType === 'by-period' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Cliente</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Cantidad</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Precio Unit.</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      {reportType === 'inventory' && (
                        <>
                          <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                            {(row as InventoryReportRow).name}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {(row as InventoryReportRow).brand || '—'}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {(row as InventoryReportRow).category_name}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-900 font-semibold">
                            {(row as InventoryReportRow).current_stock}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-600">
                            {(row as InventoryReportRow).min_stock}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-900 font-semibold">
                            ${(row as InventoryReportRow).price.toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                (row as InventoryReportRow).is_available
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {(row as InventoryReportRow).is_available ? 'En stock' : 'Sin stock'}
                            </span>
                          </td>
                        </>
                      )}
                      {reportType === 'top-products' && (
                        <>
                          <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                            {(row as TopProductRow).product_name_snapshot}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-900 font-semibold">
                            {(row as TopProductRow).total_quantity}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-600">
                            {(row as TopProductRow).order_count}
                          </td>
                        </>
                      )}
                      {reportType === 'by-period' && (
                        <>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {new Date((row as OrderReportRow).created_at).toLocaleDateString('es-CO')}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                            {(row as OrderReportRow).product_name_snapshot}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {(row as OrderReportRow).customer_name}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-900">
                            {(row as OrderReportRow).quantity}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-600">
                            ${(row as OrderReportRow).unit_price_snapshot.toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-900 font-semibold">
                            ${(row as OrderReportRow).total.toFixed(2)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reportData.count > 10 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                Mostrando 10 de {reportData.count} registros. Descarga el CSV para ver todos los datos.
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-500 animate-pulse">Generando reporte...</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
