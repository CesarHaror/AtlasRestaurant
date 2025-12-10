-- Script para crear todas las tablas del módulo de inventario

-- 1. Tabla de almacenes
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    warehouse_type VARCHAR(50) NOT NULL,
    has_temperature_control BOOLEAN DEFAULT false,
    target_temperature DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_warehouse_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- 2. Tabla de lotes de inventario
CREATE TABLE IF NOT EXISTS inventory_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    warehouse_id UUID NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    internal_lot VARCHAR(50) NOT NULL UNIQUE,
    initial_quantity DECIMAL(12,3) NOT NULL,
    current_quantity DECIMAL(12,3) NOT NULL,
    reserved_quantity DECIMAL(12,3) DEFAULT 0,
    unit_cost DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (current_quantity * unit_cost) STORED,
    production_date DATE,
    expiry_date DATE,
    entry_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_lot_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_lot_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);

-- 3. Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_type VARCHAR(20) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    product_id UUID NOT NULL,
    lot_id UUID,
    warehouse_id UUID NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit_cost DECIMAL(12,2),
    total_cost DECIMAL(15,2),
    user_id UUID NOT NULL,
    movement_date TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_movement_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_movement_lot FOREIGN KEY (lot_id) REFERENCES inventory_lots(id) ON DELETE SET NULL,
    CONSTRAINT fk_movement_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    CONSTRAINT fk_movement_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabla de ajustes de inventario
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL,
    adjustment_number VARCHAR(50) NOT NULL UNIQUE,
    adjustment_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL,
    approved_by UUID,
    applied_by UUID,
    adjustment_date TIMESTAMP NOT NULL,
    approved_at TIMESTAMP,
    applied_at TIMESTAMP,
    reason TEXT,
    notes TEXT,
    approval_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_adjustment_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    CONSTRAINT fk_adjustment_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_adjustment_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_adjustment_applier FOREIGN KEY (applied_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Tabla de items de ajuste
CREATE TABLE IF NOT EXISTS adjustment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID NOT NULL,
    product_id UUID NOT NULL,
    lot_id UUID NOT NULL,
    system_quantity DECIMAL(12,3) NOT NULL,
    physical_quantity DECIMAL(12,3) NOT NULL,
    difference DECIMAL(12,3) GENERATED ALWAYS AS (physical_quantity - system_quantity) STORED,
    unit_cost DECIMAL(12,2) NOT NULL,
    cost_impact DECIMAL(15,2) GENERATED ALWAYS AS ((physical_quantity - system_quantity) * unit_cost) STORED,
    reason TEXT,
    CONSTRAINT fk_adjustment_item_adjustment FOREIGN KEY (adjustment_id) REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
    CONSTRAINT fk_adjustment_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_adjustment_item_lot FOREIGN KEY (lot_id) REFERENCES inventory_lots(id) ON DELETE CASCADE
);

-- 6. Tabla de registros de desperdicio
CREATE TABLE IF NOT EXISTS waste_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID NOT NULL,
    product_id UUID NOT NULL,
    lot_id UUID,
    waste_type VARCHAR(30) NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    reason TEXT NOT NULL,
    responsible_user_id UUID,
    waste_date TIMESTAMP NOT NULL,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_waste_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
    CONSTRAINT fk_waste_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_waste_lot FOREIGN KEY (lot_id) REFERENCES inventory_lots(id) ON DELETE SET NULL,
    CONSTRAINT fk_waste_user FOREIGN KEY (responsible_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_warehouses_code ON warehouses(code);
CREATE INDEX IF NOT EXISTS idx_warehouses_branch ON warehouses(branch_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_deleted ON warehouses(deleted_at);

CREATE INDEX IF NOT EXISTS idx_lots_product ON inventory_lots(product_id);
CREATE INDEX IF NOT EXISTS idx_lots_warehouse ON inventory_lots(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON inventory_lots(status);
CREATE INDEX IF NOT EXISTS idx_lots_expiry ON inventory_lots(expiry_date);

CREATE INDEX IF NOT EXISTS idx_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_warehouse ON inventory_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movements_date ON inventory_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_movements_type ON inventory_movements(movement_type);

CREATE INDEX IF NOT EXISTS idx_adjustments_warehouse ON inventory_adjustments(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_status ON inventory_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_adjustments_date ON inventory_adjustments(adjustment_date);

CREATE INDEX IF NOT EXISTS idx_waste_warehouse ON waste_records(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_waste_product ON waste_records(product_id);
CREATE INDEX IF NOT EXISTS idx_waste_date ON waste_records(waste_date);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_lots_updated_at BEFORE UPDATE ON inventory_lots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_adjustments_updated_at BEFORE UPDATE ON inventory_adjustments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
