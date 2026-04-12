-- Add last_active_date column to user_profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE user_profiles ADD COLUMN last_active_date DATE;

-- Optional: Set default last_active_date for existing users to their join_date
UPDATE user_profiles SET last_active_date = join_date::DATE WHERE last_active_date IS NULL;