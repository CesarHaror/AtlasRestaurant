-- ================================================
-- MÓDULO SALES - CREACIÓN DE TABLAS
-- ================================================
-- Tablas: customers, cash_registers, cash_register_sessions,
--         sales, sale_items, sale_payments
-- ================================================

-- ================================================
-- TABLA: customers
-- ================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER REFERENCES companies(id),
    customer_type VARCHAR(20) NOT NULL DEFAULT 'RETAIL',
    code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    business_name VARCHAR(255),
    rfc VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    credit_limit DECIMAL(12, 2) DEFAULT 0.00,
    current_balance DECIMAL(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT chk_customer_type CHECK (customer_type IN ('RETAIL', 'WHOLESALE', 'CREDIT'))
);

CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(code);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);

-- ================================================
-- TABLA: cash_registers
-- ================================================
CREATE TABLE IF NOT EXISTS cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id INTEGER REFERENCES branches(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    device_identifier VARCHAR(100),
    has_scale BOOLEAN DEFAULT false,
    scale_port VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_registers_branch ON cash_registers(branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_registers_code ON cash_registers(code);

-- ================================================
-- TABLA: cash_register_sessions
-- ================================================
CREATE TABLE IF NOT EXISTS cash_register_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_register_id UUID NOT NULL REFERENCES cash_registers(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    opened_at TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP,
    opening_cash DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    expected_cash DECIMAL(12, 2) DEFAULT 0.00,
    actual_cash DECIMAL(12, 2),
    cash_difference DECIMAL(12, 2) DEFAULT 0.00,
    card_total DECIMAL(12, 2) DEFAULT 0.00,
    transfer_total DECIMAL(12, 2) DEFAULT 0.00,
    total_sales DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_session_status CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_cash_register ON cash_register_sessions(cash_register_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON cash_register_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON cash_register_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_opened_at ON cash_register_sessions(opened_at);

-- ================================================
-- TABLA: sales
-- ================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INTEGER REFERENCES companies(id),
    branch_id INTEGER REFERENCES branches(id),
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    ticket_number VARCHAR(50),
    customer_id UUID REFERENCES customers(id),
    cash_register_id UUID REFERENCES cash_registers(id),
    session_id UUID REFERENCES cash_register_sessions(id),
    sale_date TIMESTAMP NOT NULL DEFAULT NOW(),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sale_type VARCHAR(20) NOT NULL DEFAULT 'RETAIL',
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    cashier_id INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT chk_sale_type CHECK (sale_type IN ('RETAIL', 'WHOLESALE', 'CREDIT')),
    CONSTRAINT chk_sale_status CHECK (status IN ('COMPLETED', 'CANCELLED', 'REFUNDED'))
);

CREATE INDEX IF NOT EXISTS idx_sales_company ON sales(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_cash_register ON sales(cash_register_id);
CREATE INDEX IF NOT EXISTS idx_sales_session ON sales(session_id);
CREATE INDEX IF NOT EXISTS idx_sales_cashier ON sales(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_number ON sales(sale_number);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- ================================================
-- TABLA: sale_items
-- ================================================
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity DECIMAL(10, 3) NOT NULL,
    weight DECIMAL(10, 3),
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    unit_cost DECIMAL(12, 2),
    total_cost DECIMAL(12, 2),
    lot_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_lot ON sale_items(lot_id);

-- ================================================
-- TABLA: sale_payments
-- ================================================
CREATE TABLE IF NOT EXISTS sale_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    payment_method VARCHAR(20) NOT NULL,
    payment_reference VARCHAR(100),
    amount DECIMAL(12, 2) NOT NULL,
    card_last_digits VARCHAR(4),
    card_type VARCHAR(20),
    payment_date TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'CARD', 'TRANSFER', 'CREDIT')),
    CONSTRAINT chk_card_type CHECK (card_type IS NULL OR card_type IN ('CREDIT', 'DEBIT'))
);

CREATE INDEX IF NOT EXISTS idx_sale_payments_sale ON sale_payments(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_payments_method ON sale_payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_sale_payments_date ON sale_payments(payment_date);

-- ================================================
-- COMENTARIOS EN TABLAS
-- ================================================
COMMENT ON TABLE customers IS 'Catálogo de clientes del sistema';
COMMENT ON TABLE cash_registers IS 'Cajas registradoras físicas por sucursal';
COMMENT ON TABLE cash_register_sessions IS 'Sesiones de apertura/cierre de caja';
COMMENT ON TABLE sales IS 'Registro de ventas realizadas';
COMMENT ON TABLE sale_items IS 'Detalle de productos vendidos por venta';
COMMENT ON TABLE sale_payments IS 'Métodos de pago aplicados a cada venta';
