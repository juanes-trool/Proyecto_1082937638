# Esquema de datos — `/data`

Este directorio contiene archivos JSON que actúan como una pseudo-base de datos.

## Archivos

- `config.json` → Configuración general del sitio
- `home.json` → Datos de la página Home

## Filosofía

La carpeta `/data` reemplaza una base de datos convencional. Cada archivo `.json` representa una **entidad** o **colección**. Las lecturas se hacen server-side en Next.js (Server Components o API Routes), por lo que **nunca se expone el filesystem al cliente**.
