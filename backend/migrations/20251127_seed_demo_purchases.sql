-- Migration: Seed Demo Suppliers and Purchases
-- Date: 2025-11-27
-- Description: Inserts demo suppliers and sample purchases for testing

-- Insert demo suppliers (only if not exists)
INSERT INTO suppliers (code, business_name, trade_name, rfc, contact_name, email, phone, mobile, payment_terms, credit_limit, credit_days, rating, active)
VALUES 
  ('SUP-001', 'Carnes Selectas S.A. de C.V.', 'Carnes Selectas', 'CSE010203ABC', 'Juan Pérez', 'contacto@carnesselectas.com', '3312345678', '3398765432', '30 días', 50000, 30, 5, true),
  ('SUP-002', 'Distribuidora de Alimentos del Norte', 'Alimentos Norte', 'DAN040506DEF', 'María López', 'ventas@alimentosnorte.com', '8181234567', '8187654321', '15 días', 30000, 15, 4, true),
  ('SUP-003', 'Proveedora de Insumos GDL', 'Insumos GDL', 'PIG070809GHI', 'Carlos Ramírez', 'compras@insumosgdl.com', '3323456789', '3329876543', 'Contado', 20000, 0, 5, true)
ON CONFLICT (code) DO NOTHING;

-- Get supplier IDs for demo purchases
DO $$
DECLARE
  v_supplier_id INT;
  v_warehouse_id INT;
  v_product_id INT;
  v_purchase_id INT;
BEGIN
  -- Get first supplier
  SELECT id INTO v_supplier_id FROM suppliers WHERE code = 'SUP-001' LIMIT 1;
  
  -- Get first warehouse
  SELECT id INTO v_warehouse_id FROM warehouses LIMIT 1;
  
  -- Get first product
  SELECT id INTO v_product_id FROM products LIMIT 1;
  
  -- Only proceed if we have the necessary data
  IF v_supplier_id IS NOT NULL AND v_warehouse_id IS NOT NULL AND v_product_id IS NOT NULL THEN
    -- Insert demo purchase (only if no purchases exist yet)
    IF NOT EXISTS (SELECT 1 FROM purchases LIMIT 1) THEN
      INSERT INTO purchases (
        purchase_number, status, branch_id, warehouse_id, supplier_id,
        order_date, expected_delivery_date, supplier_invoice, payment_terms,
        subtotal, tax_amount, discount_amount, total_amount, created_by
      )
      VALUES (
        'PUR-2411-0001', 'DRAFT', 1, v_warehouse_id, v_supplier_id,
        CURRENT_DATE, CURRENT_DATE + 5, 'FACT-SUP001-2024', '30 días',
        15000, 2400, 0, 17400, 1
      )
      RETURNING id INTO v_purchase_id;
      
      -- Insert purchase items
      INSERT INTO purchase_items (
        purchase_id, product_id, quantity_ordered, quantity_received,
        unit_cost, tax_rate, discount_percentage
      )
      VALUES 
        (v_purchase_id, v_product_id, 100, 0, 150.00, 16, 0);
    END IF;
  END IF;
END $$;

COMMENT ON TABLE suppliers IS 'Demo: 3 proveedores de prueba insertados';
COMMENT ON TABLE purchases IS 'Demo: 1 orden de compra de prueba insertada';
