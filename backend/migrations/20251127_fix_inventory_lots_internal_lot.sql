-- Agregar columna internal_lot si no existe (sintaxis simple)
ALTER TABLE IF EXISTS inventory_lots
  ADD COLUMN IF NOT EXISTS internal_lot VARCHAR(50);

-- Asegurar unicidad con índice único (IF NOT EXISTS soportado)
CREATE UNIQUE INDEX IF NOT EXISTS inventory_lots_internal_lot_unique
  ON inventory_lots (internal_lot);

-- Crear columna total_cost si no existe (por seguridad)
ALTER TABLE IF EXISTS inventory_lots
  ADD COLUMN IF NOT EXISTS total_cost NUMERIC(14,4);
