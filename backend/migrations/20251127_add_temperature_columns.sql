-- Migration: Add temperature control columns to warehouses table
-- Date: 2025-11-27
-- Description: Adds has_temperature_control and target_temperature columns

-- Add temperature control columns
ALTER TABLE warehouses 
ADD COLUMN IF NOT EXISTS has_temperature_control BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS target_temperature DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for soft deletes
CREATE INDEX IF NOT EXISTS idx_warehouses_deleted_at ON warehouses(deleted_at);

-- Add comments
COMMENT ON COLUMN warehouses.has_temperature_control IS 'Indica si el almacén requiere control de temperatura';
COMMENT ON COLUMN warehouses.target_temperature IS 'Temperatura objetivo en grados Celsius';
COMMENT ON COLUMN warehouses.deleted_at IS 'Fecha de eliminación lógica (soft delete)';
