-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- This init script runs automatically when the PostgreSQL container starts
-- Additional table creation is handled by Prisma migrations
