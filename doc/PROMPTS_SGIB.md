# PROMPTS DE IMPLEMENTACIÓN — SGIB
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_SGIB.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_SGIB.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_SGIB.md
2. Leer doc/ESTADO_EJECUCION_SGIB.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer doc/PLAN_SGIB.md
y crear el archivo doc/ESTADO_EJECUCION_SGIB.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema, separación público/privado e imágenes en Blob`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de sistemas con cara pública y cara privada, persistencia
serverless, autenticación JWT y manejo de archivos en storage serverless.

Tu mentalidad: el SGIB tiene dos mundos completamente distintos que corren
en la misma aplicación. El catálogo y el formulario de pedido son páginas
públicas — un cliente las abre desde Instagram sin tener cuenta. El panel de
inventario es privado — requiere login. Esta separación tiene que estar
clara en la arquitectura desde el primer día, especialmente en el middleware.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_SGIB.md — secciones 8 (stack y variables de entorno — SGIB
   no usa Resend), 9 (reglas de oro — especialmente regla 3 sobre imágenes
   en Blob público y regla 6 sobre auditoría en Blob privado), 10 (seed.json
   con admin y 6 categorías), 11 (estructura de lib/ — nota blobAudit.ts
   para auditoría Y blobImages.ts para imágenes — son dos módulos distintos),
   y 19 (separación exacta de rutas públicas vs privadas)
2. doc/ESTADO_EJECUCION_SGIB.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— SGIB tiene DOS tipos de blobs con propósitos distintos:
  blobAudit.ts → accede a un blob PRIVADO (logs de auditoría con getBlobToken
  lazy y get() del SDK — patrón estándar del curso).
  blobImages.ts → accede a un blob PÚBLICO (imágenes de producto). La URL
  resultante del upload es accesible sin autenticación — el catálogo puede
  cargar las imágenes directamente con un <img src={url}> sin headers.
  En Vercel Blob, la diferencia entre público y privado se configura al
  crear el store. Verificar en la documentación de @vercel/blob cómo crear
  un store con acceso público.

— Las rutas públicas del sistema son: /catalog, /catalog/*, /order/*,
  /api/public/*. Todas las demás requieren auth. El middleware.ts debe
  estar configurado con esta distinción desde el principio. Si el middleware
  falla y protege /catalog, los clientes no podrán ver los productos.

— El formulario de pedido (/api/public/order) es la única API Route de
  escritura que no tiene withAuth. Verificar explícitamente que esta
  ruta no requiere cookie de sesión para funcionar.

— El seedReader expone las 6 categorías del seed para que en modo seed
  el admin pueda ver la estructura del catálogo antes del bootstrap.

— La identidad visual del login sigue la sección 17 del plan: degradado
  rosa-fuchsia, logo de cosmético, paleta rosa. Sin link de registro.

Al terminar:
- npm run typecheck — cero errores
- Probar: login admin → modo seed → cookie HttpOnly → logout → /catalog
  accesible sin sesión → /inventory redirige a /login
- Registra el cierre en ESTADO_EJECUCION_SGIB.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Layouts, Dashboard y bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. El SGIB tiene dos layouts con identidades visuales
distintas que conviven en la misma aplicación. El catálogo público tiene
que sentirse como una tienda de belleza real. El panel interno tiene que
sentirse como una herramienta de gestión profesional.

Tu mentalidad: un cliente llega al catálogo desde el Instagram de la tienda.
Su primera impresión decide si hace el pedido o cierra la pestaña. El
catálogo tiene que ser bonito, responsivo y cargar rápido. No puede parecer
un sistema de inventario corporativo.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_SGIB.md — la diferencia entre PublicLayout y AppLayout (sección
   14), la paleta de colores completa (sección 17 — rosa como primario,
   los badges de estado de pedido y de stock), el dashboard del panel privado
   (sección 16), los componentes CategoryFilter y la Fase 2 del plan
2. doc/ESTADO_EJECUCION_SGIB.md — verifica Fase 1 completada, registra
   inicio de Fase 2

Puntos críticos que no puedes ignorar:

— PublicLayout NO tiene sidebar. Tiene una barra superior con el logo del
  SGIB, el nombre "Tienda de Belleza" (o el nombre configurado) y un link
  discreta "Panel de Administración" que lleva a /login. Es lo único que
  distingue a esta barra de la de cualquier tienda online.

— AppLayout tiene sidebar con navegación según el rol:
  Empleado: Dashboard, Inventario, Pedidos, Perfil.
  Admin: todo lo anterior más Categorías, Reportes, Configuración,
  Administración (Usuarios + Auditoría).

— El middleware.ts es el componente más crítico de esta fase porque determina
  qué rutas son públicas. Configurar con exactitud:
  Públicas (sin matcher): /catalog, /catalog/[id], /order/[productId],
  /order/confirm, /api/public/catalog, /api/public/catalog/[id],
  /api/public/order.
  Todo lo demás requiere auth y redirige a /login si no hay sesión.

— El dashboard del panel privado muestra: conteo de pedidos pendientes
  (badge rojo si > 0), conteo de pedidos en proceso, conteo de productos
  con stock bajo, link rápido a "Ver pedidos". En modo seed: estructura
  vacía con mensaje de bienvenida.

— La página /admin/db-setup informa: "Aplicará 3 migrations y cargará:
  1 usuario admin y 6 categorías predeterminadas (Maquillaje, Skincare,
  Cabello, Uñas, Fragancias, Accesorios)."

Al terminar:
- Probar ambos layouts en 375px: catálogo se ve como tienda, panel como
  herramienta de gestión
- Verificar que el empleado no ve Reportes ni Categorías en el sidebar
- Bootstrap: modo live, 6 categorías insertadas
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_LAYOUT.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Categorías, Productos e Imágenes

### Rol: `Ingeniero Fullstack Senior — Catálogo con imágenes en Blob público`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
sistemas de catálogo de productos con almacenamiento de archivos en storage
serverless, validaciones de integridad referencial y control de acceso
diferenciado por rol.

Tu mentalidad: en una tienda de belleza la imagen del producto es tan
importante como el precio. Una base sin foto o un labial con foto pixelada
no se vende. El manejo de imágenes tiene que ser sólido — la imagen se sube,
se guarda en Blob, su URL queda en la DB y el catálogo la carga directamente
sin intermediarios.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_SGIB.md — migration 0002 (categories y products con el UNIQUE
   en (category_id, LOWER(name))), reglas RN-01, RN-02, RN-04, RN-05 y
   RN-06, la implementación de blobImages.ts (sección 11.5), los endpoints
   que requieren withRole vs los que solo necesitan withAuth, y la Fase 3
2. doc/ESTADO_EJECUCION_SGIB.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— RN-04 — estado calculado: la tabla products NO tiene una columna
  is_available ni status. El estado EN STOCK / SIN STOCK se calcula al
  retornar los datos: en las queries, agregar un campo calculado:
  SELECT *, (current_stock > 0) AS is_available FROM products WHERE ...
  Nunca guardar el estado como columna — si se guarda, habrá inconsistencias
  cuando el stock cambia.

— El formulario de creación/edición de productos recibe la imagen como
  FormData, no como JSON. El endpoint POST /api/products no usa
  Content-Type: application/json — usa multipart/form-data. En el servidor:
  (1) Extraer el archivo del FormData: const file = formData.get('image')
  (2) Validar tipo MIME (solo image/*) y tamaño (máx 5 MB)
  (3) Convertir a Buffer: const buffer = Buffer.from(await file.arrayBuffer())
  (4) blobImages.uploadProductImage(productId, file.name, buffer, file.type)
  (5) Guardar la URL resultante en products.image_url

— Al actualizar un producto con una nueva imagen: primero llamar
  blobImages.deleteProductImage(oldUrl) para eliminar el blob anterior
  y evitar blobs huérfanos acumulándose en el storage.

— Al eliminar un producto (RN-05): antes de hacer soft delete o hard delete,
  verificar si tiene pedidos activos (status='pendiente' o 'en_proceso').
  Si tiene: retornar 409 con el conteo de pedidos activos. Si no tiene:
  eliminar la imagen de Blob y luego el registro del producto.

— RN-01 — UNIQUE (category_id, LOWER(name)): el mismo nombre puede existir
  en categorías distintas. "Base Líquida" puede estar en Maquillaje y en
  Skincare como productos distintos. Al capturar el error de Postgres
  (código '23505'), retornar 409 con "Ya existe un producto con ese nombre
  en esta categoría."

— El catálogo público GET /api/public/catalog devuelve solo productos con
  is_active=true. El campo is_available se calcula: current_stock > 0.
  El catálogo NO muestra productos con is_active=false ni expone datos
  internos como min_stock, created_by o updated_by.

— La imagen del catálogo público se carga con <img src={product.image_url}>
  directamente. La URL de Blob es pública — no requiere ningún header de
  autenticación. Si el producto no tiene imagen, mostrar un placeholder
  de cosmético genérico (SVG inline, no una imagen externa).

Al terminar:
- Crear un producto con imagen → verificar que la imagen aparece en el
  catálogo público sin autenticación (abrir en incógnito)
- Crear dos productos con el mismo nombre en la misma categoría → 409
- Crear el mismo nombre en categorías distintas → OK
- Actualizar la imagen de un producto → verificar que el blob anterior
  se eliminó y el nuevo se muestra correctamente
- Eliminar un producto sin pedidos activos → OK con limpieza del blob
- Intentar eliminar un producto con pedidos activos → 409 con el conteo
- Verificar RN-06: intentar crear un producto sin categoría → error de Zod
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_CATALOGO.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Formulario de Pedido Público

### Rol: `Ingeniero Fullstack — Flujo de pedido sin autenticación con validación de stock`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en formularios
públicos de alta conversión, validaciones de stock concurrente y flujos de
confirmación con feedback visual inmediato.

Tu mentalidad: el formulario de pedido es el punto de mayor valor del
sistema. Si falla aquí, el negocio pierde clientes. Si es complicado, el
cliente abandona. Si el stock se descontó pero el pedido no se registró,
hay un problema contable. La operación placeOrder tiene que ser atómica
y el formulario tiene que ser tan simple como sea posible.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_SGIB.md — la implementación completa de placeOrder en
   lib/orderService.ts (sección 11.4 — lee el código comentado paso a paso),
   reglas RN-07 al RN-13, el componente OrderForm y OrderConfirmation
   (sección 17), y la Fase 4 completa del plan
2. doc/ESTADO_EJECUCION_SGIB.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— POST /api/public/order NO tiene withAuth. Es la única API Route de
  escritura del sistema que no requiere autenticación. Verificar que no
  tiene ningún middleware de auth. Si accidentalmente se le agrega withAuth,
  los clientes sin sesión recibirán 401 al intentar hacer un pedido.

— placeOrder en orderService.ts sigue la secuencia exacta de la sección
  11.4 del plan: verificar producto activo → verificar stock suficiente →
  descontar stock → insertar pedido con snapshots de nombre y precio.
  Los snapshots (product_name_snapshot, unit_price_snapshot) garantizan
  que el historial de pedidos no cambia si después se modifica el nombre
  o precio del producto.

— RN-12 y RN-13: el campo created_at y el campo status='pendiente' los
  asigna Postgres por DEFAULT — el cliente nunca los envía. Verificar en
  los tests que el objeto del pedido retornado tiene el timestamp del
  servidor y el status correcto.

— La página /order/[productId] carga el producto desde
  GET /api/public/catalog/[id] (sin auth). Si el producto no existe o tiene
  current_stock = 0 al cargar la página: redirect a /catalog con query param
  ?unavailable=1 y mostrar un toast "Este producto ya no está disponible."
  El catálogo lo mostrará con SIN STOCK si aún existe.

— El OrderForm muestra al lado de la cantidad: "Disponible: N unidades"
  (donde N es el stock actual). Si el usuario escribe más del disponible,
  el campo se marca en rojo con el mensaje "Solo hay N unidades disponibles"
  y el botón de envío se deshabilita. Esto es validación del cliente — el
  servidor también valida al confirmar (doble defensa).

— La pantalla de confirmación (/order/confirm) muestra el número de pedido
  en grande (el id del pedido, formateado como "#SGIB-XXXX" o similar),
  un mensaje de éxito y una animación de confeti con Framer Motion. Esta
  pantalla es el momento de más satisfacción del cliente — hacerla memorable.

— RN-07: el botón "Pedir ahora" en el catálogo está deshabilitado y reza
  "Sin stock" si is_available=false. Al hacer clic en uno con stock →
  navegar a /order/[productId].

Al terminar:
- Flujo completo: abrir /catalog en incógnito → filtrar por categoría →
  hacer clic en "Pedir ahora" → completar formulario → ver confirmación →
  verificar que el stock del producto disminuyó en el panel del admin
- Intentar pedir más de lo disponible → mensaje de error en el formulario
  y 409 si se intenta vía API directa
- Verificar que created_at del pedido es el timestamp del servidor
- Verificar que el número de pedido aparece en la pantalla de confirmación
- Verificar que el botón "Pedir ahora" está deshabilitado para productos
  sin stock
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_PEDIDOS_PUBLICOS.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Gestión de Pedidos y Reportes

### Rol: `Ingeniero Fullstack + Diseñador Frontend — Panel de pedidos y exportación`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack y Diseñador Frontend trabajando
en conjunto. Los pedidos son la actividad principal del negocio. La dueña
necesita ver qué pedidos llegaron, en qué estado están y poder avanzarlos
sin confusión. El cambio de estado tiene reglas (RN-14) que el UI debe
comunicar claramente.

Tu mentalidad: el panel de pedidos es donde la dueña empieza su día laboral.
Tiene que responder en segundos: ¿cuántos pedidos nuevos hay? ¿cuáles están
en proceso? El cambio de estado tiene que ser intuitivo pero no irreversible
sin confirmación.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_SGIB.md — migration 0003 (orders con todos sus campos y
   snapshots), regla RN-14 (cancelación de pedido en_proceso sin
   restauración automática de stock), los badges de estado por color,
   el componente StatusTransitionModal con la advertencia de RN-14,
   lib/reportService.ts y la Fase 5 completa
2. doc/ESTADO_EJECUCION_SGIB.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— El ciclo de estados del pedido es: pendiente → en_proceso → entregado.
  También existe: pendiente → cancelado y en_proceso → cancelado. El
  StatusTransitionModal muestra los estados posibles a los que puede
  avanzar el pedido seleccionado. No todos los estados son siempre
  disponibles — un pedido "entregado" no puede volver a "pendiente".

— RN-14 — la advertencia de cancelación desde en_proceso:
  Cuando el admin o empleado intenta cancelar un pedido que está "en_proceso",
  el StatusTransitionModal muestra una advertencia especial en naranja:
  "⚠️ Este pedido ya está en proceso. Al cancelarlo, el stock NO se
  restaurará automáticamente. Si deseas devolver las unidades al inventario,
  deberás hacer un ajuste de stock manual." El usuario debe confirmar
  explícitamente con un checkbox "Entiendo que el stock no se restaurará"
  antes de poder confirmar la cancelación. Esta advertencia NO aparece al
  cancelar un pedido "pendiente" (el stock tampoco se restaura, pero el
  riesgo operativo es menor).

— Los pedidos tienen product_name_snapshot — usar este campo para mostrar
  el nombre en la tabla de pedidos, no hacer un join con products. Si el
  producto fue eliminado después del pedido, el nombre snapshot sigue
  disponible en el registro.

— PATCH /api/orders/[id]/status tiene withAuth (no solo admin — el empleado
  también puede cambiar estados). Solo los reportes son exclusivos del admin.

— getOrdersByPeriodData para el reporte devuelve: fecha, product_name_snapshot,
  nombre del cliente, cantidad, unit_price_snapshot y total. Los snapshots
  son los datos correctos para el historial — no el precio actual del producto.

— Los reportes se exportan en CSV con papaparse. El endpoint GET
  /api/reports/export?type=inventory|top-products|by-period&from=&to=
  retorna el CSV con Content-Disposition: attachment; filename="sgib-reporte-TIPO-FECHA.csv".

Al terminar:
- Crear pedidos con distintos estados → verificar que los filtros del panel
  funcionan correctamente
- Probar el ciclo de estados: pendiente → en_proceso → entregado
- Probar RN-14: intentar cancelar un pedido en_proceso → verificar que
  aparece la advertencia con el checkbox → confirmar → verificar que el
  stock del producto NO cambió en el inventario
- Cancelar un pedido pendiente → verificar que tampoco restaura el stock
  (el comportamiento es el mismo, sin la advertencia especial)
- Generar reporte de inventario → descargar CSV → verificar columnas
- Generar top productos del mes → verificar que usa product_name_snapshot
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_PEDIDOS_REPORTES.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Administración y Pulido Final

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre del SGIB.

Tu mentalidad: el SGIB tiene dos audiencias muy distintas — los clientes que
abren el catálogo desde Instagram y el equipo que gestiona los pedidos desde
el panel. El sistema falla si cualquiera de los dos tiene una mala experiencia.
Un catálogo con imágenes rotas, un formulario que no funciona en celular, o
un panel que no muestra claramente los pedidos nuevos — cualquiera de esos
fallos afecta directamente al negocio.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_SGIB.md — Fase 6 completa, los requerimientos no funcionales
   (RNF-01 al RNF-07) y las restricciones del sistema (sección 20)
2. doc/ESTADO_EJECUCION_SGIB.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Lo que debes completar en esta fase:

Administración de usuarios:
POST genera contraseña temporal, must_change_password=true, retorna en claro
una sola vez. Login redirige a /profile si must_change_password.
Crear app/admin/users/page.tsx: tabla con nombre, email, rol y estado.
Crear app/admin/audit/page.tsx: AuditViewer con selector de mes.
Crear app/config/page.tsx: umbral de stock mínimo global. Al cambiar el
umbral, los productos que quedarían en alerta se muestran en preview.

Empty states contextuales y apropiados:
- Catálogo sin productos (antes del bootstrap o sin productos activos):
  "¡Pronto habrá productos disponibles! 💄 Vuelve a visitarnos." — con
  el logo grande. No debe parecer un error.
- Filtro por categoría sin resultados: "No encontramos productos en esta
  categoría. Prueba con otra."
- Inventario sin productos: "El catálogo está vacío. Agrega el primer
  producto desde el panel." Con botón (solo admin).
- Sin pedidos para los filtros aplicados: "No hay pedidos con estos filtros."
- Reportes sin datos para el período: "No hay datos en este período."

Manejo de errores global:
- 401: sesión expirada → toast + redirect a /login.
- 403: sin permisos de rol → toast genérico.
- 409 de stock insuficiente en el pedido público: el formulario muestra
  el error en rojo dentro del form — no un toast. El cliente necesita
  saber qué pasó sin que desaparezca el formulario.
- 409 de nombre duplicado en producto: toast descriptivo.
- 409 al eliminar producto con pedidos activos: modal con el conteo.
- 500: toast genérico.

Verificación del catálogo en celular (RNF-02):
En 375px: la galería de productos tiene que verse como una tienda real.
Las imágenes cuadradas en una cuadrícula de 2 columnas. El nombre, precio
y badge EN STOCK / SIN STOCK legibles sin acercar. El botón "Pedir ahora"
de al menos 44px. El formulario de pedido en pantalla completa con todos
los campos accesibles sin scroll horizontal.

Verificación de la separación público/privado en producción:
(1) Abrir /catalog en ventana de incógnito → debe cargar sin auth.
(2) Abrir /inventory en incógnito → debe redirigir a /login.
(3) Hacer un pedido completo en incógnito → funciona sin sesión.
(4) Intentar POST /api/products en incógnito → debe retornar 401.
(5) Intentar GET /api/public/catalog en incógnito → debe retornar datos.
Si cualquiera de estas verificaciones falla, la separación público/privado
está rota y la Fase 6 no puede cerrarse.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Verificar que ningún componente cliente importa módulos de lib/ directamente
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo:
Admin: bootstrap → crear categorías adicionales → agregar productos con
imágenes → crear usuario empleado.
Cliente (incógnito): ver catálogo → filtrar por categoría → ver imagen →
hacer pedido → ver confirmación con número.
Empleado: login → ver pedido nuevo → marcarlo en proceso → marcarlo
entregado.
Admin: ver reportes → exportar CSV → ver auditoría.

Al cerrar el proyecto:
- Registra la Fase 6 como Completada en ESTADO_EJECUCION_SGIB.md con la
  URL de producción en el historial
- Crea doc/RESUMEN_FASE_6_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack, tablas de Supabase,
  decisiones técnicas destacadas (catálogo público sin auth, imágenes en
  Blob público, estado EN STOCK calculado no almacenado, snapshots en
  pedidos, RN-14 sin restauración automática) y estado final del proyecto

El proyecto SGIB está terminado. Tu trabajo en este repositorio concluye aquí.
```

---

> Juan González — Doc: 1082937638
> Curso: Lógica y Programación — SIST0200
