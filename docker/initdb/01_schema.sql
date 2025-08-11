-- Initialize schema for local Docker Postgres/PostGIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Auth emulation (simple users table to mimic auth.users for local dev)
CREATE SCHEMA IF NOT EXISTS auth;
-- Roles for PostgREST
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon'
  ) THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator'
  ) THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'currijobs';
    GRANT anon TO authenticator;
  END IF;
END$$;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Import application schema
\i ../../supabase_schema_complete.sql

-- Basic privileges for anon to read public tables in local dev (adjust per table as needed)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;


