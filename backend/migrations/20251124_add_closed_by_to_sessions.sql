-- Migration: Add closed_by column to cash_register_sessions
-- Date: 2025-11-24
-- Description: Agrega columna para registrar quién cerró la sesión

BEGIN;

ALTER TABLE cash_register_sessions
ADD COLUMN IF NOT EXISTS closed_by INTEGER REFERENCES users(id);

COMMIT;
