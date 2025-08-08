-- Fixed Supabase Schema for CurriJobs App
-- This schema matches our Zod validation schemas exactly

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Minimal auth schema for local Postgres (Supabase provides this in the cloud)
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom types (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_category') THEN
    CREATE TYPE task_category AS ENUM (
  'plumbing',
  'electrician',
  'carpentry',
  'painting',
  'appliance_repair',
  'cleaning',
  'laundry_ironing',
  'cooking',
  'grocery_shopping',
  'pet_care',
  'gardening',
  'moving_help',
  'trash_removal',
  'window_washing',
  'babysitting',
  'elderly_care',
  'tutoring',
  'delivery_errands',
  'tech_support',
  'photography'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM (
  'open',
  'in_progress',
  'completed',
  'cancelled'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
    CREATE TYPE offer_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'withdrawn'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM (
  'cash',
  'bank_transfer',
  'mobile_payment',
  'credit_card'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency') THEN
    CREATE TYPE currency AS ENUM (
  'CRC',
  'USD'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
  'task_created',
  'offer_received',
  'offer_accepted',
  'task_completed',
  'payment_received',
  'system'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
    CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high'
    );
  END IF;
END $$;

-- User Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating DOUBLE PRECISION DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_jobs INTEGER DEFAULT 0 CHECK (total_jobs >= 0),
  total_earnings INTEGER DEFAULT 0 CHECK (total_earnings >= 0),
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table (FIXED - added missing status column)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  description TEXT NOT NULL CHECK (length(description) >= 1 AND length(description) <= 2000),
  category task_category NOT NULL,
  reward INTEGER NOT NULL CHECK (reward >= 0 AND reward <= 1000000),
  time_estimate TEXT,
  location TEXT NOT NULL CHECK (length(location) <= 200),
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  status task_status DEFAULT 'open',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  images TEXT[],
  tags TEXT[],
  priority task_priority DEFAULT 'medium',
  is_urgent BOOLEAN DEFAULT FALSE,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proposed_reward INTEGER NOT NULL CHECK (proposed_reward >= 0 AND proposed_reward <= 1000000),
  message TEXT NOT NULL CHECK (length(message) >= 1 AND length(message) <= 1000),
  status offer_status DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT CHECK (length(review) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (length(comment) <= 500),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  message TEXT NOT NULL CHECK (length(message) >= 1 AND length(message) <= 1000),
  type notification_type NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  related_offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0 AND amount <= 1000000),
  currency currency DEFAULT 'CRC',
  status payment_status DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  transaction_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  -- job execution metadata
  work_started_at TIMESTAMP WITH TIME ZONE,
  work_ended_at TIMESTAMP WITH TIME ZONE,
  job_latitude DOUBLE PRECISION,
  job_longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure new columns exist even if payments table was created previously
ALTER TABLE payments ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS work_ended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS job_latitude DOUBLE PRECISION;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS job_longitude DOUBLE PRECISION;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_reward ON tasks(reward);

CREATE INDEX IF NOT EXISTS idx_offers_task_id ON offers(task_id);
CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

CREATE INDEX IF NOT EXISTS idx_reviews_task_id ON reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_task_id ON payments(task_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee_id ON payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Row Level Security (RLS) disabled for local PostgREST dev
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN ST_Distance(
    ST_SetSRID(ST_MakePoint(lon1, lat1), 4326),
    ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)
  ) / 1000; -- Convert to kilometers
END;
$$ LANGUAGE plpgsql;

-- Minimal local auth users to satisfy FKs
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000001','demo@currijobs.com'),
  ('00000000-0000-0000-0000-000000000002','maria@example.com'),
  ('00000000-0000-0000-0000-000000000003','carlos@example.com'),
  ('00000000-0000-0000-0000-000000000004','ana@example.com')
ON CONFLICT (id) DO NOTHING;

-- Seed profiles
INSERT INTO profiles (id, email, full_name, location, latitude, longitude) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@currijobs.com', 'Demo User', 'San José, Costa Rica', 9.9281, -84.0907),
  ('00000000-0000-0000-0000-000000000002', 'maria@example.com', 'María López', 'Escazú, Costa Rica', 9.9181, -84.0807),
  ('00000000-0000-0000-0000-000000000003', 'carlos@example.com', 'Carlos Mendez', 'San José, Costa Rica', 9.93, -84.09),
  ('00000000-0000-0000-0000-000000000004', 'ana@example.com', 'Ana Jiménez', 'Heredia, Costa Rica', 10.0, -84.11)
ON CONFLICT (id) DO NOTHING;

-- User 1 (Demo User) - Cleaning and basic tasks
INSERT INTO tasks (title, description, category, reward, time_estimate, location, latitude, longitude, user_id) VALUES
  ('House Cleaning in San José', 'Need help cleaning a 3-bedroom apartment in downtown San José. Looking for someone reliable and thorough.', 'cleaning', 25000, '3 hours', 'Downtown San José, Costa Rica', 9.9281, -84.0907, '00000000-0000-0000-0000-000000000001'),
  ('Grocery Shopping', 'Need someone to do grocery shopping for elderly parents. List will be provided, delivery to San José area.', 'grocery_shopping', 20000, '2 hours', 'San José, Costa Rica', 9.9281, -84.0907, '00000000-0000-0000-0000-000000000001'),
  ('Pet Sitting for Golden Retriever', 'Looking for someone to walk and feed my friendly Golden Retriever. Need someone who loves dogs and is available for daily walks.', 'pet_care', 15000, '2 hours daily', 'San José, Costa Rica', 9.9281, -84.0907, '00000000-0000-0000-0000-000000000001');

-- User 2 (Juan) - Technical and repair tasks
INSERT INTO tasks (title, description, category, reward, time_estimate, location, latitude, longitude, user_id) VALUES
  ('Plumbing Repair', 'Need help fixing a leaky faucet in the kitchen. Should be a quick job for someone with experience.', 'plumbing', 35000, '1 hour', 'Escazú, San José, Costa Rica', 9.9181, -84.0807, '00000000-0000-0000-0000-000000000002'),
  ('Tech Support', 'Need help setting up a new laptop and transferring data from old computer. Basic tech skills required.', 'tech_support', 40000, '3 hours', 'Escazú, San José, Costa Rica', 9.9181, -84.0807, '00000000-0000-0000-0000-000000000002'),
  ('Moving Help', 'Need help moving furniture from apartment to new house. Heavy lifting required.', 'moving_help', 50000, '6 hours', 'Escazú, San José, Costa Rica', 9.9181, -84.0807, '00000000-0000-0000-0000-000000000002'),
  ('Garden Maintenance', 'Need help with garden maintenance including pruning, weeding, and basic landscaping.', 'gardening', 30000, '4 hours', 'Escazú, San José, Costa Rica', 9.9181, -84.0807, '00000000-0000-0000-0000-000000000002');

-- User 3 (María) - Creative and service tasks
INSERT INTO tasks (title, description, category, reward, time_estimate, location, latitude, longitude, user_id) VALUES
  ('Cooking for Party', 'Need someone to help prepare food for a birthday party. Cooking experience preferred.', 'cooking', 45000, '5 hours', 'Heredia, Costa Rica', 9.9984, -84.1169, '00000000-0000-0000-0000-000000000003'),
  ('Babysitting', 'Looking for a reliable babysitter for my 3-year-old daughter. Experience with young children preferred.', 'babysitting', 30000, '4 hours', 'Heredia, Costa Rica', 9.9984, -84.1169, '00000000-0000-0000-0000-000000000003'),
  ('Tutoring Math', 'Need help with high school math homework. Patient and experienced tutor preferred.', 'tutoring', 25000, '2 hours', 'Heredia, Costa Rica', 9.9984, -84.1169, '00000000-0000-0000-0000-000000000003'),
  ('Photography for Event', 'Need a photographer for a small family event. Professional equipment not required.', 'photography', 60000, '3 hours', 'Heredia, Costa Rica', 9.9984, -84.1169, '00000000-0000-0000-0000-000000000003');

-- User 4 (Carlos) - Home improvement and specialized tasks
INSERT INTO tasks (title, description, category, reward, time_estimate, location, latitude, longitude, user_id) VALUES
  ('Electrical Work', 'Need help installing new light fixtures in the living room. Electrical experience required.', 'electrician', 55000, '4 hours', 'Alajuela, Costa Rica', 10.0167, -84.2167, '00000000-0000-0000-0000-000000000004'),
  ('Carpentry Work', 'Need help building a bookshelf. Basic carpentry skills required.', 'carpentry', 40000, '5 hours', 'Alajuela, Costa Rica', 10.0167, -84.2167, '00000000-0000-0000-0000-000000000004'),
  ('Painting House', 'Need help painting the exterior of the house. Experience with exterior painting preferred.', 'painting', 70000, '8 hours', 'Alajuela, Costa Rica', 10.0167, -84.2167, '00000000-0000-0000-0000-000000000004'),
  ('Appliance Repair', 'Need help fixing the washing machine. Appliance repair experience required.', 'appliance_repair', 45000, '2 hours', 'Alajuela, Costa Rica', 10.0167, -84.2167, '00000000-0000-0000-0000-000000000004'),
  ('Window Washing', 'Need help washing all the windows in the house. Second floor access required.', 'window_washing', 25000, '3 hours', 'Alajuela, Costa Rica', 10.0167, -84.2167, '00000000-0000-0000-0000-000000000004');


