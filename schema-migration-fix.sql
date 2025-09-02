-- Migration script to fix UUID issues in UT Marketplace App
-- Run this in your Supabase SQL editor to fix the current errors

-- First, let's check what tables exist and their current structure
-- This will help us understand what needs to be migrated

-- Step 1: Create the new schema if it doesn't exist
-- (This is the same as schema-new.sql but with some modifications for migration)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE listing_category AS ENUM (
      'electronics',
      'furniture', 
      'books',
      'clothing',
      'vehicles',
      'sports',
      'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_condition AS ENUM (
      'new',
      'like_new',
      'good',
      'fair',
      'poor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
      'message',
      'favorite',
      'watchlist',
      'listing_sold',
      'listing_inquiry',
      'rating',
      'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE favorite_type AS ENUM (
      'favorite',
      'watchlist'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  phone TEXT,
  notification_preferences JSONB DEFAULT '{
    "email_notifications": true,
    "push_notifications": true,
    "message_notifications": true,
    "favorite_notifications": true
  }'::jsonb,
  push_token TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add push_token column if it doesn't exist (for existing installations)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Step 3: Migrate data from auth.users to users table
-- Create user profiles for all existing auth users
INSERT INTO public.users (id, email, display_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'display_name', 
    split_part(au.email, '@', 1)  -- Extract username part before @ symbol
  ),
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = COALESCE(
    EXCLUDED.display_name, 
    split_part(EXCLUDED.email, '@', 1), 
    users.display_name
  ),
  updated_at = NOW();

-- Step 4: Update listings table to use proper UUIDs
-- First, let's see if we need to update existing listings
UPDATE public.listings 
SET user_id = u.id
FROM public.users u
WHERE listings.user_id::text = u.email
AND listings.user_id::text ~ '^[^@]+@[^@]+\.[^@]+$'; -- Only update if it looks like an email

-- Step 5: Update messages table to use proper UUIDs and fix column name
-- First, add the is_read column if it doesn't exist
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Update existing messages to use is_read instead of read (only if read column exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'read') THEN
    -- Update existing messages to use is_read instead of read
    UPDATE public.messages 
    SET is_read = COALESCE(read, false)
    WHERE read IS NOT NULL;
    
    -- Drop the old read column
    ALTER TABLE public.messages DROP COLUMN read;
    
    RAISE NOTICE 'Migrated read column to is_read and dropped old column';
  ELSE
    RAISE NOTICE 'read column does not exist, skipping migration';
  END IF;
END $$;

-- Update sender_id and receiver_id to use UUIDs
UPDATE public.messages 
SET sender_id = u.id
FROM public.users u
WHERE messages.sender_id::text = u.email
AND messages.sender_id::text ~ '^[^@]+@[^@]+\.[^@]+$';

UPDATE public.messages 
SET receiver_id = u.id
FROM public.users u
WHERE messages.receiver_id::text = u.email
AND messages.receiver_id::text ~ '^[^@]+@[^@]+\.[^@]+$';

-- Step 6: Update user_favorites table to use proper UUIDs
UPDATE public.user_favorites 
SET user_id = u.id
FROM public.users u
WHERE user_favorites.user_id::text = u.email
AND user_favorites.user_id::text ~ '^[^@]+@[^@]+\.[^@]+$';

-- Step 7: Update reviews table to use proper UUIDs
UPDATE public.reviews 
SET reviewer_id = u.id
FROM public.users u
WHERE reviews.reviewer_id::text = u.email
AND reviews.reviewer_id::text ~ '^[^@]+@[^@]+\.[^@]+$';

UPDATE public.reviews 
SET reviewed_id = u.id
FROM public.users u
WHERE reviews.reviewed_id::text = u.email
AND reviews.reviewed_id::text ~ '^[^@]+@[^@]+\.[^@]+$';

-- Step 8: Update notifications table to use proper UUIDs
UPDATE public.notifications 
SET user_id = u.id
FROM public.users u
WHERE notifications.user_id::text = u.email
AND notifications.user_id::text ~ '^[^@]+@[^@]+\.[^@]+$';

UPDATE public.notifications 
SET actor_id = u.id
FROM public.users u
WHERE notifications.actor_id::text = u.email
AND notifications.actor_id::text ~ '^[^@]+@[^@]+\.[^@]+$';

-- Step 9: Create the trigger to automatically create user profiles
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ensure_user_profile();

-- Step 10: Create the notification functions
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = p_user_id AND is_read = false
  );
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create a function to get user by email (for backward compatibility)
CREATE OR REPLACE FUNCTION get_user_by_email(p_email TEXT)
RETURNS TABLE(id UUID, email TEXT, display_name TEXT, profile_image_url TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.display_name, u.profile_image_url
  FROM users u
  WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create a view for easier querying
CREATE OR REPLACE VIEW listing_details AS
SELECT 
  l.*,
  u.display_name as user_name,
  u.profile_image_url as user_image,
  u.email as user_email,
  u.rating_average,
  u.rating_count
FROM listings l
JOIN users u ON l.user_id = u.id;

-- Step 13: Create user_settings table if it doesn't exist (for backward compatibility)
-- This table will be a view/synonym for the users table to maintain compatibility
CREATE TABLE IF NOT EXISTS public.user_settings (
  email TEXT PRIMARY KEY,
  display_name TEXT,
  profile_image_url TEXT,
  bio TEXT,
  phone TEXT,
  push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to sync data between users and user_settings tables
CREATE OR REPLACE FUNCTION sync_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user is inserted/updated in users table, sync to user_settings
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_settings (email, display_name, profile_image_url, bio, phone, push_token, created_at, updated_at)
    VALUES (NEW.email, NEW.display_name, NEW.profile_image_url, NEW.bio, NEW.phone, NEW.push_token, NEW.created_at, NEW.updated_at)
    ON CONFLICT (email) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      profile_image_url = EXCLUDED.profile_image_url,
      bio = EXCLUDED.bio,
      phone = EXCLUDED.phone,
      push_token = EXCLUDED.push_token,
      updated_at = EXCLUDED.updated_at;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep user_settings in sync with users table
DROP TRIGGER IF EXISTS sync_user_settings_trigger ON public.users;
CREATE TRIGGER sync_user_settings_trigger
  AFTER INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_settings();

-- Populate user_settings table with existing user data
INSERT INTO public.user_settings (email, display_name, profile_image_url, bio, phone, push_token, created_at, updated_at)
SELECT email, display_name, profile_image_url, bio, phone, push_token, created_at, updated_at
FROM public.users
ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  profile_image_url = EXCLUDED.profile_image_url,
  bio = EXCLUDED.bio,
  phone = EXCLUDED.phone,
  push_token = EXCLUDED.push_token,
  updated_at = EXCLUDED.updated_at;

-- Final step: Verify the migration
SELECT 'Migration completed successfully!' as status;
