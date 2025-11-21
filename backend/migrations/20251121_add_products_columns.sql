-- Migration: Add missing product columns and product_prices table
-- Generated: 2025-11-21

BEGIN;

-- Add columns that entities expect (use IF NOT EXISTS to be safe)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id integer,
  ADD COLUMN IF NOT EXISTS unit_of_measure_id integer,
  ADD COLUMN IF NOT EXISTS is_variable_weight boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_type varchar(50) DEFAULT 'SIMPLE',
  ADD COLUMN IF NOT EXISTS track_inventory boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS track_lots boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS track_expiry boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_stock_alert numeric(10,3),
  ADD COLUMN IF NOT EXISTS max_stock numeric(10,3),
  ADD COLUMN IF NOT EXISTS requires_refrigeration boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_temperature numeric(5,2),
  ADD COLUMN IF NOT EXISTS max_temperature numeric(5,2),
  ADD COLUMN IF NOT EXISTS standard_cost numeric(12,4),
  ADD COLUMN IF NOT EXISTS primary_supplier_id integer,
  ADD COLUMN IF NOT EXISTS sat_product_key varchar(10),
  ADD COLUMN IF NOT EXISTS sat_unit_key varchar(10),
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add barcode and created_by if missing
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS barcode varchar(50),
  ADD COLUMN IF NOT EXISTS created_by integer;

-- Create minimal product_prices table used by the product entity relations
CREATE TABLE IF NOT EXISTS product_prices (
  id SERIAL PRIMARY KEY,
  product_id integer REFERENCES products(id) ON DELETE CASCADE,
  price numeric(12,4) NOT NULL DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMIT;

-- Rollback notes (manual):
-- To revert, drop columns and table added above if desired.
-- DROP TABLE IF EXISTS product_prices;
-- ALTER TABLE products DROP COLUMN IF EXISTS category_id, ...;
