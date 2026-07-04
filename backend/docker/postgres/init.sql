-- PostgreSQL initialization script for CommunityHub

-- Recreate extensions after schema drop
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Pre-populate the roles table
-- This script runs after the tables are created by TypeORM synchronize
-- To run this manually, connect to the database and execute the INSERT statements.
-- Note: In a real production setup, this would be handled by migrations.

-- This is a placeholder. The actual table name will be determined by TypeORM.
-- We will assume the table is named 'roles' and has a 'name' column.
-- The script will be executed after the application starts and synchronizes.

-- The following is commented out as it needs to run after TypeORM creates the table.
-- We will create a seeder service instead.

-- INSERT INTO roles (name) VALUES ('SUPER_ADMIN');
-- INSERT INTO roles (name) VALUES ('ADMIN');
-- INSERT INTO roles (name) VALUES ('ORGANIZER');
-- INSERT INTO roles (name) VALUES ('MENTOR');
-- INSERT INTO roles (name) VALUES ('MEMBER');
-- INSERT INTO roles (name) VALUES ('GUEST');


-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'CommunityHub database initialized successfully!';
    RAISE NOTICE 'Roles will be seeded by the application.';
END $$;