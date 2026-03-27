# 🚀 Plan de Implementación por Fases
## Fullstack TypeScript · Next.js · GitHub · Vercel · JSON Data Layer

> **Referencia:** Plan de Infraestructura Fullstack TypeScript + Vercel
> **Metodología:** Entrega incremental — cada fase produce un entregable funcional y verificable
> **Duración estimada total:** 3–5 días (desarrollador individual)

---

## 📋 Índice de Fases

| Fase | Nombre | Duración Est. | Entregable |
|:---:|---|:---:|---|
| **0** | [Pre-requisitos y entorno local](#fase-0--pre-requisitos-y-entorno-local) | 1–2 h | Entorno listo para desarrollar |
| **1** | [Repositorio y scaffolding inicial](#fase-1--repositorio-y-scaffolding-inicial) | 2–3 h | Repo en GitHub con estructura base |
| **2** | [Capa de datos JSON](#fase-2--capa-de-datos-json) | 1–2 h | `/data` operativo con tipos TS |
| **3** | [Página Home — Hola Mundo](#fase-3--página-home--hola-mundo) | 2–3 h | Home funcional con efecto elegante |
| **4** | [Pipeline CI/CD — GitHub Actions](#fase-4--pipeline-cicd--github-actions) | 1–2 h | Validación automática en cada push |
| **5** | [Deploy en Vercel](#fase-5--deploy-en-vercel) | 1 h | URL pública funcionando |
| **6** | [Validación end-to-end](#fase-6--validación-end-to-end) | 1 h | Sistema verificado en producción |

---

## Diagrama de flujo entre fases

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ FASE  0  │────▶│ FASE  1  │────▶│ FASE  2  │────▶│ FASE  3  │
  │ Entorno  │     │  Repo +  │     │   JSON   │     │  Home +  │
  │  local   │     │Scaffolding     │  Data    │     │  Efecto  │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                           │
  ┌──────────┐     ┌──────────┐     ┌──────────┐          │
  │ FASE  6  │◀────│ FASE  5  │◀────│ FASE  4  │◀─────────┘
  │Validación│     │  Vercel  │     │  CI/CD   │
  │  E2E     │     │  Deploy  │     │  GitHub  │
  └──────────┘     └──────────┘     └──────────┘
```

> **Principio guía:** No avanzar a la siguiente fase hasta que la actual pase su criterio de aceptación. Cada fase tiene un punto de control (✅ Gate) que debe cumplirse antes de continuar.

---

## FASE 0 — Pre-requisitos y entorno local

**Objetivo:** Garantizar que el entorno de desarrollo tiene todas las herramientas necesarias antes de escribir una sola línea de código del proyecto.

**Duración estimada:** 1–2 horas

### Herramientas a instalar / verificar

| Herramienta | Versión mínima | Verificación |
|---|---|---|
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x | `npm --version` |
| Git | 2.x | `git --version` |
| VS Code (recomendado) | Última | — |

### Extensiones de VS Code recomendadas

```
dbaeumer.vscode-eslint          → ESLint integrado
esbenp.prettier-vscode          → Formateo automático
bradlc.vscode-tailwindcss       → Autocompletado Tailwind
ms-vscode.vscode-typescript-next → TypeScript nightly
```

### Configuración de VS Code — `.vscode/settings.json`

Crear este archivo en la raíz del proyecto una vez iniciado:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Cuentas necesarias

- [ ] Cuenta activa en **GitHub** con acceso al repositorio destino
- [ ] Cuenta activa en **Vercel** vinculada con GitHub (OAuth)
- [ ] Git configurado localmente con nombre y email:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### ✅ Gate — Criterio de aceptación Fase 0

```bash
node --version   # debe mostrar v20.x.x
npm --version    # debe mostrar 10.x.x
git --version    # debe mostrar 2.x.x
```

> Todos los comandos deben ejecutar sin error. Si alguno falla, resolver antes de continuar.

---

## FASE 1 — Repositorio y Scaffolding inicial

**Objetivo:** Crear el repositorio en GitHub, inicializar el proyecto Next.js con TypeScript y Tailwind, y dejar la estructura de carpetas lista.

**Duración estimada:** 2–3 horas

### Paso 1.1 — Crear el repositorio en GitHub

1. Ir a [github.com/new](https://github.com/new)
2. Configurar:
   - **Repository name:** `my-project` (o el nombre elegido)
   - **Visibility:** Private (recomendado inicialmente)
   - **Initialize:** marcar `Add a README file`
   - **gitignore:** seleccionar `Node`
3. Click **Create repository**
4. Copiar la URL SSH o HTTPS del repo

### Paso 1.2 — Clonar y crear el proyecto Next.js

```bash
# Clonar el repo vacío
git clone https://github.com/TU_USUARIO/my-project.git
cd my-project

# Crear el proyecto Next.js dentro del directorio clonado
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --use-npm
```

> El `.` al final indica que el proyecto se crea en el directorio actual, no en una subcarpeta.

### Paso 1.3 — Configurar `tsconfig.json` en modo estricto

Reemplazar el contenido generado por `create-next-app` con:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Paso 1.4 — Configurar `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/*": ["./data/**/*"],
  },
};

export default nextConfig;
```

### Paso 1.5 — Actualizar `package.json` con scripts adicionales

Agregar a la sección `"scripts"`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint"
  }
}
```

### Paso 1.6 — Crear la estructura de carpetas vacías

```bash
mkdir -p data
mkdir -p lib
mkdir -p components/ui
mkdir -p components/layout
mkdir -p .github/workflows
mkdir -p .vscode
```

### Paso 1.7 — Crear `.env.example`

```bash
cat > .env.example << 'EOF'
# === CONFIGURACIÓN DEL SITIO ===
NEXT_PUBLIC_SITE_URL=https://mi-proyecto.vercel.app
NEXT_PUBLIC_SITE_NAME=Mi Proyecto

# === ENTORNO ===
NODE_ENV=development

# === FUTURO: agregar aquí API keys, secrets, etc. ===
# API_SECRET_KEY=
EOF
```

### Paso 1.8 — Crear `.env.local` (no se commitea)

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
EOF
```

### Paso 1.9 — Verificar `.gitignore`

Asegurarse de que estas líneas estén presentes:

```
node_modules/
.next/
.env.local
.env*.local
dist/
*.log
.DS_Store
```

### Paso 1.10 — Primer commit

```bash
git add .
git commit -m "feat: scaffolding inicial Next.js 14 + TypeScript + Tailwind"
git push origin main
```

### ✅ Gate — Criterio de aceptación Fase 1

```bash
npm run dev     # Debe iniciar en http://localhost:3000 sin errores
npm run build   # Debe completar sin errores de TypeScript
git log         # Debe mostrar el commit inicial en remoto
```

> Verificar en GitHub que el repositorio refleja la estructura correcta.

---

## FASE 2 — Capa de datos JSON

**Objetivo:** Implementar la pseudo-base de datos con archivos JSON, los tipos TypeScript correspondientes y la utilidad de lectura type-safe.

**Duración estimada:** 1–2 horas

### Paso 2.1 — Crear `data/config.json`

```json
{
  "site": {
    "name": "Mi Proyecto",
    "description": "Fullstack TypeScript con Vercel",
    "version": "1.0.0",
    "author": "Tu Nombre"
  },
  "theme": {
    "primaryColor": "#0070f3",
    "fontFamily": "Inter"
  }
}
```

### Paso 2.2 — Crear `data/home.json`

```json
{
  "hero": {
    "greeting": "Hola Mundo",
    "subtitle": "TypeScript · Next.js · Vercel",
    "ctaText": "Explorar",
    "ctaHref": "#"
  },
  "meta": {
    "title": "Home | Mi Proyecto",
    "description": "Página de inicio del sistema"
  }
}
```

### Paso 2.3 — Crear `data/README.md`

```markdown
# /data — Capa de datos JSON

Esta carpeta actúa como pseudo-base de datos del sistema.
Cada archivo `.json` representa una entidad o colección de datos.

## Reglas

- Los archivos JSON solo se leen desde el servidor (Server Components, API Routes).
- Nunca importar `fs` o `path` en Client Components (`"use client"`).
- Cada entidad debe tener su tipo TypeScript definido en `/lib/types.ts`.
- Nombrar archivos en `kebab-case`: `home.json`, `site-config.json`.

## Archivos actuales

| Archivo | Descripción |
|---|---|
| `config.json` | Configuración global del sitio |
| `home.json` | Datos de la página principal |
```

### Paso 2.4 — Crear `lib/types.ts`

```typescript
// ===========================
// Tipos globales del sistema
// ===========================

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
```

### Paso 2.5 — Crear `lib/db.ts`

```typescript
import fs from "fs";
import path from "path";

/**
 * Lee y parsea un archivo JSON desde la carpeta /data.
 * Solo debe usarse en contextos server-side (Server Components, API Routes).
 *
 * @param filename - Nombre del archivo JSON (ej: "home.json")
 * @returns Datos parseados y tipados como T
 */
export function readData<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`[db] Archivo no encontrado: data/${filename}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`[db] Error al parsear JSON: data/${filename}`);
  }
}
```

### Paso 2.6 — Verificar tipado

```bash
npx tsc --noEmit
```

No debe arrojar ningún error.

### Paso 2.7 — Commit

```bash
git add .
git commit -m "feat: capa de datos JSON con tipos TypeScript y utilidad readData"
git push origin main
```

### ✅ Gate — Criterio de aceptación Fase 2

- `npx tsc --noEmit` sin errores
- Los archivos `data/config.json` y `data/home.json` existen y tienen JSON válido
- `lib/db.ts` y `lib/types.ts` existen y compilan sin errores

---

## FASE 3 — Página Home — Hola Mundo

**Objetivo:** Implementar la página de inicio que consume los datos de `home.json` y muestra "Hola Mundo" con un efecto visual elegante.

**Duración estimada:** 2–3 horas

### Paso 3.1 — Actualizar `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #000000;
  --foreground: #ffffff;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Paso 3.2 — Actualizar `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import "./globals.css";
import { readData } from "@/lib/db";
import type { HomeData } from "@/lib/types";

const homeData = readData<HomeData>("home.json");

export const metadata: Metadata = {
  title: homeData.meta.title,
  description: homeData.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

### Paso 3.3 — Crear `components/ui/HolaMundo.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";

interface HolaMundoProps {
  greeting: string;
  subtitle: string;
}

export default function HolaMundo({ greeting, subtitle }: HolaMundoProps): JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        relative text-center
        transition-all duration-1000 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
    >
      {/* Glow de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10"
      >
        <div className="w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Texto principal */}
      <h1
        className="
          text-7xl font-bold tracking-tight select-none
          bg-gradient-to-r from-white via-blue-200 to-blue-400
          bg-clip-text text-transparent
          drop-shadow-2xl
        "
      >
        {greeting}
      </h1>

      {/* Línea decorativa animada */}
      <div
        aria-hidden="true"
        className={`
          mx-auto mt-4 h-px
          bg-gradient-to-r from-transparent via-blue-400 to-transparent
          transition-all duration-1000 delay-500
          ${visible ? "w-64" : "w-0"}
        `}
      />

      {/* Subtítulo */}
      <p
        className={`
          mt-6 text-sm font-mono tracking-widest
          text-blue-300/70 uppercase
          transition-all duration-700 delay-700
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
      >
        {subtitle}
      </p>
    </div>
  );
}
```

### Paso 3.4 — Actualizar `app/page.tsx`

```typescript
import { readData } from "@/lib/db";
import type { HomeData } from "@/lib/types";
import HolaMundo from "@/components/ui/HolaMundo";

export default function HomePage(): JSX.Element {
  const homeData = readData<HomeData>("home.json");

  return (
    <main className="min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <HolaMundo
        greeting={homeData.hero.greeting}
        subtitle={homeData.hero.subtitle}
      />
    </main>
  );
}
```

### Paso 3.5 — Verificar en desarrollo

```bash
npm run dev
# Abrir http://localhost:3000
# Debe verse "Hola Mundo" centrado con efecto fade + glow
```

### Paso 3.6 — Verificar TypeScript y build

```bash
npm run validate   # type-check + lint
npm run build      # build de producción
```

### Paso 3.7 — Commit

```bash
git add .
git commit -m "feat: página Home con componente HolaMundo y efecto elegante"
git push origin main
```

### ✅ Gate — Criterio de aceptación Fase 3

- `http://localhost:3000` muestra "Hola Mundo" centrado en fondo negro
- El texto aparece con efecto fade-in desde abajo
- La línea decorativa se expande con delay visible
- El subtítulo aparece después del texto principal
- `npm run build` termina sin errores ni warnings de TypeScript

---

## FASE 4 — Pipeline CI/CD — GitHub Actions

**Objetivo:** Automatizar la validación de TypeScript, ESLint y build en cada push o pull request, garantizando que solo código válido llegue a producción.

**Duración estimada:** 1–2 horas

### Paso 4.1 — Crear `.github/workflows/ci.yml`

```yaml
name: CI — Type Check & Lint

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  validate:
    name: TypeScript + ESLint + Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Build (smoke test)
        run: npm run build
```

### Paso 4.2 — Crear la rama `develop` (buenas prácticas)

```bash
git checkout -b develop
git push origin develop
```

A partir de aquí, el flujo recomendado es:

```
feature/xxx  ──PR──▶  develop  ──merge──▶  main
                         │                    │
                    Preview Deploy       Production Deploy
                    (Vercel Preview)     (Vercel Production)
```

### Paso 4.3 — Commit y push del workflow

```bash
git checkout main
git add .github/workflows/ci.yml
git commit -m "ci: agregar GitHub Actions para type-check, lint y build"
git push origin main
```

### Paso 4.4 — Verificar el workflow en GitHub

1. Ir al repositorio en GitHub
2. Click en la pestaña **Actions**
3. El workflow `CI — Type Check & Lint` debe aparecer ejecutándose
4. Esperar a que todos los pasos muestren ✅ verde

### ✅ Gate — Criterio de aceptación Fase 4

- El workflow aparece en la pestaña **Actions** de GitHub
- Todos los steps (`type-check`, `lint`, `build`) pasan en verde ✅
- El badge del workflow muestra `passing`

---

## FASE 5 — Deploy en Vercel

**Objetivo:** Conectar el repositorio GitHub con Vercel para habilitar el deploy automático en cada push a `main`.

**Duración estimada:** 1 hora

### Paso 5.1 — Crear proyecto en Vercel

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Click en **Import Git Repository**
3. Seleccionar el repositorio `my-project` de GitHub
4. Autorizar el acceso si es la primera vez

### Paso 5.2 — Configurar el proyecto en Vercel

| Campo | Valor |
|---|---|
| **Project Name** | `my-project` |
| **Framework Preset** | Next.js |
| **Root Directory** | `.` (dejar vacío) |
| **Build Command** | `npm run build` |
| **Output Directory** | (dejar vacío — Next.js lo detecta) |
| **Install Command** | `npm ci` |
| **Node.js Version** | `20.x` |

### Paso 5.3 — Agregar variables de entorno en Vercel

Antes de hacer click en Deploy, ir a **Environment Variables** y agregar:

| Variable | Valor | Entorno |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://my-project.vercel.app` | Production |
| `NEXT_PUBLIC_SITE_NAME` | `Mi Proyecto` | All |

### Paso 5.4 — Primer deploy

Click en **Deploy** y esperar 1–2 minutos.

Vercel ejecutará:
```
Installing dependencies (npm ci)
  ↓
Building (npm run build)
  ↓
Assigning domain
  ↓
✅ Deploy exitoso
```

### Paso 5.5 — Crear `vercel.json` (opcional pero recomendado)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

```bash
git add vercel.json
git commit -m "chore: agregar vercel.json con configuración de seguridad"
git push origin main
```

### ✅ Gate — Criterio de aceptación Fase 5

- El deploy en Vercel completa sin errores
- La URL `https://my-project.vercel.app` está accesible
- La página muestra "Hola Mundo" con el efecto elegante en producción
- El dashboard de Vercel muestra estado **Ready** ✅

---

## FASE 6 — Validación end-to-end

**Objetivo:** Confirmar que el sistema completo funciona correctamente, desde el desarrollo local hasta la URL de producción, incluyendo la integración de datos JSON y el pipeline de CI/CD.

**Duración estimada:** 1 hora

### Paso 6.1 — Validación visual en producción

Abrir `https://my-project.vercel.app` en el navegador y verificar:

- [ ] El fondo es negro `#000000`
- [ ] "Hola Mundo" aparece centrado horizontal y verticalmente
- [ ] El texto tiene gradiente blanco → azul
- [ ] El efecto fade-in + translate-y se ejecuta al cargar
- [ ] La línea decorativa se expande con delay
- [ ] El subtítulo "TypeScript · Next.js · Vercel" aparece al final

### Paso 6.2 — Validar integración datos JSON → UI

Modificar el texto en `data/home.json`:

```json
{
  "hero": {
    "greeting": "¡Hola Mundo! 🚀",
    "subtitle": "Deploy validado correctamente"
  }
}
```

```bash
git add data/home.json
git commit -m "test: validar pipeline JSON → Vercel"
git push origin main
```

Verificar en Vercel Dashboard que:
1. Se dispara un nuevo deploy automáticamente
2. El deploy completa en verde
3. La URL refleja el nuevo texto

Restaurar los valores originales:

```json
{
  "hero": {
    "greeting": "Hola Mundo",
    "subtitle": "TypeScript · Next.js · Vercel"
  }
}
```

```bash
git add data/home.json
git commit -m "chore: restaurar datos originales de home.json"
git push origin main
```

### Paso 6.3 — Validar el pipeline CI

Revisar en GitHub → **Actions**:

- [ ] El workflow `CI — Type Check & Lint` pasó en el último push
- [ ] Los tres steps (type-check, lint, build) están en verde ✅
- [ ] No hay warnings en los logs

### Paso 6.4 — Validar TypeScript estricto

```bash
# Intentar agregar código con tipos incorrectos para confirmar que TypeScript falla
# Ejemplo: en lib/types.ts agregar una propiedad con tipo incorrecto
# Luego ejecutar:
npx tsc --noEmit
# Debe mostrar error

# Revertir el cambio y ejecutar de nuevo:
npx tsc --noEmit
# Debe pasar sin errores ✅
```

### Paso 6.5 — Checklist final del sistema

#### Infraestructura
- [ ] Repositorio GitHub con estructura de carpetas correcta
- [ ] `.gitignore` ignorando `node_modules`, `.env.local`, `.next`
- [ ] `.env.example` commiteado como plantilla
- [ ] `tsconfig.json` en modo estricto

#### Datos
- [ ] `data/config.json` con JSON válido
- [ ] `data/home.json` con JSON válido
- [ ] `lib/types.ts` con tipos correspondientes
- [ ] `lib/db.ts` con función `readData<T>` type-safe

#### UI
- [ ] `app/layout.tsx` con metadata desde JSON
- [ ] `app/page.tsx` como Server Component consumiendo `home.json`
- [ ] `components/ui/HolaMundo.tsx` con efecto elegante
- [ ] `app/globals.css` con variables CSS y fondo negro

#### CI/CD
- [ ] `.github/workflows/ci.yml` ejecutando en cada push
- [ ] Workflow pasando en verde en GitHub Actions
- [ ] Deploy automático en Vercel en cada push a `main`

#### Producción
- [ ] URL de Vercel accesible y mostrando la página correctamente
- [ ] Variables de entorno configuradas en Vercel Dashboard
- [ ] Headers de seguridad activos (si se agregó `vercel.json`)

### ✅ Gate — Criterio de aceptación Fase 6 (= sistema completo)

> **El sistema está listo cuando:**
>
> 1. `npm run dev` → `http://localhost:3000` muestra "Hola Mundo" con efecto
> 2. `npm run validate` → pasa sin errores (TypeScript + ESLint)
> 3. GitHub Actions → workflow en verde en cada push
> 4. URL de Vercel → muestra la página en producción
> 5. Cambiar `data/home.json` → push → Vercel deploya automáticamente el cambio

---

## 📊 Resumen de tiempos y dependencias

```
Fase 0  ─────────────────────────────────────────────  1–2 h
        └─ Prerequisito para todas las fases

Fase 1  ──────────────────────────────────────────────  2–3 h
        └─ Depende de: Fase 0

Fase 2  ─────────────────────────────────────────────   1–2 h
        └─ Depende de: Fase 1

Fase 3  ──────────────────────────────────────────────  2–3 h
        └─ Depende de: Fase 1 + Fase 2

Fase 4  ─────────────────────────────────────────────   1–2 h
        └─ Depende de: Fase 3

Fase 5  ──────────────────────────────────────────────  1 h
        └─ Depende de: Fase 3 + Fase 4

Fase 6  ──────────────────────────────────────────────  1 h
        └─ Depende de: Fase 4 + Fase 5
                                                    ─────────
                                         TOTAL:     9–14 h
                             (desarrollador individual, con pausas)
```

---

## 🔁 Convenciones de commits (recomendadas)

Seguir **Conventional Commits** para mantener el historial legible:

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `chore:` | Tareas de mantenimiento (configs, deps) |
| `ci:` | Cambios en CI/CD |
| `docs:` | Documentación |
| `refactor:` | Refactorización sin cambio de comportamiento |
| `test:` | Pruebas |
| `style:` | Cambios de formato, espaciado, sin lógica |

---

## 🔮 Próximos pasos después de la Fase 6

Una vez completado el sistema base, las siguientes iteraciones naturales son:

1. **Agregar nuevas páginas** — crear `app/about/page.tsx` con datos desde `data/about.json`
2. **API Routes** — exponer datos JSON via `app/api/data/route.ts` para consumo cliente
3. **Componentes de layout** — implementar `components/layout/Header.tsx` y `Footer.tsx`
4. **Tipado avanzado** — agregar Zod para validación de esquemas JSON en runtime
5. **Tests** — integrar Vitest o Jest para unit tests de `lib/db.ts`
6. **Rama de staging** — configurar ambiente `preview` en Vercel apuntando a `develop`

---

*Plan de implementación por fases — Fullstack TypeScript · Next.js 14 · GitHub · Vercel*
*Basado en: INFRASTRUCTURE_PLAN.md*
