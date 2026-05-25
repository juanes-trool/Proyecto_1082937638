'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuditEntry } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export default function AuditPage() {
  const router = useRouter();
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Generar lista de meses disponibles (últimos 12 meses)
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yyyymm = date.toISOString().slice(0, 7).replace('-', '');
      months.push(yyyymm);
    }
    return months;
  };

  const months = getAvailableMonths();

  // Cargar auditoría del mes seleccionado
  const loadAuditLogs = async (month: string) => {
    if (!month) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/audit?month=${month}`, { method: 'GET' });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar auditoría');
      const json = await res.json();
      setAuditLogs(json.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Inicializar con el mes actual
  useEffect(() => {
    const today = new Date();
    const initialMonth = today.toISOString().slice(0, 7).replace('-', '');
    setSelectedMonth(initialMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadAuditLogs(selectedMonth);
    }
  }, [selectedMonth]);

  // Formatear fecha
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Mapear tipos de acción a colores
  const getActionColor = (action: string): 'success' | 'warning' | 'info' | 'danger' => {
    if (action.includes('create')) return 'success';
    if (action.includes('delete')) return 'danger';
    if (action.includes('update')) return 'warning';
    return 'info';
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Auditoría del Sistema</h1>
        <p className="text-gray-600">
          Registro de todas las acciones realizadas en el sistema.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2 items-center">
        <label className="text-gray-700 font-medium">Seleccionar mes:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          {months.map((month) => {
            const year = month.slice(0, 4);
            const monthNum = month.slice(4, 6);
            const monthNames = [
              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
            ];
            const monthName = monthNames[parseInt(monthNum) - 1];
            return (
              <option key={month} value={month}>
                {monthName} {year}
              </option>
            );
          })}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando auditoría...</div>
        </div>
      ) : auditLogs.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <div className="text-gray-400 text-lg">
              No hay registros de auditoría para este período.
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Fecha y Hora</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Acción</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Rol</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Entidad</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Resumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">{formatDate(log.timestamp)}</td>
                    <td className="px-6 py-3">
                      <Badge variant={getActionColor(log.action)}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="info">
                        {log.user_role === 'admin' ? 'Admin' : log.user_role === 'empleado' ? 'Empleado' : 'Público'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">{log.entity}</td>
                    <td className="px-6 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {log.entity_id ? log.entity_id.slice(0, 8) + '...' : '-'}
                      </code>
                    </td>
                    <td className="px-6 py-3">
                      <div className="max-w-xs truncate">{log.summary}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 text-center text-gray-600 text-sm border-t">
            Total: {auditLogs.length} registros
          </div>
        </Card>
      )}
    </div>
  );
}
