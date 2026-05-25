-- Migration 0003: orders
-- Fase 4: Formulario de pedido público sin autenticación

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
