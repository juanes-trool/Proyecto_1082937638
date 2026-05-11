# SGIB — Sistema de Gestión de Inventario de Belleza
> Plan Maestro del Sistema | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Juan González | Doc: 1082937638

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Auditoría en Vercel Blob](#13-auditoría-en-vercel-blob)
14. [Arquitectura de rutas](#14-arquitectura-de-rutas)
15. [Requerimientos no funcionales](#15-requerimientos-no-funcionales)
16. [Flujos de usuario y de trabajo](#16-flujos-de-usuario-y-de-trabajo)
17. [Diseño de interfaz](#17-diseño-de-interfaz)
18. [Plan de fases de implementación](#18-plan-de-fases-de-implementación)
19. [Estrategia de seguridad](#19-estrategia-de-seguridad)
20. [Restricciones del sistema](#20-restricciones-del-sistema)
21. [Glosario](#21-glosario)

---

## 1. Definición del sistema

El **SGIB** (Sistema de Gestión de Inventario de Belleza) es una plataforma web de gestión de inventario y pedidos para tiendas o emprendimientos de productos cosméticos y de cuidado personal. Centraliza el catálogo de productos con imágenes, controla el stock en tiempo real, y permite a los clientes realizar pedidos en línea a través de un formulario público sin necesidad de registrarse.

La arquitectura tiene dos caras: una **pública** (catálogo y formulario de pedido, accesible sin login) y una **privada** (panel de administración para el admin y el empleado, protegida con JWT).

El sistema opera con Next.js App Router en Vercel, persiste datos en Supabase Postgres, almacena imágenes de producto y auditoría en Vercel Blob.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve SGIB |
|---|---|
| Inventario en hojas de cálculo desactualizadas. | Stock actualizado en tiempo real tras cada pedido o ajuste manual. |
| Sobreventa de productos agotados. | El sistema rechaza pedidos si el stock es insuficiente (RN-03, RN-07). |
| Los clientes llaman o escriben por WhatsApp para pedir. | Formulario de pedido en línea accesible sin registro. |
| Sin historial formal de pedidos. | Historial permanente con nombre del cliente, producto, cantidad y timestamps. |
| Dificultad para identificar productos más solicitados. | Reportes de productos más pedidos y alertas de stock bajo. |

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Administrador** | Interno | Acceso total. CRUD de productos e imágenes, categorías, ajustes de stock, gestión de pedidos, reportes, configuración. |
| **Empleado** | Interno | Puede consultar inventario, actualizar stock y gestionar pedidos. No puede eliminar productos ni acceder a reportes. |
| **Cliente** | Externo público | Sin registro. Navega el catálogo público, filtra por categoría y hace pedidos. |
| **Sistema** | No humano | Descuenta stock al confirmar pedido, actualiza estado EN STOCK/SIN STOCK, genera alertas visuales de stock bajo. |

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Cliente (público) | Empleado | Admin |
|---|:-:|:-:|:-:|
| Ver catálogo público | ✅ | ✅ | ✅ |
| Filtrar catálogo por categoría | ✅ | ✅ | ✅ |
| Hacer pedido (formulario público) | ✅ | ❌ | ❌ |
| **PRODUCTOS** | | | |
| Ver inventario interno | ❌ | ✅ | ✅ |
| Crear producto con imagen | ❌ | ❌ | ✅ |
| Editar producto | ❌ | ❌ | ✅ |
| Eliminar producto | ❌ | ❌ | ✅ |
| Ajustar stock (entrada/salida) | ❌ | ✅ | ✅ |
| **CATEGORÍAS** | | | |
| Ver categorías | ✅ | ✅ | ✅ |
| Crear/editar/eliminar categorías | ❌ | ❌ | ✅ |
| **PEDIDOS** | | | |
| Ver todos los pedidos | ❌ | ✅ | ✅ |
| Cambiar estado de pedido | ❌ | ✅ | ✅ |
| **REPORTES** | | | |
| Ver y exportar reportes | ❌ | ❌ | ✅ |
| **CONFIGURACIÓN** | | | |
| Configurar umbral de stock mínimo | ❌ | ❌ | ✅ |
| Crear / suspender usuarios | ❌ | ❌ | ✅ |
| Acceder a `/admin/db-setup` | ❌ | ❌ | ✅ |
| Ver auditoría | ❌ | ❌ | ✅ |

---

## 5. Casos de uso

### Módulo público (sin autenticación)

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-P1 | Ver catálogo | Cliente | Lista productos EN STOCK con imagen, nombre, precio y categoría. Filtrable por categoría. |
| CU-P2 | Hacer pedido | Cliente | Completa el formulario con nombre, teléfono, dirección, producto, cantidad y observaciones. El sistema valida el stock y registra el pedido. |
| CU-P3 | Recibir confirmación | Cliente | Al enviar el formulario, la pantalla muestra el número de pedido y el mensaje "¡Tu pedido fue recibido!". |

### Módulo de Autenticación (interno)

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Admin / Empleado | Correo y contraseña. Redirige al panel según el rol. |
| CU-A2 | Cerrar sesión | Admin / Empleado | Elimina la cookie de sesión. |
| CU-A3 | Cambiar contraseña | Admin / Empleado | Actualiza contraseña verificando la actual. |

### Módulo de Inventario

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Listar inventario | Admin / Empleado | Inventario completo con filtros por categoría, estado y búsqueda por nombre. |
| CU-02 | Crear producto | Admin | Nombre, marca, descripción, categoría, precio, stock inicial, stock mínimo e imagen. |
| CU-03 | Editar producto | Admin | Modifica cualquier campo incluyendo imagen. |
| CU-04 | Eliminar producto | Admin | Solo si no tiene pedidos en estado `pendiente` o `en_proceso` (RN-05). Modal de confirmación. |
| CU-05 | Ajustar stock | Admin / Empleado | Entrada o salida de unidades con justificación obligatoria. El sistema verifica que no quede negativo. |

### Módulo de Categorías

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-06 | Gestionar categorías | Admin | Crear, editar y eliminar categorías. Solo puede eliminarse una categoría si no tiene productos asignados. |

### Módulo de Pedidos

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-07 | Ver pedidos | Admin / Empleado | Lista de pedidos con filtros por estado, fecha y producto. |
| CU-08 | Cambiar estado | Admin / Empleado | Pendiente → En Proceso → Entregado / Cancelado. Si se cancela después de "En Proceso", el admin restaura el stock manualmente (RN-14). |

### Módulo de Reportes

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-09 | Reporte de inventario | Admin | Estado actual: productos en stock, sin stock, bajo mínimo. Exportable en CSV. |
| CU-10 | Productos más pedidos | Admin | Ranking por cantidad de pedidos en un período. Exportable en CSV. |
| CU-11 | Pedidos por período | Admin | Lista filtrada por rango de fechas. Exportable en CSV. |

---

## 6. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El sistema permite login con correo/contraseña para admin y empleados. |
| RF-02 | El sistema reconoce el rol y muestra solo las funciones permitidas. |
| RF-03 | El catálogo público es accesible sin autenticación. |
| RF-04 | El catálogo permite filtrar por categoría. |
| RF-05 | El formulario de pedido recoge: nombre, teléfono, dirección, producto, cantidad y observaciones. |
| RF-06 | Al enviar el pedido, el sistema valida el stock, lo descuenta, registra el pedido y muestra confirmación con número de pedido. |
| RF-07 | El sistema permite crear productos con imagen (almacenada en Vercel Blob). |
| RF-08 | El sistema muestra el inventario interno con filtros por categoría, estado y búsqueda. |
| RF-09 | El sistema permite ajustes manuales de stock (entrada/salida) con justificación. |
| RF-10 | El sistema alerta visualmente cuando el stock de un producto cae bajo el mínimo configurable. |
| RF-11 | El admin puede crear, editar y eliminar categorías de productos. |
| RF-12 | El admin puede ver todos los pedidos y cambiar su estado. |
| RF-13 | El empleado puede ver y gestionar pedidos (cambiar estado) y ajustar stock, pero no accede a reportes ni CRUD de productos. |
| RF-14 | El sistema genera reportes exportables en CSV: inventario actual, productos más pedidos y pedidos por período. |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | El nombre de un producto debe ser único dentro de su categoría. | UNIQUE en `products(LOWER(name), category_id)`. Capturar error de Postgres y retornar 409. |
| RN-02 | El precio debe ser mayor que cero. | Zod: `z.number().positive()`. CHECK en Postgres: `price > 0`. |
| RN-03 | El stock nunca puede quedar negativo. | Verificar stock suficiente antes de ejecutar descuento o ajuste de salida. Retornar 409 si no alcanza. |
| RN-04 | El estado EN STOCK / SIN STOCK se calcula automáticamente: `current_stock > 0`. | Campo calculado en las queries — no se guarda en la DB. Al retornar productos, el servidor incluye `is_available: product.current_stock > 0`. |
| RN-05 | Un producto no puede eliminarse si tiene pedidos con status `pendiente` o `en_proceso`. | Verificar `COUNT(*) FROM orders WHERE product_id=? AND status IN ('pendiente','en_proceso')` antes de eliminar. Si > 0: retornar 409. |
| RN-06 | Todo producto debe tener una categoría. | `category_id NOT NULL` en la tabla products. Zod: campo requerido. |
| RN-07 | Solo se pueden pedir productos con stock suficiente. | El formulario público solo muestra productos con `current_stock > 0`. El servidor valida nuevamente al confirmar. |
| RN-08 | El stock se descuenta inmediatamente al confirmar el pedido. | Operación secuencial en el servidor: verificar → descontar → insertar pedido. |
| RN-09 | Los datos obligatorios del pedido son: nombre, teléfono, dirección, producto y cantidad. | Validación Zod con todos los campos requeridos. |
| RN-10 | La cantidad pedida mínima es 1. | Zod: `z.number().int().min(1)`. |
| RN-11 | La cantidad pedida no puede superar el stock disponible. | Verificar `current_stock >= quantity` en el servidor. |
| RN-12 | La fecha y hora del pedido las asigna el servidor. | `created_at TIMESTAMPTZ DEFAULT NOW()`. El cliente nunca envía la fecha. |
| RN-13 | Todo pedido nuevo inicia en estado `pendiente`. | `status DEFAULT 'pendiente'` en la tabla. El cliente no puede elegir el estado. |
| RN-14 | Si un pedido se cancela después de estar `en_proceso`, el stock NO se restaura automáticamente. | El admin debe hacer un ajuste manual de stock si decide restaurar las unidades. Esta regla protege contra cancelaciones accidentales que distorsionen el inventario real. |
| RN-15 | Solo el admin puede crear, editar o eliminar productos y categorías. | `withRole(['admin'])` en los endpoints correspondientes. |
| RN-16 | Solo el admin accede a los reportes. | `withRole(['admin'])` en los endpoints de reportes. |
| RN-17 | El cliente solo accede al catálogo público y al formulario de pedido. | Las rutas públicas (`/`, `/catalog`, `/order`) no requieren auth. Todo lo demás está protegido por `withAuth`. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados de dominio |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Imágenes y auditoría | `@vercel/blob` | — | Fotos de productos + logs de auditoría |
| Iconos | Lucide React | — | Iconografía coherente |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 9. Arquitectura de persistencia

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, categorías, productos, pedidos. | El dominio requiere SQL: joins para el catálogo, verificación de stock, historial de pedidos con filtros múltiples. |
| **Vercel Blob** | Imágenes de productos (`products/<productId>/<filename>`). Auditoría (`audit/<YYYYMM>.json`). | Las imágenes son archivos binarios. La auditoría es append-only. Ninguno de los dos pertenece a Postgres. |
| **`data/` en el repo** | Seed inicial: admin + categorías predeterminadas. | Read-only. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **El formulario de pedido es la única operación pública de escritura.** Todas las demás escrituras requieren `withAuth`.
3. **Las imágenes se sirven SIEMPRE a través de una API Route autenticada** en el panel interno — no se expone la URL de Blob directamente. En el catálogo público, las imágenes pueden servirse desde la URL pública de Blob (los blobs de producto son públicos).
4. **El stock se descuenta en el servidor**, nunca en el cliente.
5. **RN-14**: la cancelación de un pedido en_proceso NO restaura el stock automáticamente.
6. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría (blobs privados).
7. **Token de Blob accedido con función lazy** (`getBlobToken()`).
8. **CERO caché** en `/api/:path*`. Headers `no-store` desde `next.config.ts`.

---

## 10. Bootstrap y migrations

### 10.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "SGIB" }
  seed.json       ← {
                      "users": [{
                        email: "admin@sgib.com",
                        password_hash: "<bcrypt admin123>",
                        name: "Administrador",
                        role: "admin"
                      }],
                      "system_config": {
                        "default_min_stock": 5
                      },
                      "categories": [
                        { "name": "Maquillaje", "description": "Bases, labiales, sombras y más" },
                        { "name": "Skincare", "description": "Cremas, sueros y cuidado de la piel" },
                        { "name": "Cabello", "description": "Shampoos, acondicionadores y tratamientos" },
                        { "name": "Uñas", "description": "Esmaltes, geles y accesorios" },
                        { "name": "Fragancias", "description": "Perfumes y colonias" },
                        { "name": "Accesorios", "description": "Esponjas, brochas y herramientas" }
                      ]
                    }
  README.md
```

### 10.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql        ← Fase 1: users + system_config + _migrations
  0002_init_catalog.sql      ← Fase 3: categories + products
  0003_init_orders.sql       ← Fase 5: orders
```

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + Blob. |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts        ← ÚNICO punto de acceso
  supabase.ts           ← Solo lo importa dataService
  blobAudit.ts          ← Solo lo importa dataService (logs de auditoría)
  blobImages.ts         ← Solo lo importa dataService (imágenes de producto)
  pgMigrate.ts          ← Solo lo importa /api/system/bootstrap
  seedReader.ts         ← Solo lo importa dataService en modo seed
  orderService.ts       ← placeOrder (operación atómica pública)
  reportService.ts      ← buildInventoryReport, buildTopProductsReport, toCSV
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>
export async function getSystemConfig(): Promise<SystemConfig>
export async function updateSystemConfig(userId: string, data: UpdateConfigRequest): Promise<SystemConfig>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Categorías
export async function getCategories(): Promise<Category[]>
export async function createCategory(userId: string, data: CreateCategoryRequest): Promise<Category>
export async function updateCategory(id: string, userId: string, data: UpdateCategoryRequest): Promise<Category>
export async function deleteCategory(id: string, userId: string): Promise<void>

// Productos (catálogo público — sin auth)
export async function getPublicCatalog(categoryId?: string): Promise<PublicProduct[]>
export async function getPublicProductById(id: string): Promise<PublicProduct | null>

// Productos (inventario interno — autenticado)
export async function getInventory(filters?: InventoryFilters): Promise<ProductWithStatus[]>
export async function getProductById(id: string): Promise<ProductWithStatus | null>
export async function createProduct(userId: string, data: CreateProductRequest, imageBuffer?: Buffer, imageName?: string): Promise<Product>
export async function updateProduct(id: string, userId: string, data: UpdateProductRequest, imageBuffer?: Buffer, imageName?: string): Promise<Product>
export async function deleteProduct(id: string, userId: string): Promise<void>
export async function adjustStock(id: string, userId: string, data: AdjustStockRequest): Promise<Product>
export async function getLowStockProducts(): Promise<ProductWithStatus[]>

// Pedidos (público — sin auth para crear)
export async function placeOrder(data: PlaceOrderRequest): Promise<Order>

// Pedidos (interno — autenticado)
export async function getOrders(filters?: OrderFilters): Promise<OrderWithProduct[]>
export async function updateOrderStatus(id: string, userId: string, status: OrderStatus): Promise<Order>

// Reportes
export async function getInventoryReportData(): Promise<InventoryReportRow[]>
export async function getTopProductsData(from: string, to: string): Promise<TopProductRow[]>
export async function getOrdersByPeriodData(from: string, to: string): Promise<OrderReportRow[]>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica crítica: `placeOrder`

```typescript
// lib/orderService.ts
export async function placeOrder(data: PlaceOrderRequest): Promise<Order> {
  const { productId, quantity, customerName, phone, address, notes } = data;

  // 1. Verificar que el producto existe y está EN STOCK (RN-07)
  const product = await getPublicProductById(productId);
  if (!product || product.current_stock === 0) {
    throw new NotFoundError('Producto no disponible');
  }

  // 2. Verificar que la cantidad pedida no supera el stock (RN-11)
  if (product.current_stock < quantity) {
    throw new ConflictError('Stock insuficiente', {
      available: product.current_stock,
      requested: quantity
    });
  }

  // 3. Descontar el stock (RN-08)
  await supabase
    .from('products')
    .update({ current_stock: product.current_stock - quantity })
    .eq('id', productId);

  // 4. Registrar el pedido con status 'pendiente' (RN-12, RN-13)
  const { data: order } = await supabase
    .from('orders')
    .insert({
      product_id: productId,
      product_name_snapshot: product.name,   // snapshot del nombre
      unit_price_snapshot: product.price,    // snapshot del precio
      quantity,
      total: product.price * quantity,
      customer_name: customerName,
      phone,
      address,
      notes: notes ?? null,
      status: 'pendiente',
      // created_at asignado por DEFAULT NOW() (RN-12)
    })
    .select()
    .single();

  return order;
}
```

### 11.5 Imágenes en `lib/blobImages.ts`

```typescript
// Sube la imagen del producto a Blob. Path: products/<productId>/<filename>
// Los blobs de imágenes son PÚBLICOS — accesibles con la URL directa
// desde el catálogo público.
export async function uploadProductImage(
  productId: string,
  filename: string,
  content: Buffer,
  contentType: string
): Promise<string>  // retorna la URL pública del blob

// Elimina la imagen anterior al actualizar o eliminar el producto
export async function deleteProductImage(blobUrl: string): Promise<void>
```

---

## 12. Modelo de datos — Supabase Postgres

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(120) UNIQUE NOT NULL,
  password_hash        VARCHAR(255) NOT NULL,
  role                 VARCHAR(10)  NOT NULL DEFAULT 'empleado'
                       CHECK (role IN ('admin', 'empleado')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_config (
  id                SERIAL    PRIMARY KEY,
  default_min_stock INTEGER   NOT NULL DEFAULT 5,
  updated_by        UUID      REFERENCES users(id) ON DELETE SET NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_catalog.sql`

```sql
CREATE TABLE IF NOT EXISTS categories (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id   UUID          NOT NULL REFERENCES categories(id),   -- RN-06
  name          VARCHAR(150)  NOT NULL,
  description   TEXT,
  brand         VARCHAR(80),
  price         DECIMAL(10,2) NOT NULL CHECK (price > 0),           -- RN-02
  current_stock INTEGER       NOT NULL DEFAULT 0 CHECK (current_stock >= 0),  -- RN-03
  min_stock     INTEGER       NOT NULL DEFAULT 5,
  image_url     TEXT,         -- URL pública del blob de imagen
  is_active     BOOLEAN       DEFAULT true,
  created_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  updated_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (category_id, LOWER(name))   -- RN-01: nombre único dentro de la categoría
);

CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock     ON products(current_stock);
CREATE INDEX IF NOT EXISTS idx_products_active    ON products(is_active);
```

> **RN-04 — Estado calculado**: el estado EN STOCK / SIN STOCK se calcula al retornar los datos: `is_available = product.current_stock > 0`. No se guarda en la DB — así nunca hay inconsistencias entre el stock y el estado.

### Migration `0003_init_orders.sql`

```sql
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id            UUID          REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot VARCHAR(150)  NOT NULL,  -- snapshot del nombre al pedir
  unit_price_snapshot   DECIMAL(10,2) NOT NULL,  -- snapshot del precio al pedir
  quantity              INTEGER       NOT NULL CHECK (quantity >= 1),  -- RN-10
  total                 DECIMAL(12,2) NOT NULL,
  customer_name         VARCHAR(150)  NOT NULL,   -- RN-09
  phone                 VARCHAR(20)   NOT NULL,   -- RN-09
  address               TEXT          NOT NULL,   -- RN-09
  notes                 TEXT,
  status                VARCHAR(15)   NOT NULL DEFAULT 'pendiente'   -- RN-13
                        CHECK (status IN ('pendiente','en_proceso','entregado','cancelado')),
  updated_by            UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ   DEFAULT NOW(),   -- RN-12
  updated_at            TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_product  ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date     ON orders(created_at DESC);
```

---

## 13. Auditoría en Vercel Blob

### 13.1 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id?: string;          // null para pedidos del cliente público
  user_email?: string;
  user_role?: 'admin' | 'empleado' | 'public';
  action:
    | 'login' | 'logout'
    | 'create_product' | 'update_product' | 'delete_product'
    | 'adjust_stock'
    | 'create_category' | 'update_category' | 'delete_category'
    | 'place_order'          // acción pública — sin user_id
    | 'update_order_status'
    | 'update_config' | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'product' | 'category' | 'order' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};
```

---

## 14. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                       ← Landing pública — redirige a /catalog
  catalog/page.tsx               ← Catálogo público con filtros por categoría
  order/[productId]/page.tsx     ← Formulario de pedido público
  order/confirm/page.tsx         ← Confirmación del pedido (número generado)
  login/page.tsx                 ← Login del panel interno
  dashboard/page.tsx             ← Panel del admin/empleado
  inventory/
    page.tsx                     ← Inventario interno con filtros
    new/page.tsx                 ← Crear producto (admin)
    [id]/page.tsx                ← Detalle del producto
    [id]/edit/page.tsx           ← Editar producto (admin)
  categories/page.tsx            ← Gestión de categorías (admin)
  orders/page.tsx                ← Gestión de pedidos
  reports/page.tsx               ← Reportes exportables (admin)
  config/page.tsx                ← Configuración del umbral (admin)
  profile/page.tsx               ← Cambiar contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    config/route.ts
    public/
      catalog/route.ts           ← GET catálogo (sin auth, solo activos en stock)
      catalog/[id]/route.ts      ← GET producto público
      order/route.ts             ← POST hacer pedido (sin auth)
    categories/route.ts | [id]/route.ts
    products/
      route.ts                   ← GET inventario (auth) | POST crear (admin)
      [id]/route.ts              ← GET | PUT | DELETE (admin)
      [id]/stock/route.ts        ← PATCH ajustar stock (admin + empleado)
    orders/
      route.ts                   ← GET todos (auth)
      [id]/status/route.ts       ← PATCH cambiar estado (auth)
    reports/
      inventory/route.ts         ← GET (admin)
      top-products/route.ts      ← GET (admin)
      by-period/route.ts         ← GET (admin)
      export/route.ts            ← GET CSV (admin)
    users/route.ts | [id]/route.ts
    audit/route.ts

components/
  ui/
  layout/                        ← AppLayout (panel privado), PublicLayout
                                    (catálogo), SeedModeBanner
  catalog/                       ← ProductCard (público), CategoryFilter,
                                    OrderForm, OrderConfirmation
  inventory/                     ← InventoryTable, ProductForm, StockBadge,
                                    LowStockAlert, StockAdjustModal
  orders/                        ← OrdersTable, OrderStatusBadge,
                                    StatusTransitionModal
  reports/                       ← ReportFilters, TopProductsChart, CSVButton

lib/
  dataService.ts | supabase.ts | blobAudit.ts | blobImages.ts
  pgMigrate.ts | seedReader.ts
  orderService.ts | reportService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 15. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El catálogo público debe cargar en menos de 2 segundos. Los clientes llegan por redes sociales — un catálogo lento se abandona. |
| RNF-02 | El formulario de pedido debe funcionar completamente en celulares (los clientes lo usan desde el celular). |
| RNF-03 | Las imágenes de productos en el catálogo se sirven desde Vercel Blob con la URL pública (blobs públicos). |
| RNF-04 | El panel interno (inventario, pedidos) requiere siempre autenticación. |
| RNF-05 | Las contraseñas tienen mínimo 8 caracteres, al menos una letra y un número (RN-18). |
| RNF-06 | Las sesiones se gestionan con JWT en cookie HttpOnly. |
| RNF-07 | Los precios se muestran en formato COP (`$X.XXX`) en toda la interfaz. |

---

## 16. Flujos de usuario y de trabajo

### Flujo de pedido del cliente

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | /catalog | El cliente ve la galería de productos con imagen, nombre, precio y categoría. Filtra por "Maquillaje". |
| 2 | /catalog | Hace clic en "Pedir" en el producto Labial Rojo. |
| 3 | /order/[id] | El formulario se pre-llena con el producto. El cliente ingresa nombre, teléfono, dirección y cantidad. |
| 4 | /order/[id] | El cliente confirma. El servidor valida el stock, lo descuenta y registra el pedido. |
| 5 | /order/confirm | La pantalla muestra: "¡Tu pedido fue recibido! 🎉 Número de pedido: #P-2026-0042. Nos contactaremos pronto." |

### Flujo de gestión de pedido (admin/empleado)

| Paso | Actor | Acción |
|---|---|---|
| 1 | Sistema | Al recibir el pedido, aparece en el dashboard con status "Pendiente". |
| 2 | Empleado | Abre el pedido, ve los datos del cliente y lo marca "En Proceso". |
| 3 | Empleado | Al despacharlo, lo marca "Entregado". |
| 4a | Empleado | Si el cliente cancela, lo marca "Cancelado". Si ya estaba "En Proceso", el admin decide si restaurar el stock manualmente (RN-14). |

---

## 17. Diseño de interfaz

### Dos layouts distintos

**PublicLayout** (sin autenticación): Barra superior con el logo SGIB y el nombre de la tienda. Sin sidebar. Fondo claro con colores de belleza. Optimizado para celular.

**AppLayout** (panel privado): Sidebar con navegación según el rol. Header con nombre del usuario y botón de logout.

### Identidad visual del Login

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa. Formulario centrado. |
| **Fondo** | Degradado suave `from-rose-50 to-fuchsia-50`. |
| **Tarjeta** | Fondo blanco, `border-radius: 14px`, sombra rosa suave, borde superior de 4px en rosa (`#F43F5E`), max-w-sm. |
| **Logo** | SVG de un frasco de cosmético estilizado con símbolo de inventario, en rosa (`#F43F5E`), 48px. |
| **Nombre** | "SGIB 💄" en Inter Bold 26px, rosa oscuro (`#9F1239`). |
| **Tagline** | "Gestión de inventario de belleza." Inter Regular 13px, slate. |
| **Botón** | bg `#F43F5E`, texto blanco, hover `#E11D48`. |
| **Pie** | Sin link de registro. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (rosa) | `#F43F5E` |
| Primario oscuro | `#E11D48` |
| Primario claro | `#FFF1F2` |
| Acento (fuchsia) | `#D946EF` |
| Fondo principal | `#FFF8FA` |
| Fondo de tarjetas | `#FFFFFF` |
| Texto principal | `#1F2937` |
| Texto secundario | `#6B7280` |
| EN STOCK | `#16A34A` + badge verde |
| SIN STOCK | `#DC2626` + badge rojo |
| Stock bajo | `#D97706` + badge ámbar |
| Pedido Pendiente | `#7C3AED` + fondo `#F5F3FF` |
| Pedido En Proceso | `#2563EB` + fondo `#EFF6FF` |
| Pedido Entregado | `#16A34A` + fondo `#F0FDF4` |
| Pedido Cancelado | `#DC2626` + fondo `#FEF2F2` |
| Bordes | `#FCE7F3` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Componentes clave

| Componente | Descripción |
|---|---|
| `ProductCard` (público) | Imagen del producto (cuadrada, object-cover), nombre, precio en COP, badge EN STOCK / SIN STOCK, botón "Pedir ahora". El botón está deshabilitado si SIN STOCK. |
| `CategoryFilter` | Pills de categoría clicables. La categoría activa tiene fondo rosa. "Todos" siempre visible como primera opción. |
| `OrderForm` | Formulario simple con 5 campos. El producto viene pre-seleccionado si se llegó desde el catálogo. La cantidad tiene control de incremento/decremento (+/-). Al lado de la cantidad, muestra "Disponible: N unidades". |
| `OrderConfirmation` | Pantalla de éxito post-pedido con animación de confeti ligero (Framer Motion), número de pedido grande, y mensaje motivador. |
| `StockBadge` | Badge EN STOCK (verde), SIN STOCK (rojo), o "Stock bajo: N" (ámbar) según el stock vs el mínimo. |
| `OrderStatusBadge` | Badge de color según el estado del pedido. |
| `StatusTransitionModal` | Modal con los estados posibles al que puede avanzar el pedido. Si es "Cancelado" y el pedido estaba "En Proceso", muestra advertencia de RN-14. |

---

## 18. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Blob Store **público** para imágenes de producto y **privado** para auditoría. Variables de entorno. |
| 1.3 | Crear `data/seed.json` con admin + system_config + 6 categorías predeterminadas. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/blobImages.ts` (upload/delete de imágenes a blob público), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios, `getSystemConfig`, `getCategories` y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. |
| 1.8 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.9 | API Routes de sistema y auth: bootstrap, diagnose, mode, login, logout, me, change-password. |
| 1.10 | Crear `app/login/page.tsx` con la identidad visual del SGIB: degradado rosa-fuchsia, logo de cosmético, paleta rosa. |
| 1.11 | Crear `app/catalog/page.tsx` como la página raíz pública (sin auth). Placeholder vacío que se llenará en la Fase 3. |
| 1.12 | `npm run typecheck` sin errores. Probar: login admin → modo seed → cookie HttpOnly. |

---

### Fase 2 — Layouts, Dashboard y bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta rosa en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `PublicLayout.tsx`: barra superior con logo + nombre de la tienda. Sin sidebar. Accesible sin auth. |
| 2.4 | Crear `AppLayout.tsx` (panel privado): sidebar con navegación según el rol. Admin ve todos los módulos. Empleado no ve Reportes ni Configuración. |
| 2.5 | Crear `/admin/db-setup/page.tsx`: diagnóstico + bootstrap. Informa que el bootstrap cargará las 6 categorías y la configuración por defecto. |
| 2.6 | Crear `SeedModeBanner.tsx`. |
| 2.7 | Crear `middleware.ts`: las rutas `/catalog/*`, `/order/*` son públicas. Todo lo demás requiere auth. `/admin/*`, `/reports`, `/categories`, `/config` requieren role='admin'. |
| 2.8 | Crear `app/dashboard/page.tsx`: resumen del día — pedidos nuevos, pedidos en proceso, productos con stock bajo, acceso rápido a "Ver pedidos". |
| 2.9 | Probar: bootstrap → 6 categorías en Supabase → modo live. |

---

### Fase 3 — Categorías, Productos e Imágenes
> Rol: Ingeniero Fullstack Senior — Catálogo con imágenes en Blob

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_catalog.sql`. Aplicar desde `/admin/db-setup`. El bootstrap también inserta las 6 categorías del seed. |
| 3.2 | Agregar tipos `Category`, `Product`, `PublicProduct`, `ProductWithStatus`, `CreateProductRequest` y schemas Zod (RN-01, RN-02, RN-06). |
| 3.3 | Extender `dataService`: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory` (verifica sin productos), `getPublicCatalog` (solo activos con stock > 0, join con categories), `getPublicProductById`, `getInventory`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct` (RN-05), `adjustStock`, `getLowStockProducts`. |
| 3.4 | Implementar `blobImages.ts`: `uploadProductImage(productId, filename, content, contentType)` → sube a blob público y retorna la URL. `deleteProductImage(url)` → elimina el blob. El campo `image_url` en `products` guarda la URL directa de Blob. |
| 3.5 | API Routes: `GET /api/public/catalog`, `GET /api/public/catalog/[id]`, `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[id]`, `PATCH /api/products/[id]/stock`, `GET/POST/PUT/DELETE /api/categories`. |
| 3.6 | Crear `app/inventory/new/page.tsx` y `app/inventory/[id]/edit/page.tsx` (admin): formulario con input de imagen (`<input type="file" accept="image/*">`). Al seleccionar la imagen, el formulario muestra un preview. Al guardar, el servidor recibe la imagen como FormData, la sube a Blob y guarda la URL. |
| 3.7 | Crear `app/inventory/page.tsx` (admin/empleado): inventario interno con `StockBadge` y `LowStockAlert`. |
| 3.8 | Crear `app/categories/page.tsx` (admin): tabla de categorías con CRUD. |
| 3.9 | Actualizar `app/catalog/page.tsx` (público): galería de `ProductCard` con `CategoryFilter`. Las imágenes se cargan directamente desde la URL de Blob (pública). |
| 3.10 | Verificar RN-01: crear dos productos con el mismo nombre en la misma categoría → 409. El mismo nombre en categorías distintas → OK. |
| 3.11 | Verificar RN-05: crear pedido para un producto, intentar eliminar el producto → 409. |
| 3.12 | Verificar imagen: subir imagen de un producto → aparece en el catálogo público sin autenticación. |

---

### Fase 4 — Formulario de Pedido Público
> Rol: Ingeniero Fullstack — Flujo de pedido público con validación de stock

| # | Tarea |
|---|---|
| 4.1 | Crear `lib/orderService.ts` con `placeOrder` (secuencia completa documentada en sección 11.4). |
| 4.2 | Agregar tipos `Order`, `PlaceOrderRequest`, `OrderWithProduct`, `OrderStatus` y schemas Zod (RN-09, RN-10, RN-11, RN-13). |
| 4.3 | API Routes: `POST /api/public/order` (sin auth — pública). El endpoint no requiere `withAuth`. |
| 4.4 | Crear `app/order/[productId]/page.tsx` (público): `OrderForm` con el producto pre-cargado. Muestra stock disponible como referencia. Si el producto no existe o el stock es 0 al cargar → redirect a /catalog con mensaje "Producto no disponible". |
| 4.5 | Crear `app/order/confirm/page.tsx` (público): pantalla de confirmación con el número de pedido. Animación de confeti con Framer Motion. |
| 4.6 | En el catálogo: el botón "Pedir ahora" de un producto SIN STOCK aparece deshabilitado y reza "Sin stock". Al hacer clic en uno con stock → navegar a `/order/[productId]`. |
| 4.7 | Verificar RN-07: intentar hacer pedido de un producto sin stock directamente vía API → 404/409. |
| 4.8 | Verificar RN-11: intentar pedir 10 unidades cuando hay solo 3 → 409 con el stock disponible. |
| 4.9 | Verificar RN-12: el campo created_at del pedido es el timestamp del servidor, no del cliente. |

---

### Fase 5 — Gestión de Pedidos y Reportes
> Rol: Ingeniero Fullstack + Diseñador Frontend

| # | Tarea |
|---|---|
| 5.1 | Crear `supabase/migrations/0003_init_orders.sql`. Aplicar desde `/admin/db-setup`. |
| 5.2 | Extender `dataService`: `getOrders` (con filtros por status, fecha y product_id), `updateOrderStatus`. |
| 5.3 | API Routes: `GET /api/orders` (auth), `PATCH /api/orders/[id]/status` (auth). |
| 5.4 | Crear `app/orders/page.tsx` (admin/empleado): tabla de pedidos con filtros. `OrderStatusBadge`. `StatusTransitionModal` al cambiar estado. El modal advierte sobre RN-14 al cancelar un pedido en_proceso. |
| 5.5 | Crear `lib/reportService.ts`: `buildInventoryReport` (estado actual), `buildTopProductsReport` (más pedidos por período), `getOrdersByPeriodData`. Función `toCSV(rows)`. |
| 5.6 | Extender `dataService`: `getInventoryReportData`, `getTopProductsData`, `getOrdersByPeriodData`. |
| 5.7 | API Routes con `withRole(['admin'])`: `GET /api/reports/inventory`, `GET /api/reports/top-products?from=&to=`, `GET /api/reports/by-period?from=&to=`, `GET /api/reports/export?type=&from=&to=&format=csv`. |
| 5.8 | Crear `app/reports/page.tsx` (admin): pestañas por tipo de reporte, filtros de fecha, tabla preview y botón "Exportar CSV". |

---

### Fase 6 — Administración y Pulido Final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 6.1 | Gestión de usuarios: POST genera contraseña temporal, `must_change_password=true`, retorna en claro una sola vez. Login redirige a /profile si `must_change_password`. |
| 6.2 | Crear `app/admin/users/page.tsx`, `app/admin/audit/page.tsx`, `app/config/page.tsx`. |
| 6.3 | Empty states contextuales: catálogo sin productos ("La tienda está cargando productos. ¡Vuelve pronto! 💄"), inventario vacío, sin pedidos para los filtros, reportes sin datos. |
| 6.4 | Manejo de errores: 401, 403, 409 de stock insuficiente (alerta prominente en el formulario de pedido con el stock disponible), 409 de nombre duplicado, 409 de producto con pedidos activos al eliminar. |
| 6.5 | Verificar que el catálogo público funciona sin cookies y sin auth — probar en una ventana de incógnito. |
| 6.6 | Verificar RN-14: cancelar un pedido en_proceso → el stock NO se restaura automáticamente → verificar en inventario que el stock no cambió. |
| 6.7 | Verificar imágenes en el catálogo: la URL de Blob es pública y carga sin necesidad de autenticación. |
| 6.8 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 6.9 | Deploy en Vercel. |
| 6.10 | Probar en producción: cliente abre catálogo → filtra por Maquillaje → ve imagen del producto → hace pedido → ve confirmación → admin abre panel → ve pedido nuevo → lo pasa a En Proceso → lo marca Entregado. |

---

## 19. Estrategia de seguridad

### Separación público / privado

```
Rutas públicas (sin auth):
  /catalog, /catalog/*, /order/*, /api/public/*

Rutas privadas (requieren JWT):
  /dashboard, /inventory/*, /orders, /reports, /categories,
  /config, /profile, /admin/*, /api/products/*, /api/orders/*,
  /api/categories/*, /api/reports/*, /api/users/*
```

### Protección de escrituras del panel

```typescript
// GET /api/products → withAuth (empleado y admin pueden ver)
// POST /api/products → withRole(['admin'])
// PUT /api/products/[id] → withRole(['admin'])
// DELETE /api/products/[id] → withRole(['admin'])
// PATCH /api/products/[id]/stock → withAuth (empleado y admin)
// PATCH /api/orders/[id]/status → withAuth (empleado y admin)
// GET /api/reports/* → withRole(['admin'])
```

### La imagen del producto

Al crear o editar un producto con imagen, el servidor recibe el archivo como FormData (no base64). Valida tipo MIME (solo `image/*`) y tamaño (máx 5 MB) antes de subir a Blob. La URL resultante se guarda en `products.image_url`. El blob de imagen es público — cualquier visitante puede ver la imagen en el catálogo.

---

## 20. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin recuperación de contraseña por correo | No hay Resend en v1. Solo cambio de contraseña autenticado. |
| RS-02 | Sin confirmación por correo al cliente | La confirmación del pedido es por pantalla. Sin email en v1. |
| RS-03 | Un producto por pedido | El formulario de pedido permite un solo producto por transacción. Múltiples productos requieren múltiples pedidos. |
| RS-04 | Reportes solo en CSV | Sin PDF en v1. |
| RS-05 | Sin recuperación automática de stock al cancelar | RN-14: el admin restaura manualmente el stock si lo considera necesario. |
| RS-06 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login admin. |

---

## 21. Glosario

| Término | Definición |
|---|---|
| **Catálogo público** | Vista del inventario accesible sin autenticación. Muestra solo productos activos con stock disponible. |
| **EN STOCK** | Estado calculado: `current_stock > 0`. El producto puede recibir pedidos. |
| **SIN STOCK** | Estado calculado: `current_stock = 0`. El botón de pedir está deshabilitado. |
| **Stock mínimo** | Umbral por debajo del cual el sistema activa la alerta visual de stock bajo. Configurable por el admin. |
| **Pedido** | Solicitud de un cliente para adquirir un producto. Se registra sin login. |
| **Snapshot en pedido** | Copia del nombre y precio del producto al momento del pedido. Preserva el historial aunque el producto cambie. |
| **Blob público** | Tipo de Vercel Blob cuya URL es accesible sin autenticación. Usado para imágenes de producto. |
| **Blob privado** | Tipo de Vercel Blob que requiere el token para acceder. Usado para auditoría. |
| **RN-14** | La cancelación de un pedido "en proceso" NO restaura el stock automáticamente. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |

---

> Última actualización: Mayo 2026
> Juan González | Doc: 1082937638
> Curso: Lógica y Programación — SIST0200
