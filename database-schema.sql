-- Currijobs Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    reward DECIMAL(10,2) NOT NULL,
    time_estimate TEXT,
    location TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view all tasks
CREATE POLICY "Allow users to view all tasks" ON public.tasks
    FOR SELECT USING (true);

-- Allow users to create their own tasks
CREATE POLICY "Allow users to create their own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own tasks
CREATE POLICY "Allow users to update their own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own tasks
CREATE POLICY "Allow users to delete their own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create offers table (for Phase III)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for offers table
CREATE INDEX IF NOT EXISTS idx_offers_task_id ON public.offers(task_id);
CREATE INDEX IF NOT EXISTS idx_offers_user_id ON public.offers(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

-- Enable RLS for offers table
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for offers
-- Allow users to view offers for tasks they own or made
CREATE POLICY "Allow users to view offers" ON public.offers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.tasks WHERE id = task_id
            UNION
            SELECT user_id FROM public.offers WHERE id = offers.id
        )
    );

-- Allow users to create offers
CREATE POLICY "Allow users to create offers" ON public.offers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow task owners to update offer status
CREATE POLICY "Allow task owners to update offer status" ON public.offers
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.tasks WHERE id = task_id
        )
    );

-- Create trigger for offers updated_at
CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO public.tasks (title, description, category, reward, time_estimate, location, user_id) VALUES
('Clean my apartment', 'Need help cleaning a 2-bedroom apartment. Includes vacuuming, dusting, and bathroom cleaning.', 'Cleaning', 25000, '3 hours', 'San José, Costa Rica', (SELECT id FROM auth.users LIMIT 1)),
('Walk my dog', 'Looking for someone to walk my golden retriever for 30 minutes in the morning.', 'Pet Care', 8000, '30 minutes', 'Escazú, Costa Rica', (SELECT id FROM auth.users LIMIT 1)),
('Help with moving', 'Need help moving furniture from 2nd floor apartment to moving truck.', 'Moving', 35000, '2 hours', 'Heredia, Costa Rica', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING; 