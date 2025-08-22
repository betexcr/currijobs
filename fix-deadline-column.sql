-- Quick fix for the missing deadline column error
-- Run this in your Supabase SQL Editor

-- Add the missing deadline column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Add other missing columns that might be needed
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS time_estimate TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Success message
SELECT 'Deadline column added successfully!' as status;

