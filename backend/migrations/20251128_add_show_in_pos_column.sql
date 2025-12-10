-- Agregar columna show_in_pos a la tabla products
ALTER TABLE products
ADD COLUMN show_in_pos BOOLEAN DEFAULT true NOT NULL;

-- Crear índice para mejor rendimiento en filtrados
CREATE INDEX idx_products_show_in_pos ON products(show_in_pos);
