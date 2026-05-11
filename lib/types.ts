// ============================================================================
// TYPES FOR SGIB - Sistema de Gestión de Inventario de Belleza
// ============================================================================

// ============================================================================
// AUTHENTICATION & USERS
// ============================================================================

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'employee';
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'employee';

export interface AuthPayload {
  userId: number;
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
  user?: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// SYSTEM CONFIG
// ============================================================================

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export type SystemMode = 'seed' | 'live';

// ============================================================================
// CATEGORIES
// ============================================================================

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// ============================================================================
// PRODUCTS
// ============================================================================

export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  category_id: number;
  price: number;
  current_stock: number;
  min_stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithStatus extends Product {
  is_available: boolean;
}

export interface PublicProduct {
  id: number;
  name: string;
  brand: string;
  description: string;
  category: Category;
  price: number;
  image_url: string | null;
}

export interface PublicProductWithStatus extends PublicProduct {
  is_available: boolean;
}

export interface CreateProductRequest {
  name: string;
  brand: string;
  description: string;
  category_id: number;
  price: number;
  current_stock: number;
  min_stock: number;
}

export interface UpdateProductRequest {
  name?: string;
  brand?: string;
  description?: string;
  category_id?: number;
  price?: number;
  min_stock?: number;
}

export interface StockAdjustmentRequest {
  type: 'in' | 'out';
  quantity: number;
  reason: string;
}

// ============================================================================
// ORDERS
// ============================================================================

export type OrderStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  product_id: number;
  quantity: number;
  observations: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderWithProduct extends Order {
  product: Product;
}

export interface PlaceOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  product_id: number;
  quantity: number;
  observations?: string;
}

export interface PlaceOrderResponse {
  success: boolean;
  order_id?: number;
  message?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// AUDIT
// ============================================================================

export interface AuditEntry {
  timestamp: string;
  userId?: number;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: number;
  changes?: Record<string, any>;
  ipAddress?: string;
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
