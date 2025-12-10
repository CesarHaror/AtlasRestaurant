-- Migration: Create warehouses, inventory_lots and inventory_movements tables
-- Date: 2025-11-24
-- Description: Creates tables needed for PEPS algorithm and inventory tracking

BEGIN;

-- ================================================
-- TABLE: warehouses
-- ================================================
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    warehouse_type VARCHAR(50) DEFAULT 'GENERAL',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warehouses_branch ON warehouses(branch_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);

-- ================================================
-- TABLE: inventory_lots
-- ================================================
CREATE TABLE IF NOT EXISTS inventory_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INTEGER NOT NULL REFERENCES products(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    lot_number VARCHAR(100) NOT NULL,
    entry_date TIMESTAMP NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMP,
    initial_quantity DECIMAL(10, 3) NOT NULL,
    current_quantity DECIMAL(10, 3) NOT NULL,
    unit_cost DECIMAL(12, 4) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_lot_status CHECK (status IN ('AVAILABLE', 'SOLD_OUT', 'EXPIRED', 'DAMAGED')),
    CONSTRAINT chk_lot_quantities CHECK (current_quantity >= 0 AND current_quantity <= initial_quantity)
);

CREATE INDEX IF NOT EXISTS idx_inventory_lots_product ON inventory_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_warehouse ON inventory_lots(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_status ON inventory_lots(status);
CREATE INDEX IF NOT EXISTS idx_inventory_lots_entry_date ON inventory_lots(entry_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_lots_number ON inventory_lots(warehouse_id, lot_number);

-- ================================================
-- TABLE: inventory_movements
-- ================================================
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(255),
    product_id INTEGER NOT NULL REFERENCES products(id),
    lot_id UUID REFERENCES inventory_lots(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    quantity DECIMAL(10, 3) NOT NULL,
    unit_cost DECIMAL(12, 4),
    total_cost DECIMAL(12, 2),
    user_id INTEGER REFERENCES users(id),
    movement_date TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_movement_type CHECK (movement_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER', 'RETURN'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_lot ON inventory_movements(lot_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_warehouse ON inventory_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(movement_date);

COMMIT;
