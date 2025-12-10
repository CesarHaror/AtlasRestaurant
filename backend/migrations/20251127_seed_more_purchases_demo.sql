-- Seed: Agregar más datos demo para compras
-- Date: 2025-11-27

-- Insertar más proveedores
INSERT INTO suppliers (code, business_name, trade_name, rfc, contact_name, email, phone, mobile, payment_terms, credit_limit, credit_days, rating, active)
VALUES 
  ('SUP-004', 'Frigoríficos del Pacífico S.A.', 'Frigoríficos Pacífico', 'FPA080910JKL', 'Roberto Sánchez', 'ventas@frigopacífico.com', '3334567890', '3331234567', '15 días', 40000, 15, 4, true),
  ('SUP-005', 'Empacadora de Carnes Premium', 'Premium Carnes', 'ECP111213MNO', 'Ana Martínez', 'contacto@premiumcarnes.com', '3345678901', '3312345678', '20 días', 35000, 20, 5, true)
ON CONFLICT (code) DO NOTHING;

-- Insertar más órdenes de compra
DO $$
DECLARE
  v_supplier_id INT;
  v_warehouse_id INT;
  v_product_id INT;
  v_purchase_id INT;
BEGIN
  -- Obtener IDs necesarios
  SELECT id INTO v_warehouse_id FROM warehouses LIMIT 1;
  SELECT id INTO v_product_id FROM products LIMIT 1;
  
  IF v_warehouse_id IS NOT NULL AND v_product_id IS NOT NULL THEN
    -- Compra SENT (aprobada)
    SELECT id INTO v_supplier_id FROM suppliers WHERE code = 'SUP-002' LIMIT 1;
    IF v_supplier_id IS NOT NULL THEN
      INSERT INTO purchases (
        purchase_number, status, branch_id, warehouse_id, supplier_id,
        order_date, expected_delivery_date, supplier_invoice, payment_terms,
        subtotal, tax_amount, discount_amount, total_amount, created_by, approved_by
      )
      VALUES (
        'PUR-2411-0002', 'SENT', 1, v_warehouse_id, v_supplier_id,
        CURRENT_DATE - 2, CURRENT_DATE + 3, 'FACT-SUP002-001', '15 días',
        12000, 1920, 0, 13920, 1, 1
      )
      RETURNING id INTO v_purchase_id;
      
      INSERT INTO purchase_items (
        purchase_id, product_id, quantity_ordered, quantity_received,
        unit_cost, tax_rate, discount_percentage
      )
      VALUES 
        (v_purchase_id, v_product_id, 80, 0, 150.00, 16, 0);
    END IF;
    
    -- Compra RECEIVED (completamente recibida)
    SELECT id INTO v_supplier_id FROM suppliers WHERE code = 'SUP-003' LIMIT 1;
    IF v_supplier_id IS NOT NULL THEN
      INSERT INTO purchases (
        purchase_number, status, branch_id, warehouse_id, supplier_id,
        order_date, expected_delivery_date, supplier_invoice, payment_terms,
        subtotal, tax_amount, discount_amount, total_amount, created_by, approved_by, received_date
      )
      VALUES (
        'PUR-2411-0003', 'RECEIVED', 1, v_warehouse_id, v_supplier_id,
        CURRENT_DATE - 7, CURRENT_DATE - 2, 'FACT-SUP003-001', 'Contado',
        9000, 1440, 450, 9990, 1, 1, CURRENT_DATE - 2
      )
      RETURNING id INTO v_purchase_id;
      
      INSERT INTO purchase_items (
        purchase_id, product_id, quantity_ordered, quantity_received,
        unit_cost, tax_rate, discount_percentage, lot_number
      )
      VALUES 
        (v_purchase_id, v_product_id, 60, 60, 150.00, 16, 5, 'LOT-DEMO-001');
    END IF;
    
    -- Compra PARTIAL (parcialmente recibida)
    SELECT id INTO v_supplier_id FROM suppliers WHERE code = 'SUP-004' LIMIT 1;
    IF v_supplier_id IS NOT NULL THEN
      INSERT INTO purchases (
        purchase_number, status, branch_id, warehouse_id, supplier_id,
        order_date, expected_delivery_date, supplier_invoice, payment_terms,
        subtotal, tax_amount, discount_amount, total_amount, created_by, approved_by, received_date
      )
      VALUES (
        'PUR-2411-0004', 'PARTIAL', 1, v_warehouse_id, v_supplier_id,
        CURRENT_DATE - 5, CURRENT_DATE, 'FACT-SUP004-001', '15 días',
        18000, 2880, 0, 20880, 1, 1, CURRENT_DATE - 1
      )
      RETURNING id INTO v_purchase_id;
      
      INSERT INTO purchase_items (
        purchase_id, product_id, quantity_ordered, quantity_received,
        unit_cost, tax_rate, discount_percentage, lot_number
      )
      VALUES 
        (v_purchase_id, v_product_id, 120, 60, 150.00, 16, 0, 'LOT-DEMO-002');
    END IF;
  END IF;
END $$;

COMMENT ON TABLE suppliers IS 'Demo actualizado: 5 proveedores total';
COMMENT ON TABLE purchases IS 'Demo actualizado: 4 órdenes de compra con diferentes estados';
