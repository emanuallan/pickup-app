-- Fix listing_category enum to match the app's expected values
-- Run this in your Supabase SQL Editor

-- Method 1: Add the missing 'tech' value to existing enum
ALTER TYPE listing_category ADD VALUE IF NOT EXISTS 'tech';
ALTER TYPE listing_category ADD VALUE IF NOT EXISTS 'textbooks';
ALTER TYPE listing_category ADD VALUE IF NOT EXISTS 'subleases';
ALTER TYPE listing_category ADD VALUE IF NOT EXISTS 'kitchen';

-- Method 2: If you want to completely recreate the enum (use this if Method 1 doesn't work)
-- WARNING: This will temporarily break existing data, use with caution

/*
-- Step 1: Drop and recreate the enum
DROP TYPE IF EXISTS listing_category CASCADE;
CREATE TYPE listing_category AS ENUM (
  'furniture',
  'subleases',
  'tech', 
  'vehicles',
  'textbooks',
  'clothing',
  'kitchen',
  'other'
);

-- Step 2: Recreate the listings table with the new enum
ALTER TABLE listings ALTER COLUMN category TYPE listing_category USING category::text::listing_category;
*/