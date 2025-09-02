-- Fix missing database functions and schema issues
-- Run this in your Supabase SQL Editor

-- 1. Create the get_user_favorite_status function if it doesn't exist
CREATE OR REPLACE FUNCTION get_user_favorite_status(
  p_user_id UUID,
  p_listing_id UUID
)
RETURNS TABLE(is_favorited BOOLEAN, is_watchlisted BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM user_favorites WHERE user_id = p_user_id AND listing_id = p_listing_id AND type = 'favorite') as is_favorited,
    EXISTS(SELECT 1 FROM user_favorites WHERE user_id = p_user_id AND listing_id = p_listing_id AND type = 'watchlist') as is_watchlisted;
END;
$$ LANGUAGE plpgsql;

-- 2. Create listing_details view for easier queries (includes user_name)
CREATE OR REPLACE VIEW listing_details AS
SELECT 
  l.*,
  CASE 
    WHEN u.display_name IS NOT NULL AND TRIM(u.display_name) != '' THEN u.display_name
    ELSE SPLIT_PART(u.email, '@', 1)
  END as user_name,
  u.profile_image_url as user_image,
  u.email as user_email,
  u.rating_average,
  u.rating_count
FROM listings l
JOIN users u ON l.user_id = u.id;

-- 3. Add any missing columns to user_settings table if needed
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 4. Create toggle_user_favorite function if it doesn't exist
CREATE OR REPLACE FUNCTION toggle_user_favorite(
  p_user_id UUID,
  p_listing_id UUID,
  p_type favorite_type
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_record user_favorites%ROWTYPE;
  result BOOLEAN;
BEGIN
  -- Check if the record already exists
  SELECT * INTO existing_record
  FROM user_favorites
  WHERE user_id = p_user_id 
    AND listing_id = p_listing_id 
    AND type = p_type;

  IF FOUND THEN
    -- Record exists, remove it
    DELETE FROM user_favorites
    WHERE user_id = p_user_id 
      AND listing_id = p_listing_id 
      AND type = p_type;
    result := FALSE;
  ELSE
    -- Record doesn't exist, add it
    INSERT INTO user_favorites (user_id, listing_id, type)
    VALUES (p_user_id, p_listing_id, p_type);
    result := TRUE;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

SELECT 'Database functions fixed successfully!' as status;
