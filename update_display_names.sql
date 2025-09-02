-- Update display names to use email username (before @ symbol) for users without display names
-- Run this in your Supabase SQL Editor

-- Update existing users where display_name is null or empty or equals the full email
UPDATE public.users 
SET display_name = split_part(email, '@', 1)
WHERE display_name IS NULL 
   OR display_name = '' 
   OR display_name = email;

-- Update the trigger function to automatically set display_name to email username for new users
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'display_name', 
      split_part(NEW.email, '@', 1)  -- Use email username as default
    ), 
    NOW(), 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    display_name = COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1),
      users.display_name
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the changes
SELECT email, display_name FROM public.users LIMIT 10;
