# 🏗️ Plan de Infraestructura — Fullstack TypeScript + GitHub + Vercel

> **Arquitecto:** Plan generado como guía de implementación completa
> **Stack:** Next.js 14 · TypeScript · Vercel · GitHub · JSON como capa de datos
> **Objetivo inicial:** Home con "Hola Mundo" centrado y efecto elegante para validar el setup

---

## 📋 Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura de Repositorio](#3-estructura-de-repositorio)
4. [Capa de Datos (JSON Database)](#4-capa-de-datos-json-database)
5. [Configuración del Proyecto](#5-configuración-del-proyecto)
6. [Implementación del Home](#6-implementación-del-home)
7. [Pipeline CI/CD — GitHub → Vercel](#7-pipeline-cicd--github--vercel)
8. [Configuración de Vercel](#8-configuración-de-vercel)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Checklist de Implementación](#10-checklist-de-implementación)
11. [Convenciones y Estándares](#11-convenciones-y-estándares)

---

## 1. Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA GENERAL                    │
│                                                             │
│  Developer  ──push──▶  GitHub Repo  ──auto deploy──▶  Vercel│
│                              │                              │
│                         Actions CI                          │
│                        (type-check)                         │
│                                                             │
│  Next.js App (TypeScript)                                   │
│  ├── /app          → Páginas y rutas (App Router)           │
│  ├── /components   → Componentes reutilizables              │
│  ├── /lib          → Utilidades y helpers                   │
│  └── /data         → Archivos JSON (pseudo-database)        │
└─────────────────────────────────────────────────────────────┘
```

**Principios de diseño:**

- **Type-safe end-to-end:** Todo el código, incluyendo la lectura de JSON, tipado con TypeScript estricto.
- **Zero database overhead:** Los archivos `.json` dentro de `/data` actúan como fuente de verdad.
- **Deploy automático:** Cada `push` a `main` dispara un deploy en Vercel.
- **Escalable:** La estructura permite agregar más entidades JSON, API routes y páginas sin reestructurar.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión recomendada | Propósito |
|---|---|---|---|
| Framework | **Next.js** | 14.x (App Router) | SSR, SSG, API Routes |
| Lenguaje | **TypeScript** | 5.x | Type safety completo |
| Estilos | **Tailwind CSS** | 3.x | Utilidades CSS + animaciones |
| Runtime | **Node.js** | 20.x LTS | Ejecución server-side |
| Deploy | **Vercel** | — | Hosting + CD automático |
| Repositorio | **GitHub** | — | Control de versiones + CI |
| Datos | **JSON files** | — | Pseudo-base de datos |
| Linting | **ESLint + Prettier** | — | Calidad y formato de código |

---

## 3. Estructura de Repositorio

```
my-project/
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions: type-check + lint
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Layout raíz con metadata global
│   ├── page.tsx                    # Home → "Hola Mundo"
│   ├── globals.css                 # Estilos globales + variables CSS
│   └── api/
│       └── data/
│           └── route.ts            # API Route ejemplo para leer JSON
│
├── components/
│   ├── ui/
│   │   └── HolaMundo.tsx           # Componente principal con efecto
│   └── layout/
│       └── Header.tsx              # Header reutilizable (futuro)
│
├── lib/
│   ├── db.ts                       # Utilidad genérica para leer JSON
│   └── types.ts                    # Tipos globales TypeScript
│
├── data/                           # 📁 PSEUDO-DATABASE (JSON)
│   ├── README.md                   # Documentación del esquema de datos
│   ├── config.json                 # Configuración general del sitio
│   └── home.json                   # Datos de la página Home
│
├── public/
│   └── fonts/                      # Fuentes locales (opcional)
│
├── .env.local                      # Variables de entorno locales (no commitear)
├── .env.example                    # Plantilla de variables (sí commitear)
├── .eslintrc.json                  # Configuración ESLint
├── .gitignore                      # Ignorar node_modules, .env.local, etc.
├── next.config.ts                  # Configuración Next.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json                   # TypeScript config estricto
└── README.md
```

---

## 4. Capa de Datos (JSON Database)

### Filosofía

La carpeta `/data` reemplaza una base de datos convencional. Cada archivo `.json` representa una **entidad** o **colección**. Las lecturas se hacen server-side en Next.js (Server Components o API Routes), por lo que **nunca se expone el filesystem al cliente**.

### Esquema inicial

#### `data/config.json`
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

#### `data/home.json`
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

### Utilidad de lectura tipada — `lib/db.ts`

```typescript
import fs from "fs";
import path from "path";

// Función genérica type-safe para leer cualquier JSON de /data
export function readData<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}
```

### Tipos globales — `lib/types.ts`

```typescript
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

> **Regla importante:** Los datos JSON solo se leen en el **servidor** (Server Components, `getServerSideProps`, API Routes). Nunca importar `fs` en componentes cliente.

---

## 5. Configuración del Proyecto

### Paso 1 — Crear el proyecto

```bash
npx create-next-app@latest my-project \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd my-project
```

### Paso 2 — `tsconfig.json` (modo estricto)

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

### Paso 3 — `.gitignore`

```
node_modules/
.next/
.env.local
.env*.local
dist/
*.log
.DS_Store
```

### Paso 4 — `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Permitir lectura de /data en build time si se usa SSG
  outputFileTracingIncludes: {
    "/*": ["./data/**/*"],
  },
};

export default nextConfig;
```

---

## 6. Implementación del Home

### `app/page.tsx` — Server Component

```typescript
import { readData } from "@/lib/db";
import type { HomeData } from "@/lib/types";
import HolaMundo from "@/components/ui/HolaMundo";

export default function HomePage() {
  const homeData = readData<HomeData>("home.json");

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <HolaMundo
        greeting={homeData.hero.greeting}
        subtitle={homeData.hero.subtitle}
      />
    </main>
  );
}
```

### `components/ui/HolaMundo.tsx` — Efecto elegante

```typescript
"use client";

import { useEffect, useState } from "react";

interface HolaMundoProps {
  greeting: string;
  subtitle: string;
}

export default function HolaMundo({ greeting, subtitle }: HolaMundoProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        text-center transition-all duration-1000 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
    >
      {/* Glow decorativo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Texto principal */}
      <h1
        className="
          relative text-7xl font-bold tracking-tight
          bg-gradient-to-r from-white via-blue-200 to-blue-400
          bg-clip-text text-transparent
          drop-shadow-2xl
        "
      >
        {greeting}
      </h1>

      {/* Línea decorativa */}
      <div
        className={`
          mx-auto mt-4 h-px w-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent
          transition-all duration-1000 delay-500
          ${visible ? "w-64" : "w-0"}
        `}
      />

      {/* Subtítulo */}
      <p
        className={`
          mt-6 text-sm font-mono tracking-widest text-blue-300/70 uppercase
          transition-all duration-700 delay-700
          ${visible ? "opacity-100" : "opacity-0"}
        `}
      >
        {subtitle}
      </p>
    </div>
  );
}
```

### `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #000000;
  --foreground: #ffffff;
}

* {
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
}
```

---

## 7. Pipeline CI/CD — GitHub → Vercel

### `.github/workflows/ci.yml`

```yaml
name: CI — Type Check & Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    name: TypeScript + ESLint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
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

### Flujo de trabajo recomendado

```
feature/xxx  ──PR──▶  develop  ──merge──▶  main
                          │                  │
                     Preview Deploy      Production Deploy
                     (Vercel Preview)    (Vercel Production)
```

| Rama | Entorno Vercel | URL |
|---|---|---|
| `main` | Production | `mi-proyecto.vercel.app` |
| `develop` / PRs | Preview | URL única por commit |

---

## 8. Configuración de Vercel

### Paso a paso para vincular

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**
2. Importar desde **GitHub** → seleccionar el repositorio
3. Configurar:

| Campo | Valor |
|---|---|
| Framework Preset | **Next.js** |
| Root Directory | `.` (raíz) |
| Build Command | `npm run build` |
| Output Directory | `.next` (automático) |
| Install Command | `npm ci` |
| Node.js Version | `20.x` |

4. Agregar variables de entorno (ver sección 9)
5. Click **Deploy**

### `vercel.json` (opcional, control avanzado)

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

---

## 9. Variables de Entorno

### `.env.example` (commitear como plantilla)

```env
# === CONFIGURACIÓN DEL SITIO ===
NEXT_PUBLIC_SITE_URL=https://mi-proyecto.vercel.app
NEXT_PUBLIC_SITE_NAME=Mi Proyecto

# === ENTORNO ===
NODE_ENV=development

# === FUTURO: agregar aquí API keys, secrets, etc. ===
# API_SECRET_KEY=
```

### `.env.local` (NO commitear — solo desarrollo local)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### En Vercel Dashboard

Ir a **Project Settings → Environment Variables** y agregar:

| Variable | Valor | Entorno |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://mi-proyecto.vercel.app` | Production |
| `NEXT_PUBLIC_SITE_NAME` | `Mi Proyecto` | All |

---

## 10. Checklist de Implementación

### Fase 1 — Setup inicial

- [ ] Crear repositorio en GitHub (privado o público)
- [ ] Ejecutar `create-next-app` con flags de TypeScript y Tailwind
- [ ] Configurar `tsconfig.json` en modo estricto
- [ ] Crear estructura de carpetas: `/data`, `/lib`, `/components/ui`
- [ ] Crear `data/config.json` y `data/home.json`
- [ ] Implementar `lib/db.ts` y `lib/types.ts`
- [ ] Agregar `.env.example` al repo
- [ ] Agregar `.gitignore` correcto

### Fase 2 — Página Home

- [ ] Implementar `app/page.tsx` como Server Component
- [ ] Crear `components/ui/HolaMundo.tsx` con efecto de entrada
- [ ] Configurar `app/globals.css`
- [ ] Validar TypeScript: `npx tsc --noEmit` sin errores
- [ ] Ejecutar `npm run build` localmente sin errores

### Fase 3 — CI/CD

- [ ] Crear `.github/workflows/ci.yml`
- [ ] Hacer primer `push` a GitHub
- [ ] Verificar que el workflow de GitHub Actions pase
- [ ] Conectar repositorio en Vercel
- [ ] Configurar variables de entorno en Vercel Dashboard
- [ ] Verificar deploy automático en `https://mi-proyecto.vercel.app`

### Fase 4 — Validación final

- [ ] Abrir URL de producción y ver "Hola Mundo" con efecto
- [ ] Confirmar que el efecto de fade + glow funciona
- [ ] Confirmar que los datos vienen del JSON (`data/home.json`)
- [ ] Hacer un cambio al JSON → push → verificar que se refleja en Vercel
- [ ] Revisar que no haya warnings de TypeScript en el build log de Vercel

---

## 11. Convenciones y Estándares

### Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `HolaMundo.tsx` |
| Páginas (App Router) | lowercase | `page.tsx`, `layout.tsx` |
| Utilidades / libs | camelCase | `db.ts`, `formatDate.ts` |
| Archivos JSON | kebab-case | `home.json`, `site-config.json` |
| Variables de entorno | UPPER_SNAKE_CASE | `NEXT_PUBLIC_SITE_URL` |
| Tipos TypeScript | PascalCase + sufijo | `HomeData`, `SiteConfig` |

### Reglas críticas de TypeScript

```
✅ strict: true en tsconfig
✅ No usar `any` — usar `unknown` + type guards
✅ Tipar todos los props de componentes con interface
✅ Tipar los retornos de funciones explícitamente
✅ Usar readData<T> con genérico tipado al leer JSON
❌ No usar require() — siempre import/export
❌ No importar `fs` o `path` en Client Components
```

### Scripts en `package.json`

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

---

## 📌 Resultado Esperado

Al completar este plan tendrás:

- ✅ Un repositorio GitHub limpio con estructura profesional
- ✅ TypeScript estricto validado en CI antes de cada deploy
- ✅ Deploy automático en Vercel en cada push a `main`
- ✅ Una página Home con "Hola Mundo" centrado, efecto de fade-in suave, glow animado y gradiente de texto
- ✅ Los datos del Home provenientes de `data/home.json` (validando la capa de datos JSON)
- ✅ Arquitectura escalable lista para agregar nuevas páginas, entidades JSON y API routes

---

*Plan elaborado como guía de arquitectura fullstack — Next.js 14 + TypeScript + Vercel + GitHub*
