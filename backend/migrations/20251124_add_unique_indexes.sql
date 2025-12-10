-- Migration: add unique indexes to support seeds and enforce uniqueness
-- Creates unique indexes only if they do not already exist

-- Unique composite index for permissions(module, action)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_permissions_module_action'
  ) THEN
    CREATE UNIQUE INDEX idx_permissions_module_action ON permissions (module, action);
  END IF;
END$$;

-- Unique index for permissions.name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_permissions_name'
  ) THEN
    CREATE UNIQUE INDEX idx_permissions_name ON permissions (name);
  END IF;
END$$;

-- Unique index for users.username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_users_username'
  ) THEN
    CREATE UNIQUE INDEX idx_users_username ON users (username);
  END IF;
END$$;

-- Unique index for roles.name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_roles_name'
  ) THEN
    CREATE UNIQUE INDEX idx_roles_name ON roles (name);
  END IF;
END$$;
