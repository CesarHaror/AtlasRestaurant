-- Demo lots seed: adds additional inventory lots for testing stock views
-- Safe to run multiple times; checks for existing lot_number before inserting.
-- Assumes existing product with id 17 and warehouse with id 5 from prior seed.

DO $$
DECLARE
    existing1 INT;
    existing2 INT;
BEGIN
    SELECT 1 INTO existing1 FROM inventory_lots WHERE lot_number = 'L-TEST-001' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO inventory_lots (
            id,
            product_id,
            warehouse_id,
            lot_number,
            internal_lot,
            initial_quantity,
            current_quantity,
            reserved_quantity,
            unit_cost,
            expiry_date,
            entry_date,
            status,
            notes,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            17,
            5,
            'L-TEST-001',
            'INT-2511-0002', -- continue internal sequence after existing INT-2511-0001
            25.500,
            25.500,
            0,
            12.3400,
            '2025-12-31',
            NOW(),
            'AVAILABLE',
            'Demo lote 1 para pruebas de stock',
            NOW(),
            NOW()
        );
    END IF;

    SELECT 1 INTO existing2 FROM inventory_lots WHERE lot_number = 'L-TEST-002' LIMIT 1;
    IF NOT FOUND THEN
        INSERT INTO inventory_lots (
            id,
            product_id,
            warehouse_id,
            lot_number,
            internal_lot,
            initial_quantity,
            current_quantity,
            reserved_quantity,
            unit_cost,
            expiry_date,
            entry_date,
            status,
            notes,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            17,
            5,
            'L-TEST-002',
            'INT-2511-0003',
            10.000,
            4.500,        -- simulate parcial consumo
            2.000,        -- simulate reserva
            11.9900,
            '2025-12-15', -- nearer expiry for testing alert coloring
            NOW(),
            'AVAILABLE',
            'Demo lote 2 cercano a vencimiento',
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- Output confirmation rows
SELECT lot_number, internal_lot, current_quantity, reserved_quantity, unit_cost, expiry_date
FROM inventory_lots
WHERE lot_number IN ('L-TEST-001','L-TEST-002');