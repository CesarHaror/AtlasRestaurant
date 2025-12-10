-- Migración para actualizar la restricción CHECK de movement_type
-- Agregar WASTE e INITIAL a los valores permitidos

BEGIN;

-- Eliminar la restricción existente
ALTER TABLE inventory_movements DROP CONSTRAINT chk_movement_type;

-- Agregar la nueva restricción con los valores correctos
ALTER TABLE inventory_movements 
ADD CONSTRAINT chk_movement_type CHECK (movement_type IN ('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER', 'WASTE', 'INITIAL', 'RETURN'));

COMMIT;
