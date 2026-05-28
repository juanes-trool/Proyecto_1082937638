// lib/dataService.ts
// Capa de datos unificada — UNICO punto de acceso a datos del SGIB
import { supabaseClient, supabaseServiceClient, isSupabaseConfigured } from './supabase';
import { getSeedUsers, getSeedSystemConfig, getSeedCategories } from './seedReader';
import { recordAuditEntry } from './auditService';
import { uploadProductImage, deleteProductImage } from './imageStorage';
import {
  User, SafeUser, Category, SystemConfig, AuditEntry,
  Product, ProductWithStatus, PublicProduct,
  CreateProductRequest, UpdateProductRequest, AdjustStockRequest, InventoryFilters,
} from './types';
// ---------------------------------------------------------------------------
// Modo del sistema
// ---------------------------------------------------------------------------
const SEED_ADMIN_ID = '00000000-0000-0000-0000-000000000001';
let systemMode: 'seed' | 'live' | null = null;
export const getSystemMode = async (): Promise<'seed' | 'live'> => {
  if (systemMode) return systemMode;
  if (!isSupabaseConfigured()) {
    systemMode = 'seed';
    return systemMode;
  }
  // Detección vía supabase-js (HTTPS) — fiable en serverless/Vercel, a diferencia
  // de una conexión `pg` cruda que puede fallar en cold starts. Si la tabla
  // `_migrations` responde sin error, la base ya está inicializada (modo live).
  try {
    const { error } = await supabaseServiceClient
      .from('_migrations')
      .select('filename')
      .limit(1);
    systemMode = error ? 'seed' : 'live';
    return systemMode;
  } catch {
    systemMode = 'seed';
    return systemMode;
  }
};
export const resetSystemMode = () => { systemMode = null; };
// ---------------------------------------------------------------------------
// AUTENTICACION Y USUARIOS
// ---------------------------------------------------------------------------
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const u = getSeedUsers().find((x) => x.email === email);
    if (!u) return null;
    return {
      id: SEED_ADMIN_ID,
      name: u.name,
      email: u.email,
      password_hash: u.password_hash,
      role: 'admin',
      is_active: true,
      must_change_password: u.must_change_password ?? false,
      last_login_at: null,
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabaseClient.from('users').select('*').eq('email', email).single();
  if (error || !data) return null;
  return data as User;
};
export const findUserById = async (id: string): Promise<User | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    if (id !== SEED_ADMIN_ID) return null;
    const u = getSeedUsers()[0];
    if (!u) return null;
    return {
      id: SEED_ADMIN_ID,
      name: u.name,
      email: u.email,
      password_hash: u.password_hash,
      role: 'admin',
      is_active: true,
      must_change_password: u.must_change_password ?? false,
      last_login_at: null,
      created_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabaseClient.from('users').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as User;
};
export const createUser = async (
  name: string,
  email: string,
  passwordHash: string,
  role: 'admin' | 'empleado'
): Promise<User | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;
  const { data, error } = await supabaseServiceClient
    .from('users')
    .insert({ name, email, password_hash: passwordHash, role, must_change_password: true })
    .select()
    .single();
  if (error || !data) { console.error('Error creando usuario:', error); return null; }
  return data as User;
};
export const updateUserPassword = async (userId: string, newPasswordHash: string): Promise<boolean> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return false;
  const { error } = await supabaseServiceClient
    .from('users')
    .update({ password_hash: newPasswordHash, must_change_password: false })
    .eq('id', userId);
  return !error;
};
export const listUsers = async (): Promise<SafeUser[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const u = getSeedUsers()[0];
    if (!u) return [];
    return [{
      id: SEED_ADMIN_ID,
      name: u.name,
      email: u.email,
      role: 'admin',
      is_active: true,
      must_change_password: u.must_change_password ?? false,
      last_login_at: null,
      created_at: new Date().toISOString(),
    }];
  }
  const { data, error } = await supabaseClient
    .from('users')
    .select('id,name,email,role,is_active,must_change_password,last_login_at,created_at')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as SafeUser[];
};
export const updateUser = async (
  userId: string,
  updates: { name?: string; email?: string; role?: 'admin' | 'empleado'; is_active?: boolean }
): Promise<User | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;
  const { data, error } = await supabaseServiceClient
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error || !data) { console.error('Error actualizando usuario:', error); return null; }
  return data as User;
};
export const deleteUser = async (userId: string): Promise<boolean> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return false;
  if (userId === SEED_ADMIN_ID) return false; // no eliminar admin seed
  const { error } = await supabaseServiceClient
    .from('users')
    .update({ is_active: false })
    .eq('id', userId);
  return !error;
};
export const generateTemporaryPassword = (): string => {
  // Generar contraseña temporal: 12 caracteres con mayúsculas, minúsculas y números
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
// ---------------------------------------------------------------------------
// CONFIGURACION DEL SISTEMA
// ---------------------------------------------------------------------------
export const getSystemConfig = async (): Promise<SystemConfig | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    const cfg = getSeedSystemConfig() as { default_min_stock?: number };
    return {
      id: 1,
      default_min_stock: cfg.default_min_stock ?? 5,
      updated_by: null,
      updated_at: new Date().toISOString(),
    };
  }
  const { data, error } = await supabaseClient
    .from('system_config')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .single();
  if (error || !data) return null;
  return data as SystemConfig;
};
export const updateSystemConfig = async (userId: string, default_min_stock: number): Promise<boolean> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return false;
  const { error } = await supabaseServiceClient
    .from('system_config')
    .update({ default_min_stock, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', 1);
  return !error;
};
// ---------------------------------------------------------------------------
// CATEGORIAS
// ---------------------------------------------------------------------------
export const getCategories = async (): Promise<Category[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') {
    return getSeedCategories().map((cat, i) => ({
      id: `seed-category-${i + 1}`,
      name: cat.name,
      description: cat.description ?? null,
      is_active: true,
      created_at: new Date().toISOString(),
    }));
  }
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) { console.error('Error obteniendo categorias:', error); return []; }
  return (data ?? []) as Category[];
};
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const categories = await getCategories();
  return categories.find((c) => c.id === id) ?? null;
};
export const createCategory = async (name: string, description: string): Promise<Category | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;
  const { data, error } = await supabaseServiceClient
    .from('categories')
    .insert({ name, description })
    .select()
    .single();
  if (error || !data) { console.error('Error creando categoria:', error); return null; }
  return data as Category;
};
export const updateCategory = async (id: string, name?: string, description?: string): Promise<Category | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  const { data, error } = await supabaseServiceClient
    .from('categories').update(updates).eq('id', id).select().single();
  if (error || !data) { console.error('Error actualizando categoria:', error); return null; }
  return data as Category;
};
export const deleteCategory = async (id: string): Promise<boolean> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return false;
  const { count } = await supabaseClient
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('is_active', true);
  if (count && count > 0) return false;
  const { error } = await supabaseServiceClient.from('categories').delete().eq('id', id);
  return !error;
};
// ---------------------------------------------------------------------------
// PRODUCTOS — helpers internos
// ---------------------------------------------------------------------------

const toProductWithStatus = (p: Product): ProductWithStatus => ({
  ...p,
  is_available: p.current_stock > 0, // RN-04: calculado, nunca en DB
});

// Supabase devuelve la relación embebida `categories` como objeto (FK uno-a-muchos)
// o como array según el caso; este helper extrae el nombre en ambos.
const extractCategoryName = (c: unknown): string => {
  if (Array.isArray(c)) return c[0]?.name ?? '';
  if (c && typeof c === 'object' && 'name' in c) {
    return (c as { name?: string }).name ?? '';
  }
  return '';
};

// ---------------------------------------------------------------------------
// CATÁLOGO PÚBLICO (sin autenticación)
// ---------------------------------------------------------------------------

export const getPublicCatalog = async (categoryId?: string): Promise<PublicProduct[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return [];

  let query = supabaseClient
    .from('products')
    .select(`
      id, name, brand, description, price, current_stock, image_url,
      category_id,
      categories!inner ( name )
    `)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as Array<{
    id: string; name: string; brand: string | null; description: string | null;
    price: number; current_stock: number; image_url: string | null;
    category_id: string; categories: Array<{ name: string }> | null;
  }>).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    description: p.description,
    price: p.price,
    image_url: p.image_url,
    category_id: p.category_id,
    category_name: extractCategoryName(p.categories),
    is_available: p.current_stock > 0,
    current_stock: p.current_stock,
  }));
};

export const getPublicProductById = async (id: string): Promise<PublicProduct | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;

  const { data, error } = await supabaseClient
    .from('products')
    .select(`
      id, name, brand, description, price, current_stock, image_url,
      category_id,
      categories!inner ( name )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  const p = data as {
    id: string; name: string; brand: string | null; description: string | null;
    price: number; current_stock: number; image_url: string | null;
    category_id: string; categories: Array<{ name: string }> | null;
  };

  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    description: p.description,
    price: p.price,
    image_url: p.image_url,
    category_id: p.category_id,
    category_name: extractCategoryName(p.categories),
    is_available: p.current_stock > 0,
    current_stock: p.current_stock,
  };
};

// ---------------------------------------------------------------------------
// INVENTARIO (autenticado)
// ---------------------------------------------------------------------------

export const getInventory = async (filters?: InventoryFilters): Promise<ProductWithStatus[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return [];

  let query = supabaseClient
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (filters?.category_id) query = query.eq('category_id', filters.category_id);
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
  if (filters?.in_stock) query = query.gt('current_stock', 0);

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as Product[]).map(toProductWithStatus);
};

export const getProductById = async (id: string): Promise<ProductWithStatus | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return toProductWithStatus(data as Product);
};

export const createProduct = async (
  userId: string,
  data: CreateProductRequest,
  imageBuffer?: Buffer,
  imageName?: string,
  imageType?: string,
): Promise<Product | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;

  const insertData: Record<string, unknown> = {
    ...data,
    created_by: userId,
    updated_by: userId,
  };

  const { data: created, error } = await supabaseServiceClient
    .from('products')
    .insert(insertData)
    .select()
    .single();

  if (error || !created) {
    if ((error as { code?: string } | null)?.code === '23505') {
      throw new Error('DUPLICATE_NAME'); // RN-01
    }
    console.error('Error creando producto:', error);
    return null;
  }

  const product = created as Product;

  // Subir imagen si se proporcionó
  if (imageBuffer && imageName && imageType) {
    const imageUrl = await uploadProductImage(product.id, imageName, imageBuffer, imageType);
    if (imageUrl) {
      const { error: imgError } = await supabaseServiceClient
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', product.id);
      if (!imgError) product.image_url = imageUrl;
    }
  }

  return product;
};

export const updateProduct = async (
  id: string,
  userId: string,
  data: UpdateProductRequest,
  imageBuffer?: Buffer,
  imageName?: string,
  imageType?: string,
): Promise<Product | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;

  // Obtener imagen actual para eliminarla si se sube una nueva
  const existing = await getProductById(id);
  if (!existing) return null;

  const updateData: Record<string, unknown> = {
    ...data,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  // Si hay nueva imagen, subirla y eliminar la anterior
  if (imageBuffer && imageName && imageType) {
    const newImageUrl = await uploadProductImage(id, imageName, imageBuffer, imageType);
    if (newImageUrl) {
      if (existing.image_url) await deleteProductImage(existing.image_url);
      updateData.image_url = newImageUrl;
    }
  }

  const { data: updated, error } = await supabaseServiceClient
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    if ((error as { code?: string } | null)?.code === '23505') {
      throw new Error('DUPLICATE_NAME'); // RN-01
    }
    console.error('Error actualizando producto:', error);
    return null;
  }

  return updated as Product;
};

export const deleteProduct = async (id: string, userId: string): Promise<{ ok: boolean; reason?: string }> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return { ok: false, reason: 'seed_mode' };

  // RN-05: Verificar que no haya pedidos activos
  const { count } = await supabaseClient
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)
    .in('status', ['pendiente', 'en_proceso']);

  if (count && count > 0) {
    return { ok: false, reason: 'has_active_orders' }; // RN-05
  }

  // Eliminar imagen del blob
  const product = await getProductById(id);
  if (product?.image_url) {
    await deleteProductImage(product.image_url);
  }

  // Eliminación lógica
  const { error } = await supabaseServiceClient
    .from('products')
    .update({ is_active: false, updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error eliminando producto:', error);
    return { ok: false, reason: 'db_error' };
  }

  return { ok: true };
};

export const adjustStock = async (
  id: string,
  userId: string,
  data: AdjustStockRequest,
): Promise<Product | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;

  const product = await getProductById(id);
  if (!product) return null;

  const delta = data.type === 'entrada' ? data.quantity : -data.quantity;
  const newStock = product.current_stock + delta;

  if (newStock < 0) throw new Error('INSUFFICIENT_STOCK'); // RN-03

  const { data: updated, error } = await supabaseServiceClient
    .from('products')
    .update({
      current_stock: newStock,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    console.error('Error ajustando stock:', error);
    return null;
  }

  return updated as Product;
};

export const getLowStockProducts = async (): Promise<ProductWithStatus[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return [];

  // Postgres no permite comparar dos columnas con el filtro de PostgREST,
  // así que se evalúa current_stock <= min_stock en memoria.
  const all = await getInventory();
  return all.filter((p) => p.current_stock <= p.min_stock);
};

// ---------------------------------------------------------------------------
// AUDITORIA
// ---------------------------------------------------------------------------
export const recordAudit = async (entry: AuditEntry): Promise<void> => {
  try {
    await recordAuditEntry(entry);
  } catch (error) {
    console.error('Error registrando auditoria:', error);
  }
};
export const readAuditMonth = async (yyyymm: string): Promise<AuditEntry[]> => {
  const { getAuditLog } = await import('./auditService');
  return getAuditLog(yyyymm) as Promise<AuditEntry[]>;
};
// ---------------------------------------------------------------------------
// ORDENES
// ---------------------------------------------------------------------------

import type { Order, OrderFilters, OrderReportRow, InventoryReportRow } from './types';

export const getOrders = async (filters?: OrderFilters): Promise<Order[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return [];

  let query = supabaseClient.from('orders').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.product_id) {
    query = query.eq('product_id', filters.product_id);
  }

  if (filters?.from) {
    query = query.gte('created_at', `${filters.from}T00:00:00Z`);
  }

  if (filters?.to) {
    query = query.lte('created_at', `${filters.to}T23:59:59Z`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error obteniendo órdenes:', error);
    return [];
  }

  return data as Order[];
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: string,
  userId: string
): Promise<Order | null> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return null;

  // Validar que el nuevo status sea válido
  const validStatuses = ['pendiente', 'en_proceso', 'entregado', 'cancelado'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('INVALID_STATUS');
  }

  const { data, error } = await supabaseServiceClient
    .from('orders')
    .update({
      status: newStatus,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error actualizando estado de orden:', error);
    return null;
  }

  return data as Order;
};

// ---------------------------------------------------------------------------
// REPORTES
// ---------------------------------------------------------------------------

export const getOrdersByPeriodData = async (
  from: string,
  to: string
): Promise<OrderReportRow[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return [];

  const { data, error } = await supabaseClient
    .from('orders')
    .select('created_at, product_name_snapshot, customer_name, quantity, unit_price_snapshot, total')
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error obteniendo datos de período:', error);
    return [];
  }

  return data.map((row) => ({
    created_at: row.created_at,
    product_name_snapshot: row.product_name_snapshot,
    customer_name: row.customer_name,
    quantity: row.quantity,
    unit_price_snapshot: row.unit_price_snapshot,
    total: row.total,
  })) as OrderReportRow[];
};

export const getInventoryReportData = async (): Promise<InventoryReportRow[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return [];

  const products = await getInventory();
  const categories = await getCategories();
  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.id, c.name])
  );

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category_name: categoryMap[p.category_id] || 'Sin categoría',
    current_stock: p.current_stock,
    min_stock: p.min_stock,
    price: p.price,
    is_available: p.is_available,
  })) as InventoryReportRow[];
};

export const getTopProductsData = async (
  from: string,
  to: string
): Promise<OrderReportRow[]> => {
  const mode = await getSystemMode();
  if (mode === 'seed') return [];

  const { data, error } = await supabaseClient
    .from('orders')
    .select('product_name_snapshot, quantity, customer_name, unit_price_snapshot, total, created_at')
    .gte('created_at', `${from}T00:00:00Z`)
    .lte('created_at', `${to}T23:59:59Z`)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error obteniendo datos de top productos:', error);
    return [];
  }

  return data.map((row) => ({
    created_at: row.created_at,
    product_name_snapshot: row.product_name_snapshot,
    customer_name: row.customer_name,
    quantity: row.quantity,
    unit_price_snapshot: row.unit_price_snapshot,
    total: row.total,
  })) as OrderReportRow[];
};

// ---------------------------------------------------------------------------
// HEALTH
// ---------------------------------------------------------------------------
export const getSystemHealth = async () => {
  const mode = await getSystemMode();
  const categories = await getCategories();
  const config = await getSystemConfig();
  return {
    mode,
    supabaseConfigured: isSupabaseConfigured(),
    categories: categories.length,
    defaultMinStock: config?.default_min_stock ?? 5,
  };
};
