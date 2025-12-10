-- Add role_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID;

-- Create foreign key constraint
ALTER TABLE users
ADD CONSTRAINT fk_users_role_id
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
