BEGIN;

CREATE TABLE inventory_transfers (
  id SERIAL PRIMARY KEY,
  source_warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  destination_warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES inventory_lots(id) ON DELETE CASCADE,
  quantity DECIMAL(12, 4) NOT NULL,
  unit_cost DECIMAL(12, 4),
  notes TEXT,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_different_warehouses CHECK (source_warehouse_id != destination_warehouse_id),
  CONSTRAINT chk_positive_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_inventory_transfers_source_dest 
  ON inventory_transfers(source_warehouse_id, destination_warehouse_id);
CREATE INDEX idx_inventory_transfers_product 
  ON inventory_transfers(product_id);
CREATE INDEX idx_inventory_transfers_created 
  ON inventory_transfers(created_at);

COMMIT;
