-- Migration: Add missing columns to inventory tables
-- Date: 2025-11-27
-- Description: Adds created_by to inventory_adjustments and product_id to waste_records

-- Add created_by column to inventory_adjustments
ALTER TABLE inventory_adjustments 
ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

-- Add product_id column to waste_records
ALTER TABLE waste_records 
ADD COLUMN IF NOT EXISTS product_id INTEGER NOT NULL DEFAULT 1;

-- Remove default after adding the column (it's just for the ALTER TABLE to work)
ALTER TABLE waste_records 
ALTER COLUMN product_id DROP DEFAULT;

-- Add foreign key constraint
ALTER TABLE waste_records 
ADD CONSTRAINT waste_records_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id);

-- Add comments
COMMENT ON COLUMN inventory_adjustments.created_by IS 'Usuario que creó el ajuste';
COMMENT ON COLUMN waste_records.product_id IS 'ID del producto asociado al desperdicio';
