-- Añadir columnas faltantes para inventario (stock, ajustes y desperdicios)
-- Fecha: 2025-11-27

-- 1. inventory_lots.reserved_quantity
ALTER TABLE inventory_lots
  ADD COLUMN IF NOT EXISTS reserved_quantity DECIMAL(10,3) DEFAULT 0;

-- 2. adjustment_items.product_id (FK a products)
ALTER TABLE adjustment_items
  ADD COLUMN IF NOT EXISTS product_id INTEGER;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name='adjustment_items' AND column_name='product_id'
  ) THEN
    ALTER TABLE adjustment_items
      ADD CONSTRAINT adjustment_items_product_fk FOREIGN KEY (product_id)
      REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 3. adjustment_items.reason (usado por la entidad)
ALTER TABLE adjustment_items
  ADD COLUMN IF NOT EXISTS reason TEXT;

-- 4. waste_records.photo_url
ALTER TABLE waste_records
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- (Opcional) asegurar que waste_records.product_id exista
ALTER TABLE waste_records
  ADD COLUMN IF NOT EXISTS product_id INTEGER;

DO $$BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name='waste_records' AND column_name='product_id'
  ) THEN
    ALTER TABLE waste_records
      ADD CONSTRAINT waste_records_product_fk FOREIGN KEY (product_id)
      REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Mostrar resumen rápido (no se ejecuta si psql -f)
-- SELECT column_name FROM information_schema.columns WHERE table_name='inventory_lots';
