-- PostgreSQL initialization script for CommunityHub

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if not exists (this might not be needed as it's created by POSTGRES_DB)
-- But useful for reference
-- CREATE DATABASE communityhub;

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for performance (TypeORM will create tables)
-- These will be created after tables are created by TypeORM

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'CommunityHub database initialized successfully!';
END $$;