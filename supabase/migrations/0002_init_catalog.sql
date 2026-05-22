-- Migration 0002: categories + products
-- Fase 3: Catálogo de productos con imágenes en Blob

-- CATEGORÍAS DE PRODUCTOS
CREATE TABLE IF NOT EXISTS categories (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id   UUID          NOT NULL REFERENCES categories(id),       -- RN-06: categoría obligatoria
  name          VARCHAR(150)  NOT NULL,
  description   TEXT,
  brand         VARCHAR(80),
  price         DECIMAL(10,2) NOT NULL CHECK (price > 0),               -- RN-02: precio > 0
  current_stock INTEGER       NOT NULL DEFAULT 0 CHECK (current_stock >= 0), -- RN-03: stock >= 0
  min_stock     INTEGER       NOT NULL DEFAULT 5,
  image_url     TEXT,         -- URL pública del blob de imagen
  is_active     BOOLEAN       DEFAULT true,
  created_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  updated_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (category_id, LOWER(name))                                      -- RN-01: nombre único por categoría
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock     ON products(current_stock);
CREATE INDEX IF NOT EXISTS idx_products_active    ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_active  ON categories(is_active);
