-- SEED INVENTARIO DEMO
-- Crea datos mínimos para probar Stock, Ajustes y Desperdicios
-- Requiere psql (usa: psql -U postgres -d erp_carniceria -f este_archivo.sql)

BEGIN;

-- 1) Asegurar Company
WITH existing AS (
  SELECT id FROM companies LIMIT 1
), inserted AS (
  INSERT INTO companies (business_name, created_at, updated_at)
  SELECT 'Demo Company', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM existing)
  RETURNING id
)
SELECT COALESCE((SELECT id FROM existing), (SELECT id FROM inserted)) AS company_id;
\gset

-- 2) Asegurar Branch
WITH existing_branch AS (
  SELECT id FROM branches LIMIT 1
), inserted_branch AS (
  INSERT INTO branches (company_id, name, address, phone, created_at, updated_at)
  SELECT :company_id, 'Sucursal Central', 'Av. Principal 123', '555-0000', NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM existing_branch)
  RETURNING id
)
SELECT COALESCE((SELECT id FROM existing_branch), (SELECT id FROM inserted_branch)) AS branch_id;
\gset

-- 3) Asegurar Warehouse
WITH existing_wh AS (
  SELECT id FROM warehouses WHERE code='ALM-DEMO'
), inserted_wh AS (
  INSERT INTO warehouses (branch_id, code, name, warehouse_type, has_temperature_control, is_active, created_at, updated_at)
  SELECT :branch_id, 'ALM-DEMO', 'Almacén Demo', 'DRY_STORAGE', false, true, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM existing_wh)
  RETURNING id
)
SELECT COALESCE((SELECT id FROM existing_wh), (SELECT id FROM inserted_wh)) AS warehouse_id;
\gset

-- 4) Asegurar Producto
WITH existing_prod AS (
  SELECT id FROM products WHERE sku='SKU-DEMO-001'
), inserted_prod AS (
  INSERT INTO products (company_id, name, sku, track_inventory, track_lots, track_expiry, is_active, created_at, updated_at)
  SELECT :company_id, 'Carne Molida Premium', 'SKU-DEMO-001', true, true, true, true, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM existing_prod)
  RETURNING id
)
SELECT COALESCE((SELECT id FROM existing_prod), (SELECT id FROM inserted_prod)) AS product_id;
\gset

-- 5) Crear Lote (si no existe)
WITH existing_lot AS (
  SELECT id FROM inventory_lots WHERE lot_number='LOTE-001' AND warehouse_id=:warehouse_id AND product_id=:product_id
), inserted_lot AS (
  INSERT INTO inventory_lots (
    product_id, warehouse_id, lot_number, internal_lot,
    initial_quantity, current_quantity, reserved_quantity,
    unit_cost, expiry_date, entry_date, status, notes,
    created_at, updated_at
  )
  SELECT :product_id, :warehouse_id, 'LOTE-001', 'INT-'||:warehouse_id||'-001',
         50.000, 50.000, 0.000,
         120.00, CURRENT_DATE + INTERVAL '25 days',
         NOW(), 'AVAILABLE', 'Lote de prueba',
         NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM existing_lot)
  RETURNING id
)
SELECT COALESCE((SELECT id FROM existing_lot), (SELECT id FROM inserted_lot)) AS lot_id;
\gset

-- 6) Tomar un usuario existente (para created_by/recorded_by/responsible_user_id)
SELECT id AS user_id FROM users LIMIT 1;
\gset

-- 7) Crear Ajuste DRAFT (si no existe)
WITH existing_adj AS (
  SELECT id FROM inventory_adjustments WHERE notes='Ajuste demo inicial'
), inserted_adj AS (
  INSERT INTO inventory_adjustments (
    warehouse_id, adjustment_type, status, adjustment_date,
    notes, created_by, created_at, updated_at
  )
  SELECT :warehouse_id, 'CORRECTION', 'DRAFT', NOW(),
         'Ajuste demo inicial', :user_id, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM existing_adj)
  RETURNING id
)
SELECT COALESCE((SELECT id FROM existing_adj), (SELECT id FROM inserted_adj)) AS adjustment_id;
\gset

-- 8) Ítem de ajuste (si no existe)
INSERT INTO adjustment_items (
  adjustment_id, lot_id, product_id,
  system_quantity, physical_quantity, unit_cost, reason, created_at, updated_at
)
SELECT :adjustment_id, :'lot_id', :product_id,
       50.000, 48.500, 120.00, 'Diferencia ligera por merma',
       NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM adjustment_items WHERE adjustment_id=:adjustment_id AND lot_id=:'lot_id'
);

-- 9) Desperdicio (si no existe)
WITH existing_waste AS (
  SELECT id FROM waste_records WHERE reason='Desperdicio demo inicial'
), inserted_waste AS (
  INSERT INTO waste_records (
    warehouse_id, product_id, lot_id, waste_type,
    quantity, unit_cost, reason,
    responsible_user_id, recorded_by, waste_date, photo_url, created_at, updated_at
  )
    SELECT :warehouse_id, :product_id, :'lot_id', 'DAMAGE',
      1.500, 120.00, 'Desperdicio demo inicial',
         :user_id, :user_id, NOW(), NULL, NOW(), NOW()
  WHERE NOT EXISTS (SELECT 1 FROM existing_waste)
  RETURNING id
)
SELECT COALESCE((SELECT id FROM existing_waste), (SELECT id FROM inserted_waste)) AS waste_id;
\gset

COMMIT;

-- Resumen
SELECT :company_id AS company_id,
       :branch_id AS branch_id,
       :warehouse_id AS warehouse_id,
       :product_id AS product_id,
      :'lot_id' AS lot_id,
       :adjustment_id AS adjustment_id,
       :waste_id AS waste_id;