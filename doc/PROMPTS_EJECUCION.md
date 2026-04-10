# 📜 Prompts de Ejecución por Fase
## Fullstack TypeScript · Next.js 14 · GitHub · Vercel · JSON Data Layer

> **Instrucciones de uso:**
> 1. Antes de ejecutar cada prompt, asegúrate de tener abiertos los tres documentos de referencia.
> 2. Copia el prompt completo de la fase correspondiente y pégalo en una nueva conversación con Claude.
> 3. Sigue el orden de fases. No saltes a la siguiente hasta que el gate ✅ de la actual esté cumplido.
> 4. Al iniciar cada fase, actualiza `ESTADO_EJECUCION.md` con la fecha y hora de inicio.
> 5. Al finalizar cada fase, el resumen se guarda en su archivo independiente `RESUMEN_FASE_X.md`.

---

## 📂 Documentos que cada prompt debe tener como contexto

Antes de usar cualquier prompt, adjunta o copia el contenido de:

- `INFRASTRUCTURE_PLAN.md` — Plan de infraestructura completo
- `IMPLEMENTATION_PLAN.md` — Plan de implementación por fases
- `ESTADO_EJECUCION.md` — Estado actual de ejecución

---

---

## 🟦 PROMPT — FASE 0: Pre-requisitos y entorno local

```
Actúa como un Ingeniero Fullstack Senior especializado en entornos de desarrollo Node.js, TypeScript y Git.

Tienes acceso a los siguientes documentos que DEBES leer antes de hacer cualquier cosa:
- INFRASTRUCTURE_PLAN.md → arquitectura y stack del proyecto
- IMPLEMENTATION_PLAN.md → detalle de pasos por fase
- ESTADO_EJECUCION.md → estado actual de ejecución

---

## ACCIÓN INICIAL OBLIGATORIA

Antes de comenzar cualquier tarea, actualiza el archivo ESTADO_EJECUCION.md:
- Cambia el estado de la Fase 0 de "⬜ Pendiente" a "🔄 En progreso"
- Registra la fecha y hora de inicio en el campo "Inicio" de la Fase 0
- Informa al usuario: "📌 Fase 0 iniciada. Estado actualizado en ESTADO_EJECUCION.md"

---

## TU MISIÓN

Guiar al usuario paso a paso para verificar y configurar su entorno local de desarrollo siguiendo exactamente lo definido en la Fase 0 del IMPLEMENTATION_PLAN.md.

Debes:
1. Verificar que Node.js 20.x LTS esté instalado. Si no, proporcionar el comando de instalación según el sistema operativo del usuario.
2. Verificar que npm 10.x esté disponible.
3. Verificar que Git 2.x esté instalado y configurado con nombre y email.
4. Listar las extensiones de VS Code recomendadas con sus identificadores exactos.
5. Mostrar el contenido del archivo .vscode/settings.json que deberá crearse en el proyecto.
6. Verificar que el usuario tiene cuentas activas en GitHub y Vercel.
7. Ejecutar el gate de aceptación: los tres comandos de verificación deben devolver las versiones correctas.

Si algún requisito no se cumple, no avances. Detente y resuelve el bloqueo primero. Registra cualquier bloqueo en la sección "Bloqueos y problemas activos" de ESTADO_EJECUCION.md.

---

## ACCIÓN FINAL OBLIGATORIA

Al completar todos los pasos y verificar el gate ✅:

1. Actualiza ESTADO_EJECUCION.md:
   - Cambia el estado de Fase 0 a "✅ Completada"
   - Registra la fecha y hora de fin
   - En la sección "Registro de actividad" de Fase 0 documenta: qué herramientas se verificaron, versiones confirmadas, extensiones instaladas y cualquier incidencia resuelta.

2. Crea el archivo RESUMEN_FASE_0.md con la siguiente estructura:

# Resumen — Fase 0: Pre-requisitos y entorno local

## Resultado: ✅ Completada
**Fecha de inicio:** [fecha]
**Fecha de fin:** [fecha]

## Herramientas verificadas
| Herramienta | Versión confirmada |
|---|---|
| Node.js | ... |
| npm | ... |
| Git | ... |

## Configuración realizada
- [lista de acciones tomadas]

## Incidencias
- [lista de problemas encontrados y cómo se resolvieron, o "Ninguna"]

## Gate de aceptación
- [ ] node --version → v20.x.x ✅
- [ ] npm --version → 10.x.x ✅
- [ ] git --version → 2.x.x ✅

3. Informa al usuario: "✅ Fase 0 completada. Puedes continuar con el PROMPT de Fase 1."
```

---

---

## 🟦 PROMPT — FASE 1: Repositorio y Scaffolding inicial

```
Actúa como un Ingeniero Fullstack Senior especializado en Next.js 14, TypeScript y arquitectura de repositorios GitHub.

Tienes acceso a los siguientes documentos que DEBES leer antes de hacer cualquier cosa:
- INFRASTRUCTURE_PLAN.md → arquitectura y stack del proyecto
- IMPLEMENTATION_PLAN.md → detalle de pasos por fase
- ESTADO_EJECUCION.md → estado actual de ejecución

Verifica primero que la Fase 0 esté marcada como "✅ Completada" en ESTADO_EJECUCION.md. Si no lo está, detente e indica al usuario que debe completar la Fase 0 primero.

---

## ACCIÓN INICIAL OBLIGATORIA

Actualiza el archivo ESTADO_EJECUCION.md:
- Cambia el estado de la Fase 1 de "⬜ Pendiente" a "🔄 En progreso"
- Registra la fecha y hora de inicio en el campo "Inicio" de la Fase 1
- Informa al usuario: "📌 Fase 1 iniciada. Estado actualizado en ESTADO_EJECUCION.md"

---

## TU MISIÓN

Guiar al usuario paso a paso para crear el repositorio en GitHub, inicializar el proyecto Next.js y dejar la estructura de carpetas lista, siguiendo exactamente los pasos 1.1 al 1.10 del IMPLEMENTATION_PLAN.md.

Debes:
1. Guiar la creación del repositorio en GitHub con la configuración correcta.
2. Ejecutar el comando create-next-app con todos los flags requeridos.
3. Reemplazar tsconfig.json con la configuración en modo estricto exacta del plan.
4. Actualizar next.config.ts con outputFileTracingIncludes para los archivos /data.
5. Agregar los scripts faltantes en package.json: type-check y validate.
6. Crear la estructura de carpetas: /data, /lib, /components/ui, /components/layout, /.github/workflows, /.vscode.
7. Crear .env.example con el contenido del plan.
8. Crear .env.local con valores de desarrollo local (recordar al usuario que NO se commitea).
9. Verificar que .gitignore tenga todas las entradas necesarias.
10. Ejecutar el primer commit con el mensaje convencional indicado en el plan.

Para cada paso, muestra el comando exacto o el contenido exacto del archivo a crear. No omitas ningún detalle.

---

## ACCIÓN FINAL OBLIGATORIA

Al completar todos los pasos y verificar el gate ✅ (npm run dev funciona, npm run build pasa, git log muestra el commit):

1. Actualiza ESTADO_EJECUCION.md:
   - Cambia el estado de Fase 1 a "✅ Completada"
   - Registra la fecha y hora de fin
   - En "Registro de actividad" de Fase 1 documenta: nombre del repo creado, URL del repositorio en GitHub, archivos creados, estructura de carpetas generada, scripts agregados y cualquier ajuste realizado sobre el plan.

2. Crea el archivo RESUMEN_FASE_1.md con la siguiente estructura:

# Resumen — Fase 1: Repositorio y Scaffolding inicial

## Resultado: ✅ Completada
**Fecha de inicio:** [fecha]
**Fecha de fin:** [fecha]

## Repositorio
- **URL GitHub:** [url]
- **Nombre del proyecto:** [nombre]
- **Visibilidad:** [pública/privada]

## Stack inicializado
- Next.js 14 con App Router ✅
- TypeScript estricto ✅
- Tailwind CSS ✅
- ESLint ✅

## Estructura de carpetas creada
[lista de carpetas y archivos clave]

## Archivos de configuración
[lista: tsconfig.json, next.config.ts, .env.example, .gitignore, package.json]

## Commits realizados
[lista de commits con mensaje y hash]

## Incidencias
[lista o "Ninguna"]

## Gate de aceptación
- [ ] npm run dev → http://localhost:3000 sin errores ✅
- [ ] npm run build → sin errores ✅
- [ ] git log → commit inicial visible en remoto ✅

3. Informa al usuario: "✅ Fase 1 completada. Puedes continuar con el PROMPT de Fase 2."
```

---

---

## 🟦 PROMPT — FASE 2: Capa de datos JSON

```
Actúa como un Ingeniero Fullstack Senior especializado en TypeScript, arquitecturas de datos y patrones server-side en Next.js.

Tienes acceso a los siguientes documentos que DEBES leer antes de hacer cualquier cosa:
- INFRASTRUCTURE_PLAN.md → arquitectura y stack del proyecto
- IMPLEMENTATION_PLAN.md → detalle de pasos por fase
- ESTADO_EJECUCION.md → estado actual de ejecución

Verifica primero que la Fase 1 esté marcada como "✅ Completada" en ESTADO_EJECUCION.md. Si no lo está, detente.

---

## ACCIÓN INICIAL OBLIGATORIA

Actualiza el archivo ESTADO_EJECUCION.md:
- Cambia el estado de la Fase 2 de "⬜ Pendiente" a "🔄 En progreso"
- Registra la fecha y hora de inicio
- Informa al usuario: "📌 Fase 2 iniciada. Estado actualizado en ESTADO_EJECUCION.md"

---

## TU MISIÓN

Implementar la capa de datos JSON completa siguiendo exactamente los pasos 2.1 al 2.7 del IMPLEMENTATION_PLAN.md.

Debes:
1. Crear data/config.json con el esquema exacto del plan (site + theme).
2. Crear data/home.json con el esquema exacto del plan (hero + meta).
3. Crear data/README.md documentando las reglas de uso de la carpeta /data.
4. Crear lib/types.ts con las interfaces SiteConfig y HomeData tipadas estrictamente.
5. Crear lib/db.ts con la función genérica readData<T> incluyendo validación de existencia del archivo y manejo de errores de parsing.
6. Ejecutar npx tsc --noEmit y confirmar que no hay errores.
7. Realizar el commit con el mensaje convencional del plan.

Para cada archivo, proporciona el contenido completo listo para copiar. Explica por qué cada decisión de tipos es correcta.

Importante: Recuerda al usuario la regla crítica — los archivos JSON solo se leen server-side. Nunca importar fs en Client Components.

---

## ACCIÓN FINAL OBLIGATORIA

Al completar todos los pasos y verificar el gate ✅:

1. Actualiza ESTADO_EJECUCION.md:
   - Cambia el estado de Fase 2 a "✅ Completada"
   - Registra fecha y hora de fin
   - En "Registro de actividad" de Fase 2 documenta: archivos JSON creados con sus esquemas, interfaces TypeScript definidas, función readData implementada, resultado de tsc --noEmit.

2. Crea el archivo RESUMEN_FASE_2.md con la siguiente estructura:

# Resumen — Fase 2: Capa de datos JSON

## Resultado: ✅ Completada
**Fecha de inicio:** [fecha]
**Fecha de fin:** [fecha]

## Archivos JSON creados
| Archivo | Descripción | Campos principales |
|---|---|---|
| data/config.json | ... | ... |
| data/home.json | ... | ... |

## Tipos TypeScript definidos
| Interface | Archivo | Campos |
|---|---|---|
| SiteConfig | lib/types.ts | ... |
| HomeData | lib/types.ts | ... |

## Utilidades creadas
- lib/db.ts → función readData<T> con manejo de errores

## Validación TypeScript
- npx tsc --noEmit → ✅ Sin errores

## Commits realizados
[lista]

## Incidencias
[lista o "Ninguna"]

## Gate de aceptación
- [ ] tsc --noEmit sin errores ✅
- [ ] data/config.json y data/home.json con JSON válido ✅
- [ ] lib/db.ts y lib/types.ts compilan sin errores ✅

3. Informa al usuario: "✅ Fase 2 completada. Puedes continuar con el PROMPT de Fase 3."
```

---

---

## 🟦 PROMPT — FASE 3: Página Home — Hola Mundo

```
Actúa como un Ingeniero Fullstack Senior con especialización en UX/UI, diseño de interfaces con Tailwind CSS y componentes React en Next.js 14. Tienes sensibilidad estética para crear efectos visuales elegantes y código de UI limpio y accesible.

Tienes acceso a los siguientes documentos que DEBES leer antes de hacer cualquier cosa:
- INFRASTRUCTURE_PLAN.md → arquitectura, componentes y diseño visual esperado
- IMPLEMENTATION_PLAN.md → pasos exactos de la Fase 3
- ESTADO_EJECUCION.md → estado actual de ejecución

Verifica primero que las Fases 1 y 2 estén marcadas como "✅ Completada" en ESTADO_EJECUCION.md. Si alguna no está completa, detente.

---

## ACCIÓN INICIAL OBLIGATORIA

Actualiza el archivo ESTADO_EJECUCION.md:
- Cambia el estado de la Fase 3 de "⬜ Pendiente" a "🔄 En progreso"
- Registra la fecha y hora de inicio
- Informa al usuario: "📌 Fase 3 iniciada. Estado actualizado en ESTADO_EJECUCION.md"

---

## TU MISIÓN

Implementar la página Home completa con el efecto visual elegante, siguiendo exactamente los pasos 3.1 al 3.7 del IMPLEMENTATION_PLAN.md.

Debes:
1. Reemplazar app/globals.css con el CSS del plan (Tailwind directives + variables CSS + reset base).
2. Actualizar app/layout.tsx leyendo metadata desde home.json via readData<HomeData>.
3. Crear components/ui/HolaMundo.tsx como Client Component con:
   - Estado de visibilidad (useState<boolean>)
   - Efecto de fade-in con translate-y (useEffect + setTimeout 100ms)
   - Glow decorativo con bg-blue-500/10 blur-3xl animate-pulse
   - Texto h1 con gradiente blanco → azul-200 → azul-400
   - Línea decorativa que se expande con delay 500ms
   - Subtítulo con delay 700ms
   - aria-hidden en elementos decorativos (accesibilidad)
4. Actualizar app/page.tsx como Server Component que lee home.json y pasa props a HolaMundo.
5. Ejecutar npm run dev y verificar visualmente en http://localhost:3000.
6. Ejecutar npm run validate (type-check + lint) sin errores.
7. Ejecutar npm run build sin errores.
8. Realizar el commit con el mensaje del plan.

Para cada archivo, proporciona el código completo. Explica las decisiones de diseño y por qué el componente está dividido entre Server y Client.

---

## ACCIÓN FINAL OBLIGATORIA

Al completar todos los pasos y verificar el gate ✅:

1. Actualiza ESTADO_EJECUCION.md:
   - Cambia estado de Fase 3 a "✅ Completada"
   - Registra fecha y hora de fin
   - En "Registro de actividad" de Fase 3 documenta: componentes creados, efectos implementados, resultado de validate y build, descripción visual del resultado.

2. Crea el archivo RESUMEN_FASE_3.md con la siguiente estructura:

# Resumen — Fase 3: Página Home — Hola Mundo

## Resultado: ✅ Completada
**Fecha de inicio:** [fecha]
**Fecha de fin:** [fecha]

## Componentes creados / modificados
| Archivo | Tipo | Descripción |
|---|---|---|
| app/globals.css | Estilos | Reset + variables CSS + Tailwind |
| app/layout.tsx | Server Component | Metadata desde JSON |
| app/page.tsx | Server Component | Home — consume home.json |
| components/ui/HolaMundo.tsx | Client Component | Efecto visual elegante |

## Efectos visuales implementados
- Fade-in + translate-y (duration 1000ms)
- Glow animado (bg-blue-500/10 blur-3xl animate-pulse)
- Gradiente de texto (blanco → azul-200 → azul-400)
- Línea decorativa expansiva (delay 500ms)
- Subtítulo con delay (700ms)

## Validaciones
- npm run validate → ✅ Sin errores
- npm run build → ✅ Sin errores
- Visual en localhost:3000 → ✅ Confirmado

## Commits realizados
[lista]

## Incidencias
[lista o "Ninguna"]

## Gate de aceptación
- [ ] localhost:3000 muestra "Hola Mundo" centrado en fondo negro ✅
- [ ] Efecto fade-in + translate-y visible al cargar ✅
- [ ] Línea decorativa se expande con delay ✅
- [ ] Subtítulo aparece después del texto principal ✅
- [ ] npm run build sin errores ✅

3. Informa al usuario: "✅ Fase 3 completada. Puedes continuar con el PROMPT de Fase 4."
```

---

---

## 🟦 PROMPT — FASE 4: Pipeline CI/CD — GitHub Actions

```
Actúa como un Ingeniero DevOps y Fullstack Senior especializado en GitHub Actions, CI/CD pipelines, y flujos de trabajo con ramas Git.

Tienes acceso a los siguientes documentos que DEBES leer antes de hacer cualquier cosa:
- INFRASTRUCTURE_PLAN.md → estructura del pipeline CI/CD
- IMPLEMENTATION_PLAN.md → pasos exactos de la Fase 4
- ESTADO_EJECUCION.md → estado actual de ejecución

Verifica primero que la Fase 3 esté marcada como "✅ Completada" en ESTADO_EJECUCION.md. Si no lo está, detente.

---

## ACCIÓN INICIAL OBLIGATORIA

Actualiza el archivo ESTADO_EJECUCION.md:
- Cambia el estado de la Fase 4 de "⬜ Pendiente" a "🔄 En progreso"
- Registra la fecha y hora de inicio
- Informa al usuario: "📌 Fase 4 iniciada. Estado actualizado en ESTADO_EJECUCION.md"

---

## TU MISIÓN

Implementar el pipeline de CI/CD con GitHub Actions siguiendo exactamente los pasos 4.1 al 4.4 del IMPLEMENTATION_PLAN.md.

Debes:
1. Crear el archivo .github/workflows/ci.yml con:
   - Triggers en push a main y develop, y en pull_request a main
   - Job "validate" en ubuntu-latest con Node.js 20
   - Steps: checkout, setup-node con cache npm, npm ci, tsc --noEmit, npm run lint, npm run build
2. Crear la rama develop y pushearla a origin.
3. Explicar el flujo de trabajo recomendado: feature → develop (Preview) → main (Production).
4. Hacer el commit del workflow con el mensaje convencional del plan.
5. Guiar al usuario para verificar en GitHub → pestaña Actions que el workflow se ejecuta y pasa en verde.

Para cada step del workflow, explica qué hace y por qué es necesario. Muestra el YAML completo listo para copiar.

Si el workflow falla, ayuda a diagnosticar el error revisando los logs de GitHub Actions antes de continuar.

---

## ACCIÓN FINAL OBLIGATORIA

Al completar todos los pasos y verificar el gate ✅ (workflow en verde):

1. Actualiza ESTADO_EJECUCION.md:
   - Cambia estado de Fase 4 a "✅ Completada"
   - Registra fecha y hora de fin
   - En "Registro de actividad" de Fase 4 documenta: archivo de workflow creado, ramas configuradas, resultado de la primera ejecución del pipeline, tiempos de ejecución de cada step.

2. Crea el archivo RESUMEN_FASE_4.md con la siguiente estructura:

# Resumen — Fase 4: Pipeline CI/CD — GitHub Actions

## Resultado: ✅ Completada
**Fecha de inicio:** [fecha]
**Fecha de fin:** [fecha]

## Workflow creado
- **Archivo:** .github/workflows/ci.yml
- **Triggers:** push (main, develop) + pull_request (main)
- **Runner:** ubuntu-latest / Node.js 20

## Steps del pipeline
| Step | Acción | Resultado |
|---|---|---|
| Checkout | actions/checkout@v4 | ✅ |
| Setup Node | actions/setup-node@v4 | ✅ |
| Install deps | npm ci | ✅ |
| Type check | tsc --noEmit | ✅ |
| Lint | npm run lint | ✅ |
| Build | npm run build | ✅ |

## Ramas configuradas
- main → Production Deploy (Vercel)
- develop → Preview Deploy (Vercel)

## Primera ejecución
- **Resultado:** ✅ Todos los steps en verde
- **Duración total:** [tiempo]

## Commits realizados
[lista]

## Incidencias
[lista o "Ninguna"]

## Gate de aceptación
- [ ] Workflow visible en GitHub → Actions ✅
- [ ] Todos los steps en verde ✅
- [ ] Badge del workflow muestra "passing" ✅

3. Informa al usuario: "✅ Fase 4 completada. Puedes continuar con el PROMPT de Fase 5."
```

---

---

## 🟦 PROMPT — FASE 5: Deploy en Vercel

```
Actúa como un Ingeniero Fullstack Senior especializado en plataformas de deployment, Vercel, configuración de entornos de producción y seguridad de aplicaciones web.

Tienes acceso a los siguientes documentos que DEBES leer antes de hacer cualquier cosa:
- INFRASTRUCTURE_PLAN.md → configuración de Vercel, headers de seguridad, variables de entorno
- IMPLEMENTATION_PLAN.md → pasos exactos de la Fase 5
- ESTADO_EJECUCION.md → estado actual de ejecución

Verifica primero que las Fases 3 y 4 estén marcadas como "✅ Completada" en ESTADO_EJECUCION.md. Si alguna no está completa, detente.

---

## ACCIÓN INICIAL OBLIGATORIA

Actualiza el archivo ESTADO_EJECUCION.md:
- Cambia el estado de la Fase 5 de "⬜ Pendiente" a "🔄 En progreso"
- Registra la fecha y hora de inicio
- Informa al usuario: "📌 Fase 5 iniciada. Estado actualizado en ESTADO_EJECUCION.md"

---

## TU MISIÓN

Configurar y ejecutar el primer deploy en Vercel siguiendo exactamente los pasos 5.1 al 5.5 del IMPLEMENTATION_PLAN.md.

Debes:
1. Guiar paso a paso la creación del proyecto en vercel.com/new:
   - Importar el repositorio de GitHub
   - Configurar Framework Preset, Root Directory, Build Command, Install Command, Node.js Version
2. Configurar las variables de entorno en el Dashboard de Vercel antes del primer deploy:
   - NEXT_PUBLIC_SITE_URL para Production
   - NEXT_PUBLIC_SITE_NAME para All environments
3. Ejecutar el primer deploy y describir los pasos que Vercel ejecuta internamente.
4. Crear el archivo vercel.json con la configuración de seguridad (headers X-Content-Type-Options, X-Frame-Options, X-XSS-Protection).
5. Hacer commit y push de vercel.json para disparar un segundo deploy automático.
6. Verificar que la URL de producción esté accesible.

Para cada paso, muestra capturas de pantalla textuales (describe la interfaz) o los valores exactos a ingresar en el dashboard.

Si el deploy falla, analiza el build log de Vercel para identificar el problema antes de continuar.

---

## ACCIÓN FINAL OBLIGATORIA

Al completar todos los pasos y verificar el gate ✅ (URL de producción activa):

1. Actualiza ESTADO_EJECUCION.md:
   - Cambia estado de Fase 5 a "✅ Completada"
   - Registra fecha y hora de fin
   - En "Registro de actividad" de Fase 5 documenta: URL de producción asignada, variables de entorno configuradas, resultado del primer deploy, configuración de vercel.json.

2. Crea el archivo RESUMEN_FASE_5.md con la siguiente estructura:

# Resumen — Fase 5: Deploy en Vercel

## Resultado: ✅ Completada
**Fecha de inicio:** [fecha]
**Fecha de fin:** [fecha]

## Proyecto en Vercel
- **Nombre:** [nombre]
- **URL de producción:** [url]
- **Framework:** Next.js
- **Node.js:** 20.x
- **Región:** iad1

## Variables de entorno configuradas
| Variable | Entorno |
|---|---|
| NEXT_PUBLIC_SITE_URL | Production |
| NEXT_PUBLIC_SITE_NAME | All |

## Configuración de seguridad (vercel.json)
- X-Content-Type-Options: nosniff ✅
- X-Frame-Options: DENY ✅
- X-XSS-Protection: 1; mode=block ✅

## Deploys realizados
| # | Trigger | Resultado | Duración |
|---|---|---|---|
| 1 | Manual (primer deploy) | ✅ Ready | [tiempo] |
| 2 | Push vercel.json | ✅ Ready | [tiempo] |

## Commits realizados
[lista]

## Incidencias
[lista o "Ninguna"]

## Gate de aceptación
- [ ] Deploy en Vercel completa sin errores ✅
- [ ] URL https://[proyecto].vercel.app accesible ✅
- [ ] Página muestra "Hola Mundo" con efecto en producción ✅
- [ ] Dashboard de Vercel muestra estado Ready ✅

3. Informa al usuario: "✅ Fase 5 completada. Puedes continuar con el PROMPT de Fase 6."
```

---

---

## 🟦 PROMPT — FASE 6: Validación end-to-end

```
Actúa como un Ingeniero Fullstack Senior con rol de QA Lead, especializado en validación de sistemas, pruebas de integración y verificación de pipelines completos de CI/CD.

Tienes acceso a los siguientes documentos que DEBES leer antes de hacer cualquier cosa:
- INFRASTRUCTURE_PLAN.md → resultado esperado del sistema completo
- IMPLEMENTATION_PLAN.md → checklist final de validación (Fase 6)
- ESTADO_EJECUCION.md → estado actual de ejecución

Verifica primero que las Fases 4 y 5 estén marcadas como "✅ Completada" en ESTADO_EJECUCION.md. Si alguna no está completa, detente.

---

## ACCIÓN INICIAL OBLIGATORIA

Actualiza el archivo ESTADO_EJECUCION.md:
- Cambia el estado de la Fase 6 de "⬜ Pendiente" a "🔄 En progreso"
- Registra la fecha y hora de inicio
- Informa al usuario: "📌 Fase 6 iniciada. Estado actualizado en ESTADO_EJECUCION.md"

---

## TU MISIÓN

Ejecutar la validación end-to-end completa del sistema siguiendo exactamente los pasos 6.1 al 6.5 del IMPLEMENTATION_PLAN.md.

Debes:
1. Validación visual en producción: guiar al usuario para verificar los 6 elementos visuales en la URL de Vercel (fondo, centrado, gradiente, fade-in, línea, subtítulo).
2. Validar integración JSON → UI:
   - Modificar data/home.json con el texto de prueba del plan
   - Push y verificar que Vercel dispara deploy automático
   - Confirmar que la URL refleja el nuevo texto
   - Restaurar los valores originales y hacer push final
3. Validar el pipeline CI: revisar en GitHub Actions que todos los steps del último push están en verde.
4. Validar TypeScript estricto: intencionalmente introducir un error de tipos, ejecutar tsc --noEmit para confirmar que falla, luego revertir.
5. Ejecutar el checklist final completo de la Fase 6 (sección 6.5 del plan): todos los ítems de Infraestructura, Datos, UI, CI/CD y Producción.

Para cada validación, pide al usuario que confirme el resultado antes de continuar. Si algo falla, analiza la causa y proporciona la solución.

---

## ACCIÓN FINAL OBLIGATORIA

Al completar todos los pasos y verificar el gate ✅ final del sistema:

1. Actualiza ESTADO_EJECUCION.md:
   - Cambia estado de Fase 6 a "✅ Completada"
   - Registra fecha y hora de fin
   - En "Registro de actividad" de Fase 6 documenta: resultado de cada validación, resultado del test de JSON → Vercel, resultado del checklist final completo.
   - Actualiza la tabla de vista general: todas las fases deben mostrar "✅ Completada"
   - Agrega en "Notas generales": fecha de finalización del proyecto completo.

2. Crea el archivo RESUMEN_FASE_6.md con la siguiente estructura:

# Resumen — Fase 6: Validación end-to-end

## Resultado: ✅ Sistema completo y operativo
**Fecha de inicio:** [fecha]
**Fecha de fin:** [fecha]

## Validaciones ejecutadas

### Visual en producción
| Elemento | Resultado |
|---|---|
| Fondo negro #000000 | ✅ |
| Centrado horizontal y vertical | ✅ |
| Gradiente blanco → azul | ✅ |
| Efecto fade-in + translate-y | ✅ |
| Línea decorativa con delay | ✅ |
| Subtítulo con delay | ✅ |

### Integración JSON → UI
- Modificación de home.json → Push → Deploy automático → URL actualizada ✅
- Restauración de valores originales ✅

### Pipeline CI
- GitHub Actions → todos los steps en verde ✅

### TypeScript estricto
- Error de tipos detectado correctamente por tsc --noEmit ✅

### Checklist final
- Infraestructura: [N/N ítems] ✅
- Datos: [N/N ítems] ✅
- UI: [N/N ítems] ✅
- CI/CD: [N/N ítems] ✅
- Producción: [N/N ítems] ✅

## URL de producción final
[url]

## Incidencias durante validación
[lista o "Ninguna"]

## Gate de aceptación final — Sistema completo
- [ ] npm run dev → localhost:3000 con efecto ✅
- [ ] npm run validate → TypeScript + ESLint sin errores ✅
- [ ] GitHub Actions → workflow en verde ✅
- [ ] URL de Vercel → página en producción ✅
- [ ] JSON → push → Vercel deploya el cambio automáticamente ✅

3. Informa al usuario con el mensaje de cierre del proyecto:

---
🎉 **¡Sistema completado exitosamente!**

Tu stack Fullstack TypeScript está 100% operativo:
- ✅ Repositorio GitHub con estructura profesional
- ✅ TypeScript estricto validado en CI antes de cada deploy
- ✅ Deploy automático en Vercel en cada push a main
- ✅ Página Home con efecto elegante sirviendo datos desde JSON
- ✅ Arquitectura escalable lista para las próximas iteraciones

**Próximos pasos sugeridos** (ver sección 🔮 del IMPLEMENTATION_PLAN.md):
nuevas páginas, API Routes, componentes de layout, Zod para validación, tests con Vitest.
---
```

---

---

## 📎 Notas finales de uso

- Los archivos `RESUMEN_FASE_X.md` son independientes de `ESTADO_EJECUCION.md`. El estado tiene el historial completo; los resúmenes son documentos de entregable por fase.
- Si una fase queda bloqueada, registra el bloqueo en `ESTADO_EJECUCION.md` antes de pedir ayuda.
- Nunca saltes una fase. El sistema de gates existe para evitar errores acumulados.
- Puedes ejecutar cada prompt en una conversación separada, siempre adjuntando los tres documentos de referencia actualizados.
