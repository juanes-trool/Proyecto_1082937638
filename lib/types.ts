// ============================================================================
// TYPES FOR SGIB - Sistema de Gestión de Inventario de Belleza
// ============================================================================

// ============================================================================
// AUTHENTICATION & USERS
// ============================================================================

export type UserRole = 'admin' | 'empleado';

export interface User {
  id: string; // UUID
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

/** Usuario sin datos sensibles — para listados y respuestas API */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface AuthPayload {
  userId: string; // UUID
  email: string;
  name: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: SafeUser;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

// ============================================================================
// SYSTEM CONFIG
// ============================================================================

export interface SystemConfig {
  id: number;
  default_min_stock: number;
  updated_by: string | null;
  updated_at: string;
}

export interface UpdateConfigRequest {
  default_min_stock: number;
}

export type SystemMode = 'seed' | 'live';

// ============================================================================
// CATEGORIES
// ============================================================================

export interface Category {
  id: string; // UUID
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// ============================================================================
// PRODUCTS
// ============================================================================

export interface Product {
  id: string; // UUID
  category_id: string;
  name: string;
  description: string | null;
  brand: string | null;
  price: number;
  current_stock: number;
  min_stock: number;
  image_url: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithStatus extends Product {
  is_available: boolean; // calculado: current_stock > 0 — RN-04
}

export interface PublicProduct {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  category_id: string;
  category_name: string;
  price: number;
  image_url: string | null;
  is_available: boolean; // calculado
  current_stock: number;
}

export interface CreateProductRequest {
  category_id: string;
  name: string;
  description?: string;
  brand?: string;
  price: number;
  current_stock: number;
  min_stock?: number;
}

export interface UpdateProductRequest {
  category_id?: string;
  name?: string;
  description?: string;
  brand?: string;
  price?: number;
  min_stock?: number;
}

export interface AdjustStockRequest {
  type: 'entrada' | 'salida';
  quantity: number;
  reason: string;
}

export interface InventoryFilters {
  category_id?: string;
  search?: string;
  in_stock?: boolean;
}

// ============================================================================
// ORDERS
// ============================================================================

export type OrderStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

export interface Order {
  id: string; // UUID
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  total: number;
  customer_name: string;
  phone: string;
  address: string;
  notes: string | null;
  status: OrderStatus;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithProduct extends Order {
  product?: Product;
}

export interface PlaceOrderRequest {
  productId: string;
  quantity: number;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  from?: string;
  to?: string;
  product_id?: string;
}

// ============================================================================
// REPORTS
// ============================================================================

export interface InventoryReportRow {
  id: string;
  name: string;
  brand: string | null;
  category_name: string;
  current_stock: number;
  min_stock: number;
  price: number;
  is_available: boolean;
}

export interface TopProductRow {
  product_name_snapshot: string;
  total_quantity: number;
  order_count: number;
}

export interface OrderReportRow {
  created_at: string;
  product_name_snapshot: string;
  customer_name: string;
  quantity: number;
  unit_price_snapshot: number;
  total: number;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================================
// AUDIT
// ============================================================================

export type AuditAction =
  | 'login' | 'logout'
  | 'create_product' | 'update_product' | 'delete_product'
  | 'adjust_stock'
  | 'create_category' | 'update_category' | 'delete_category'
  | 'place_order'
  | 'update_order_status'
  | 'update_config' | 'create_user' | 'toggle_user'
  | 'bootstrap';

export type AuditEntity = 'product' | 'category' | 'order' | 'user' | 'system';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  user_role?: 'admin' | 'empleado' | 'public';
  action: AuditAction;
  entity: AuditEntity;
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// LEGACY (Keep for compatibility)
// ============================================================================

export interface SiteConfig {
  site: {
    name: string;
    description: string;
    version: string;
    author: string;
  };
  theme: {
    primaryColor: string;
    fontFamily: string;
  };
}

export interface HomeData {
  hero: {
    greeting: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
  };
  meta: {
    title: string;
    description: string;
  };
}
