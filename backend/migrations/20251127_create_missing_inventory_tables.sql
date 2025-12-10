-- Migration: Create missing inventory tables (adjustments and waste)
-- Date: 2025-11-27
-- Description: Creates inventory_adjustments, adjustment_items, and waste_records tables

-- Create inventory_adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    adjustment_type VARCHAR(50) NOT NULL DEFAULT 'COUNT',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    adjustment_date TIMESTAMP NOT NULL DEFAULT NOW(),
    reason TEXT,
    notes TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    applied_by INTEGER REFERENCES users(id),
    applied_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT chk_adjustment_type CHECK (adjustment_type IN ('COUNT', 'DAMAGE', 'EXPIRY', 'CORRECTION', 'OTHER')),
    CONSTRAINT chk_adjustment_status CHECK (status IN ('DRAFT', 'APPROVED', 'APPLIED', 'CANCELLED'))
);

-- Create adjustment_items table
CREATE TABLE IF NOT EXISTS adjustment_items (
    id SERIAL PRIMARY KEY,
    adjustment_id INTEGER NOT NULL REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
    lot_id UUID NOT NULL REFERENCES inventory_lots(id) ON DELETE CASCADE,
    system_quantity DECIMAL(10,3) NOT NULL,
    physical_quantity DECIMAL(10,3) NOT NULL,
    difference DECIMAL(10,3) GENERATED ALWAYS AS (physical_quantity - system_quantity) STORED,
    unit_cost DECIMAL(10,2),
    cost_impact DECIMAL(10,2) GENERATED ALWAYS AS ((physical_quantity - system_quantity) * unit_cost) STORED,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create waste_records table
CREATE TABLE IF NOT EXISTS waste_records (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    lot_id UUID NOT NULL REFERENCES inventory_lots(id) ON DELETE CASCADE,
    waste_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    reason TEXT NOT NULL,
    waste_date TIMESTAMP NOT NULL DEFAULT NOW(),
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT chk_waste_type CHECK (waste_type IN ('EXPIRY', 'DAMAGE', 'THEFT', 'TEMPERATURE', 'QUALITY', 'OTHER')),
    CONSTRAINT chk_waste_quantity CHECK (quantity > 0)
);

-- Create indexes for inventory_adjustments
CREATE INDEX IF NOT EXISTS idx_adjustments_warehouse ON inventory_adjustments(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_status ON inventory_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_adjustments_date ON inventory_adjustments(adjustment_date);
CREATE INDEX IF NOT EXISTS idx_adjustments_deleted_at ON inventory_adjustments(deleted_at);

-- Create indexes for adjustment_items
CREATE INDEX IF NOT EXISTS idx_adjustment_items_adjustment ON adjustment_items(adjustment_id);
CREATE INDEX IF NOT EXISTS idx_adjustment_items_lot ON adjustment_items(lot_id);

-- Create indexes for waste_records
CREATE INDEX IF NOT EXISTS idx_waste_warehouse ON waste_records(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_waste_lot ON waste_records(lot_id);
CREATE INDEX IF NOT EXISTS idx_waste_date ON waste_records(waste_date);
CREATE INDEX IF NOT EXISTS idx_waste_type ON waste_records(waste_type);
CREATE INDEX IF NOT EXISTS idx_waste_deleted_at ON waste_records(deleted_at);

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_adjustments_updated_at
    BEFORE UPDATE ON inventory_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adjustment_items_updated_at
    BEFORE UPDATE ON adjustment_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_records_updated_at
    BEFORE UPDATE ON waste_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE inventory_adjustments IS 'Registros de ajustes de inventario (conteos físicos, correcciones)';
COMMENT ON TABLE adjustment_items IS 'Ítems individuales de cada ajuste de inventario';
COMMENT ON TABLE waste_records IS 'Registro de desperdicios y mermas';

COMMENT ON COLUMN inventory_adjustments.adjustment_type IS 'Tipo de ajuste: COUNT, DAMAGE, EXPIRY, CORRECTION, OTHER';
COMMENT ON COLUMN inventory_adjustments.status IS 'Estado del ajuste: DRAFT, APPROVED, APPLIED, CANCELLED';
COMMENT ON COLUMN adjustment_items.difference IS 'Diferencia calculada: físico - sistema';
COMMENT ON COLUMN adjustment_items.cost_impact IS 'Impacto económico del ajuste';
COMMENT ON COLUMN waste_records.waste_type IS 'Tipo de desperdicio: EXPIRY, DAMAGE, THEFT, TEMPERATURE, QUALITY, OTHER';
COMMENT ON COLUMN waste_records.total_cost IS 'Costo total del desperdicio';
