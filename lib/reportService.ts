// lib/reportService.ts
// Servicio de reportes — conversión de datos a formatos exportables (CSV)

import { supabaseClient } from './supabase';
import {
  InventoryReportRow,
  TopProductRow,
  OrderReportRow,
  ProductWithStatus,
} from './types';

// ---------------------------------------------------------------------------
// TIPOS LOCALES
// ---------------------------------------------------------------------------

interface CSVOptions {
  delimiter?: string;
  headers?: string[];
}

// ---------------------------------------------------------------------------
// FUNCIONES DE TRANSFORMACIÓN DE DATOS
// ---------------------------------------------------------------------------

/**
 * Construye reporte de inventario actual
 * Retorna: array de filas con id, name, brand, category, stock actual, mínimo, precio, disponibilidad
 */
export const buildInventoryReport = async (
  products: ProductWithStatus[],
  categoriesMap: Record<string, string>
): Promise<InventoryReportRow[]> => {
  return products
    .filter((p) => p.is_active)
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category_name: categoriesMap[p.category_id] || 'Sin categoría',
      current_stock: p.current_stock,
      min_stock: p.min_stock,
      price: p.price,
      is_available: p.is_available,
    }));
};

/**
 * Construye reporte de productos más pedidos en un período
 * Usa product_name_snapshot para preservar nombres históricos
 * Retorna: array ordenado por cantidad descendente
 */
export const buildTopProductsReport = (
  orderData: OrderReportRow[]
): TopProductRow[] => {
  const grouped = new Map<string, { total_quantity: number; order_count: number }>();

  for (const order of orderData) {
    const key = order.product_name_snapshot;
    const existing = grouped.get(key) || { total_quantity: 0, order_count: 0 };
    existing.total_quantity += order.quantity;
    existing.order_count += 1;
    grouped.set(key, existing);
  }

  return Array.from(grouped.entries())
    .map(([product_name_snapshot, stats]) => ({
      product_name_snapshot,
      ...stats,
    }))
    .sort((a, b) => b.total_quantity - a.total_quantity);
};

// ---------------------------------------------------------------------------
// CONVERSIÓN A CSV
// ---------------------------------------------------------------------------

/**
 * Convierte array de objetos a CSV
 * Incluye header row con nombres de columnas
 * Escapa comillas y saltos de línea en valores
 */
export const toCSV = (
  rows: Record<string, unknown>[],
  options: CSVOptions = {}
): string => {
  if (rows.length === 0) return '';

  const delimiter = options.delimiter || ',';
  const headers =
    options.headers ||
    Object.keys(rows[0]).map((k) =>
      k
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );

  // Escapar valores CSV
  const escapeCSVValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Header
  const csvRows = [headers.map((h) => escapeCSVValue(h)).join(delimiter)];

  // Data rows
  for (const row of rows) {
    const values = Object.keys(rows[0]).map((key) =>
      escapeCSVValue(row[key])
    );
    csvRows.push(values.join(delimiter));
  }

  return csvRows.join('\n');
};

/**
 * Convierte array a formato CSV optimizado para Excel
 * Agrega BOM para UTF-8 con caracteres especiales (acentos, ñ)
 */
export const toCSVWithBOM = (
  rows: Record<string, unknown>[],
  options: CSVOptions = {}
): Buffer => {
  const csv = toCSV(rows, options);
  // BOM para UTF-8 — asegura que Excel abra correctamente con acentos
  const bom = Buffer.from([0xef, 0xbb, 0xbf]);
  const buffer = Buffer.from(csv, 'utf8');
  return Buffer.concat([bom, buffer]);
};

// ---------------------------------------------------------------------------
// NOMBRES DE COLUMNAS PERSONALIZADAS
// ---------------------------------------------------------------------------

export const INVENTORY_HEADERS = [
  'ID Producto',
  'Nombre',
  'Marca',
  'Categoría',
  'Stock Actual',
  'Stock Mínimo',
  'Precio COP',
  'Disponible',
];

export const TOP_PRODUCTS_HEADERS = [
  'Producto',
  'Cantidad Total',
  'Número de Pedidos',
];

export const ORDER_PERIOD_HEADERS = [
  'Fecha',
  'Producto',
  'Cliente',
  'Cantidad',
  'Precio Unitario',
  'Total',
];

// ---------------------------------------------------------------------------
// GENERADORES DE REPORTES CON CSV
// ---------------------------------------------------------------------------

/**
 * Genera reporte de inventario en formato CSV
 * Incluye todos los productos activos con estado actual
 */
export const generateInventoryCSV = async (
  products: ProductWithStatus[],
  categoriesMap: Record<string, string>
): Promise<string> => {
  const reportData = await buildInventoryReport(products, categoriesMap);

  // Formatear para CSV
  const rows = reportData.map((row) => ({
    id: row.id,
    nombre: row.name,
    marca: row.brand || '—',
    categoría: row.category_name,
    stock_actual: row.current_stock,
    stock_mínimo: row.min_stock,
    precio_cop: `$${row.price.toFixed(2)}`,
    disponible: row.is_available ? 'Sí' : 'No',
  }));

  return toCSV(rows, { headers: INVENTORY_HEADERS });
};

/**
 * Genera reporte de productos más pedidos en formato CSV
 */
export const generateTopProductsCSV = (
  orderData: OrderReportRow[]
): string => {
  const reportData = buildTopProductsReport(orderData);

  const rows = reportData.map((row) => ({
    producto: row.product_name_snapshot,
    cantidad_total: row.total_quantity,
    numero_pedidos: row.order_count,
  }));

  return toCSV(rows, { headers: TOP_PRODUCTS_HEADERS });
};

/**
 * Genera reporte de órdenes por período en formato CSV
 * Usa snapshots para preservar datos históricos de precio y nombre
 */
export const generateOrderPeriodCSV = (
  orderData: OrderReportRow[]
): string => {
  const rows = orderData.map((order) => ({
    fecha: new Date(order.created_at).toLocaleDateString('es-CO'),
    producto: order.product_name_snapshot,
    cliente: order.customer_name,
    cantidad: order.quantity,
    precio_unitario: `$${order.unit_price_snapshot.toFixed(2)}`,
    total: `$${order.total.toFixed(2)}`,
  }));

  return toCSV(rows, { headers: ORDER_PERIOD_HEADERS });
};

// ---------------------------------------------------------------------------
// UTILIDADES DE NOMBRE DE ARCHIVO
// ---------------------------------------------------------------------------

/**
 * Genera nombre de archivo para descarga de reporte
 * Formato: sgib-reporte-TIPO-FECHA.csv
 */
export const generateReportFilename = (
  type: 'inventory' | 'top-products' | 'by-period',
  from?: string,
  to?: string
): string => {
  const typeLabel = {
    'inventory': 'inventario',
    'top-products': 'top-productos',
    'by-period': 'periodo',
  }[type];

  const dateStr = to
    ? `${from?.split('-').slice(1).join('-')}-a-${to?.split('-').slice(1).join('-')}`
    : new Date().toISOString().split('T')[0];

  return `sgib-reporte-${typeLabel}-${dateStr}.csv`;
};
