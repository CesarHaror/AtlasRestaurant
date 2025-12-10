-- Add missing columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS rfc VARCHAR(13);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to branches table
ALTER TABLE branches ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create unique indexes for emails
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_branches_email ON branches(email);
