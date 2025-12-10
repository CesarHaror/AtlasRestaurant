-- Add branch_id column to users table
ALTER TABLE users ADD COLUMN branch_id INTEGER;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_branch_id
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_users_branch_id ON users(branch_id);
