-- Migration: Create Purchases Tables
-- Date: 2025-11-27
-- Description: Creates suppliers, purchases, and purchase_items tables

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  business_name VARCHAR(128) NOT NULL,
  trade_name VARCHAR(128),
  rfc VARCHAR(16),
  contact_name VARCHAR(128),
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(10),
  payment_terms VARCHAR(64),
  credit_limit NUMERIC(14,2) DEFAULT 0,
  credit_days INT DEFAULT 0,
  rating INT DEFAULT 0,
  notes TEXT,
  current_debt NUMERIC(14,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  purchase_number VARCHAR(32),
  status VARCHAR(10) DEFAULT 'DRAFT',
  branch_id INT NOT NULL,
  warehouse_id INT NOT NULL,
  supplier_id INT NOT NULL REFERENCES suppliers(id),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  supplier_invoice VARCHAR(64),
  payment_terms VARCHAR(64),
  due_date DATE,
  notes TEXT,
  subtotal NUMERIC(14,4) DEFAULT 0,
  tax_amount NUMERIC(14,4) DEFAULT 0,
  discount_amount NUMERIC(14,4) DEFAULT 0,
  total_amount NUMERIC(14,4) DEFAULT 0,
  received_date TIMESTAMP,
  created_by INT,
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id INT NOT NULL,
  quantity_ordered NUMERIC(14,4) NOT NULL,
  quantity_received NUMERIC(14,4) DEFAULT 0,
  unit_cost NUMERIC(14,4) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  lot_number VARCHAR(64),
  expiry_date DATE,
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_order_date ON purchases(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product ON purchase_items(product_id);

COMMENT ON TABLE suppliers IS 'Proveedores del sistema';
COMMENT ON TABLE purchases IS 'Órdenes de compra';
COMMENT ON TABLE purchase_items IS 'Items de las órdenes de compra';
