-- Complete Supabase Schema for CurriJobs App
-- This schema matches our Zod validation schemas

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
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

CREATE TYPE task_status AS ENUM (
  'open',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE offer_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'withdrawn'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE payment_method AS ENUM (
  'cash',
  'bank_transfer',
  'mobile_payment',
  'credit_card'
);

CREATE TYPE currency AS ENUM (
  'CRC',
  'USD'
);

CREATE TYPE notification_type AS ENUM (
  'task_created',
  'offer_received',
  'offer_accepted',
  'task_completed',
  'payment_received',
  'system'
);

CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high'
);

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
  home_address TEXT,
  home_latitude DOUBLE PRECISION,
  home_longitude DOUBLE PRECISION,
  -- Optional geospatial columns for accurate distance queries
  geog geography(Point,4326) GENERATED ALWAYS AS (
    CASE WHEN longitude IS NOT NULL AND latitude IS NOT NULL
      THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
      ELSE NULL END
  ) STORED,
  home_geog geography(Point,4326) GENERATED ALWAYS AS (
    CASE WHEN home_longitude IS NOT NULL AND home_latitude IS NOT NULL
      THEN ST_SetSRID(ST_MakePoint(home_longitude, home_latitude), 4326)::geography
      ELSE NULL END
  ) STORED,
  rating DOUBLE PRECISION DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_jobs INTEGER DEFAULT 0 CHECK (total_jobs >= 0),
  total_earnings INTEGER DEFAULT 0 CHECK (total_earnings >= 0),
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
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
  geog geography(Point,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED,
  tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))) STORED,
  status task_status DEFAULT 'open',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  images TEXT[],
  tags TEXT[],
  priority task_priority DEFAULT 'medium',
  is_urgent BOOLEAN DEFAULT FALSE,
  deadline TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
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
  deleted_at TIMESTAMP WITH TIME ZONE,
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
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
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
  deleted_at TIMESTAMP WITH TIME ZONE,
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
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks USING GIST (geog);
CREATE INDEX IF NOT EXISTS idx_tasks_tsv ON tasks USING GIN (tsv);
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

-- Only one accepted offer per task
CREATE UNIQUE INDEX IF NOT EXISTS uniq_offer_task_accepted ON offers(task_id)
WHERE status = 'accepted';

-- Full text search helper index covered above

-- Devices for push notifications
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  push_token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios','android','web')),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their devices" ON user_devices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Badges and user_badges
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT,
  PRIMARY KEY(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports (moderation)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('task','offer','review','profile')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_review','resolved','dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Anyone can view open tasks" ON tasks
  FOR SELECT USING (status = 'open');

CREATE POLICY "Users can view tasks they created" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view tasks they are assigned to" ON tasks
  FOR SELECT USING (auth.uid() = assigned_to);

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update tasks they created" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete tasks they created" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Offers policies
CREATE POLICY "Users can view offers for tasks they created" ON offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks WHERE tasks.id = offers.task_id AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own offers" ON offers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create offers" ON offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own offers" ON offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own offers" ON offers
  FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view public reviews" ON reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view reviews they created" ON reviews
  FOR SELECT USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view payments they are involved in" ON payments
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = payer_id);

CREATE POLICY "Users can update payments they created" ON payments
  FOR UPDATE USING (auth.uid() = payer_id);

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

-- User Progress for ranks/badges
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  rank TEXT DEFAULT 'Novato',
  badges JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
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
    ST_SetSRID(ST_MakePoint(lon2, lat2), 4326
  ) / 1000; -- Convert to kilometers
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing
INSERT INTO profiles (id, email, full_name, location, latitude, longitude, home_address, home_latitude, home_longitude) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@currijobs.com', 'Demo User', 'San José, Costa Rica', 9.9281, -84.0907, 'La Nopalera, San José', 9.923035, -84.043457),
  ('mock-user-2', 'juan@example.com', 'Juan Pérez', 'Escazú, Costa Rica', 9.9181, -84.0807),
  ('mock-user-3', 'maria@example.com', 'María González', 'Heredia, Costa Rica', 9.9984, -84.1169);

INSERT INTO tasks (title, description, category, reward, time_estimate, location, latitude, longitude, user_id) VALUES
  ('House Cleaning in San José', 'Need help cleaning a 3-bedroom apartment in downtown San José. Looking for someone reliable and thorough.', 'cleaning', 25000, '3 hours', 'Downtown San José, Costa Rica', 9.9281, -84.0907, 'mock-user-2'),
  ('Pet Sitting for Golden Retriever', 'Looking for someone to walk and feed my friendly Golden Retriever. Need someone who loves dogs and is available for daily walks.', 'pet_care', 15000, '2 hours daily', 'Escazú, San José, Costa Rica', 9.9181, -84.0807, 'mock-user-3'),
  ('Plumbing Repair', 'Need help fixing a leaky faucet in the kitchen. Should be a quick job for someone with experience.', 'plumbing', 35000, '1 hour', 'Heredia, Costa Rica', 9.9984, -84.1169, 'mock-user-2'),
  ('Grocery Shopping', 'Need someone to do grocery shopping for elderly parents. List will be provided, delivery to Escazú area.', 'grocery_shopping', 20000, '2 hours', 'Escazú, San José, Costa Rica', 9.9181, -84.0807, 'mock-user-3'),
  ('Garden Maintenance', 'Need help with garden maintenance including pruning, weeding, and basic landscaping.', 'gardening', 30000, '4 hours', 'San José, Costa Rica', 9.9281, -84.0907, 'mock-user-2'),
  ('Tech Support', 'Need help setting up a new laptop and transferring data from old computer. Basic tech skills required.', 'tech_support', 40000, '3 hours', 'Heredia, Costa Rica', 9.9984, -84.1169, 'mock-user-3'),
  ('Moving Help', 'Need help moving furniture from apartment to new house. Heavy lifting required.', 'moving_help', 50000, '6 hours', 'San José, Costa Rica', 9.9281, -84.0907, 'mock-user-2'),
  ('Cooking for Party', 'Need someone to help prepare food for a birthday party. Cooking experience preferred.', 'cooking', 45000, '5 hours', 'Escazú, San José, Costa Rica', 9.9181, -84.0807, 'mock-user-3');

-- Seed badges
INSERT INTO badges (id, name, description, category) VALUES
  ('first-job','Primer Encargo','Completa tu primera tarea.','Milestone') ON CONFLICT (id) DO NOTHING;
INSERT INTO badges (id, name, description, category) VALUES
  ('hundred-wins','Cien Victorias','Completa 100 tareas.','Milestone') ON CONFLICT (id) DO NOTHING;
INSERT INTO badges (id, name, description, category) VALUES
  ('five-stars','5 Estrellas','Mantén 5.0 de calificación en 10+ trabajos.','Performance') ON CONFLICT (id) DO NOTHING;



