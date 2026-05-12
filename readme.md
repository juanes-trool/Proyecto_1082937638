# Mi App Fullstack TS

![CI](https://github.com/juanes-trool/Proyecto_1082937638/actions/workflows/ci.yml/badge.svg)

Sistema fullstack con TypeScript, Next.js, Vercel y JSON como base de datos.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5 (strict mode)
- **Estilos:** Tailwind CSS
- **Deploy:** Vercel (CD automático desde GitHub)
- **Persistencia:** Archivos JSON en `/data`
- **CI/CD:** GitHub Actions (type-check, lint, build)

## URLs

- **Producción:** https://mi-app-fullstack-ts.vercel.app
- **Repositorio:** https://github.com/juanes-trool/Proyecto_1082937638

## Scripts

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
npm run type-check  # Validar tipos TypeScript
npm run lint     # Ejecutar ESLint
```

## Arquitectura

- **Server Components:** Renderizado en servidor para datos JSON
- **API Routes:** Endpoints tipados para datos
- **Componentes:** Reutilizables con props validadas
- **Configuración:** TypeScript end-to-end (strict mode)

## Despliegue

Push a `main` → GitHub Actions CI → Vercel deploy automático