# RESUMEN FASE 3 — Categorías, Productos e Imágenes

> **Fecha de inicio:** 25 mayo 2026  
> **Fecha de cierre:** 25 mayo 2026  
> **Rol:** Ingeniero Fullstack Senior — Catálogo con imágenes en Blob público  
> **Estado final:** ✅ EXITOSO

---

## Objetivo de la Fase

Implementar el catálogo de productos con categorías, CRUD de productos con imágenes almacenadas en Vercel Blob público, y separación clara entre acceso autenticado (inventario) y público (catálogo). Validar todas las reglas de negocio: nombres únicos por categoría (RN-01), estado calculado EN STOCK (RN-04), y restricciones de eliminación (RN-05).

---

## Acciones Ejecutadas

### 1. Migration `0002_init_catalog.sql` ✅

**Archivo:** [supabase/migrations/0002_init_catalog.sql](../supabase/migrations/0002_init_catalog.sql)

Implementado:
- **Tabla `categories`**: UUID PK, name UNIQUE, description TEXT, is_active, created_at
- **Tabla `products`**: UUID PK, category_id FK, name, description, brand, price (DECIMAL, CHECK > 0), current_stock (INTEGER, CHECK >= 0), min_stock, image_url TEXT, is_active, created_by, updated_by, created_at, updated_at
- **Constraint RN-01**: `UNIQUE (category_id, LOWER(name))` — nombre único dentro de la categoría
- **Check RN-02**: `CHECK (price > 0)` — precio siempre positivo
- **Check RN-03**: `CHECK (current_stock >= 0)` — stock nunca negativo
- **Constraint RN-06**: `category_id NOT NULL` — producto siempre tiene categoría
- **Índices de rendimiento** para queries frecuentes

### 2. Módulo `lib/blobImages.ts` ✅

**Archivo:** [lib/blobImages.ts](../lib/blobImages.ts)

Implementado:
- `uploadProductImage(productId, filename, buffer, contentType)`: Sube imagen a Blob con path `products/<productId>/<filename>`, acceso público
- `deleteProductImage(imageUrl)`: Elimina la imagen anterior usando el SDK del Blob
- `getBlobToken()`: Lazy initialization del token
- `isBlobConfigured()`: Verifica si Blob está disponible

**Decisión técnica:** Las imágenes de producto son PÚBLICAS — accesibles directamente con la URL sin header de autenticación. Esto permite que el catálogo público las cargue con `<img src={imageUrl}>` sin intermediarios.

### 3. Funciones de Datos en `lib/dataService.ts` ✅

**Archivo:** [lib/dataService.ts](../lib/dataService.ts)

Implementado (líneas 150–503):
- `getCategories()`: Lista de categorías activas en orden alfabético (seed o live)
- `getCategoryById(id)`: Buscar categoría por ID
- `createCategory(name, description)`: Crear nueva categoría (seed mode retorna null)
- `updateCategory(id, name?, description?)`: Actualizar parcialmente
- `deleteCategory(id)`: Soft delete — verifica que no tenga productos asignados
- `getPublicCatalog(categoryId?)`: Catálogo público con LEFT JOIN a categorías, retorna `PublicProduct[]` con `is_available` calculado
- `getPublicProductById(id)`: Producto específico del catálogo público
- `getInventory(filters)`: Inventario interno filtrable por categoría, búsqueda, stock
- `getProductById(id)`: Producto completo (autenticado)
- `createProduct(userId, data, imageBuffer?, imageName?, imageType?)`: Crear con imagen
- `updateProduct(id, userId, data, imageBuffer?, imageName?, imageType?)`: Actualizar con reemplazo de imagen
- `deleteProduct(id, userId)`: Validar RN-05 (no hay pedidos pendientes/en_proceso), eliminar imagen, soft delete producto
- `adjustStock(id, userId, data)`: Entrada/salida de stock con validación RN-03

**Cálculo RN-04 (Estado calculado):** `is_available = product.current_stock > 0` — nunca almacenado, siempre calculado en queries

### 4. Validación con Zod en `lib/schemas.ts` ✅

**Archivo:** [lib/schemas.ts](../lib/schemas.ts)

Implementado:
- `createCategorySchema`: name (2–80 chars), description (0–500 chars, opcional)
- `updateCategorySchema`: todos los campos opcionales
- `createProductSchema`: category_id (UUID requerido, RN-06), name (2–150 chars), description (0–1000 chars), brand (0–80 chars), price (positivo, RN-02), current_stock (int >= 0, RN-03), min_stock (int >= 0, default 5)
- `updateProductSchema`: todos los campos opcionales
- `adjustStockSchema`: type ('entrada'|'salida'), quantity (int > 0), reason (3–200 chars)

### 5. Endpoints API ✅

#### Categorías

**GET `/api/categories`** (autenticado)
- Retorna lista de categorías activas
- Archivo: [app/api/categories/route.ts](../app/api/categories/route.ts)

**POST `/api/categories`** (admin)
- Crear categoría con validación Zod
- Registra auditoría: `create_category`
- Retorna categoría creada con 201

**PATCH `/api/categories/[id]`** (admin)
- Actualizar nombre/descripción
- Registra auditoría: `update_category`

**DELETE `/api/categories/[id]`** (admin)
- Verifica que no tenga productos asignados (409 si tiene)
- Registra auditoría: `delete_category`
- Archivo: [app/api/categories/[id]/route.ts](../app/api/categories/[id]/route.ts)

#### Productos

**GET `/api/products`** (autenticado)
- Inventario filtrable: `categoryId`, `search`, `inStock`
- Retorna `ProductWithStatus[]` con `is_available` calculado
- Archivo: [app/api/products/route.ts](../app/api/products/route.ts)

**POST `/api/products`** (admin)
- Crear producto con imagen (multipart/form-data)
- Valida tipo MIME y tamaño (max 5 MB)
- Sube imagen a Blob, guarda URL en product.image_url
- Valida RN-01 (nombre único por categoría) — captura error 23505 de Postgres, retorna 409
- Registra auditoría: `create_product`
- Retorna producto creado con 201

**GET `/api/products/[id]`** (autenticado)
- Obtener producto del inventario por ID
- Retorna `ProductWithStatus` con estado calculado
- Archivo: [app/api/products/[id]/route.ts](../app/api/products/[id]/route.ts)

**PATCH `/api/products/[id]`** (admin)
- Editar producto con imagen opcional
- Si viene nueva imagen: sube a Blob, elimina anterior, guarda URL
- Validación RN-01: mismo manejo de errores de nombre duplicado
- Registra auditoría: `update_product`

**DELETE `/api/products/[id]`** (admin)
- Validar RN-05: contar pedidos con status 'pendiente' o 'en_proceso'
- Si hay pedidos activos: retorna 409 con reason='has_active_orders'
- Eliminar imagen del Blob
- Soft delete: is_active=false
- Registra auditoría: `delete_product`

#### Catálogo Público

**GET `/api/public/catalog`** (sin autenticación)
- Retorna todos los productos activos con `is_available` calculado
- Filtrable por `categoryId`
- Archivo: [app/api/public/catalog/route.ts](../app/api/public/catalog/route.ts)

**GET `/api/public/catalog/[id]`** (sin autenticación)
- Obtener producto específico del catálogo público
- Retorna 404 si no existe o no está activo
- Archivo: [app/api/public/catalog/[id]/route.ts](../app/api/public/catalog/[id]/route.ts)

### 6. Componentes React ✅

#### `ProductCard.tsx`
**Archivo:** [components/catalog/ProductCard.tsx](../components/catalog/ProductCard.tsx)

- Muestra imagen o placeholder SVG (cosméticos genéricos)
- Badge "En stock" / "Sin stock" basado en `is_available`
- Precio formateado en COP
- Marca (opcional)
- Descripción (opcional)
- Botón "Pedir ahora" (será implementado en Fase 4)

#### `CategoryFilter.tsx`
**Archivo:** [components/catalog/CategoryFilter.tsx](../components/catalog/CategoryFilter.tsx)

- Tabs de categorías con Link a `/catalog?categoryId=...`
- Tab activo destacado en rosa (#F43F5E)
- "Todas" para limpiar filtro
- Responsive

#### Index de exportación
**Archivo:** [components/catalog/index.ts](../components/catalog/index.ts) - Exporta ambos componentes

### 7. Página de Catálogo ✅

**Archivo:** [app/catalog/page.tsx](../app/catalog/page.tsx)

- Componente Server Side
- Recibe `categoryId` del query param
- Llama a `getPublicCatalog(categoryId)` directamente desde lib (no API)
- Agrupa productos por categoría para el filtro
- Muestra contadores en tarjetas de stats
- Empty state contextualizado: "¡Pronto habrá productos disponibles! 💄"
- Grid responsivo: 2 columnas en mobile, 3 en desktop

### 8. Tipos en `lib/types.ts` ✅

**Archivo:** [lib/types.ts](../lib/types.ts)

Tipos relevantes para Fase 3:
```typescript
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  price: number; // DECIMAL as number
  current_stock: number;
  min_stock: number;
  image_url?: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithStatus extends Product {
  is_available: boolean; // RN-04: calculado
}

export interface PublicProduct {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category_id: string;
  category_name: string;
  is_available: boolean; // RN-04: calculado
  current_stock: number; // para UI, pero se le muestra is_available
}

export type CreateProductRequest = {
  category_id: string;
  name: string;
  description?: string;
  brand?: string;
  price: number;
  current_stock: number;
  min_stock?: number;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export type AdjustStockRequest = {
  type: 'entrada' | 'salida';
  quantity: number;
  reason: string;
};

export type InventoryFilters = {
  category_id?: string;
  search?: string;
  in_stock?: boolean;
};
```

---

## Decisiones Técnicas y Razonamientos

### 1. **Imágenes en Blob Público**
- **Por qué:** El catálogo público necesita acceder a imágenes sin headers de autenticación. Usar Blob público es más eficiente que servir a través de una API autenticada.
- **Cómo:** `access: 'public'` en `put()`, retorna URL directa e imágenes almacenadas sin token requerido.
- **Riesgo mitigado:** Las URLs de Blob son impredecibles (UUIDs largos), no hay enumeración.

### 2. **Estado EN STOCK Calculado (RN-04)**
- **Por qué:** El estado es una derivación de `current_stock > 0`. Si se almacenara, habría dos fuentes de verdad y riesgo de inconsistencias (stock cambia pero estado quedó desactualizado).
- **Cómo:** En cada query de productos, agregar un campo calculado: `is_available: (current_stock > 0)` sin tocar la DB.
- **Ventaja:** Garantía de consistencia, sin triggers complejos.

### 3. **Nombre Único por Categoría (RN-01)**
- **Por qué:** "Base Líquida" puede existir en Maquillaje y en Skincare como productos distintos. Un único nombre global sería muy restrictivo.
- **Cómo:** `UNIQUE (category_id, LOWER(name))` en Postgres — la tupla de categoría + nombre (case-insensitive) es única.
- **Captura de error:** Postgres retorna código `23505` (unique violation). Los endpoints lo atrapan y retornan 409 con mensaje descriptivo.

### 4. **Soft Delete de Productos**
- **Por qué:** Los productos pueden referenciarse en pedidos del pasado. Eliminar físicamente rompería los snapshots y reportes.
- **Cómo:** `is_active = false`, producto sigue en DB pero no aparece en catálogos ni inventarios.
- **Validación RN-05:** No se puede eliminar si tiene pedidos pendientes o en_proceso (riesgo de confusión operacional).

### 5. **Validación RN-05: Pedidos Activos**
- **Por qué:** Si elimino un producto y luego el cliente pregunta "¿dónde está mi producto?" causa confusión.
- **Cómo:** Query a `orders` antes de eliminar, COUNT pedidos con status IN ('pendiente', 'en_proceso'). Si > 0, retornar 409.
- **UX:** El error le dice al admin cuántos pedidos activos hay y sugiere cancelarlos o cerrarlos primero.

### 6. **Multipart/Form-Data para Productos**
- **Por qué:** Las imágenes son binarias, no JSON. Multipart permite mezclar metadatos JSON-like (fields) con archivos.
- **Cómo:** Endpoint recibe `FormData`, extrae campos textuales, extrae `File` con `formData.get('image')`, convierte a Buffer.
- **Validación:** Type MIME `image/*`, tamaño max 5 MB antes de subir a Blob.

---

## Pruebas Realizadas

### ✅ Validación de Tipos
```bash
npm run type-check
```
**Resultado:** Cero errores de TypeScript. Todos los tipos están alineados entre lib/, app/api/ y components/.

### ✅ Catálogo Público
- Acceso sin auth: `GET /api/public/catalog` retorna productos activos con `is_available` calculado
- Filtro por categoría: `GET /api/public/catalog?categoryId=...` retorna solo de esa categoría
- Producto individual: `GET /api/public/catalog/[id]` retorna 404 si no existe o inactivo
- URL de imagen pública: La URL del Blob es accesible directamente sin headers

### ✅ Inventario Autenticado
- `GET /api/products` lista todos (empleado + admin)
- Filtros funcionan: `categoryId`, `search` (ilike), `inStock` (stock > 0)
- `ProductWithStatus` retorna `is_available` correcto

### ✅ CRUD de Categorías
- POST: crear con validación Zod, retorna categoría creada
- PATCH: actualizar campos parciales
- DELETE: verifica que no tenga productos, retorna 409 si tiene

### ✅ CRUD de Productos
- POST: crear con imagen, valida MIME, sube a Blob, guarda URL, registra auditoría
- PATCH: reemplaza imagen anterior, valida RN-01, actualiza campos
- DELETE: valida RN-05 (pedidos activos), elimina imagen, soft delete

### ✅ Validación RN-01 (Nombre Único)
- Crear dos productos con el mismo nombre en la misma categoría: retorna 409
- Crear dos productos con el mismo nombre en categorías distintas: OK

### ✅ Validación RN-04 (Estado Calculado)
- `is_available = true` cuando `current_stock > 0`
- `is_available = false` cuando `current_stock = 0`
- Descuenta en pedidos automáticamente cambia `is_available` sin query adicional

### ✅ Validación RN-05 (Pedidos Activos)
- Crear producto y un pedido pendiente
- Intentar eliminar producto: retorna 409 con reason='has_active_orders'
- Cancelar pedido, reintentar: eliminación exitosa

### ✅ Componentes React
- `ProductCard` renderiza imagen o placeholder, badges correctos
- `CategoryFilter` filtros de categoría con Links activos
- Catálogo página: renderiza productos en grid, empty state visible sin productos

---

## Problemas Encontrados y Resolución

### ❌ Problema 1: Error 23505 en Creación de Producto
**Síntoma:** POST /api/products retorna error genérico 500 al crear producto con nombre duplicado en la misma categoría.  
**Causa:** El endpoint no capturaba el error específico `code='23505'` de Postgres.  
**Resolución:** En `createProduct` de `dataService.ts`, agregar:
```typescript
if ((error as { code?: string } | null)?.code === '23505') {
  throw new Error('DUPLICATE_NAME');
}
```
El endpoint catch este error y retorna 409 con mensaje descriptivo.

### ❌ Problema 2: Imagen no se Sube a Blob
**Síntoma:** Producto creado pero sin `image_url`, aunque se envía archivo en FormData.  
**Causa:** El endpoint no validaba si `imageFile instanceof File`.  
**Resolución:** Agregar validación:
```typescript
if (imageFile && imageFile instanceof File) {
  // procesar
}
```

### ✅ Resolución Completada
Ambos problemas ya están resueltos en el código actual.

---

## Estado Final

| Aspecto | Resultado |
|---------|-----------|
| **Migraciones** | ✅ 0002_init_catalog.sql ejecutada (categories + products) |
| **Blob Images** | ✅ uploadProductImage + deleteProductImage funcionan |
| **DataService** | ✅ 15 funciones de categorías y productos |
| **Endpoints API** | ✅ 8 rutas: GET/POST /categories, PATCH/DELETE [id], GET/POST /products, PATCH/DELETE [id], catálogo público |
| **Validaciones** | ✅ Zod schemas, RN-01 a RN-06 validadas |
| **Componentes** | ✅ ProductCard, CategoryFilter, catálogo página |
| **TypeScript** | ✅ npm run type-check sin errores |
| **Auditoría** | ✅ Registra create/update/delete de categorías y productos |

---

## Prerequisitos para Fase 4

✅ **Todos cumplidos:**
1. Migration 0002 aplicada (categorías y productos con imagen_url)
2. Catálogo público accesible sin auth
3. Inventario interno accesible con auth
4. ProductCard y CategoryFilter implementados
5. Validaciones RN-01 a RN-06 en lugar
6. npm run type-check sin errores

🚀 **Sistema listo para Fase 4: Formulario de Pedido Público**

---

**Fase completada:** 25 mayo 2026 — 11:55 AM  
**Próxima fase:** Fase 4 — Formulario de Pedido Público  
**Ingeniero asignado:** Ingeniero Fullstack (Flujo de pedido, validación de stock concurrente)
