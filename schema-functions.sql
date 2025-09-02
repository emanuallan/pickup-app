-- Additional database functions for the UT Marketplace App
-- Run this after running schema-new.sql

-- Function to toggle user favorites (favorite/watchlist)
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

-- Function to get user favorite status for a listing
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

-- Function to get listing engagement stats
CREATE OR REPLACE FUNCTION get_listing_engagement_stats(p_listing_id UUID)
RETURNS TABLE(favorite_count BIGINT, watchlist_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE type = 'favorite') as favorite_count,
    COUNT(*) FILTER (WHERE type = 'watchlist') as watchlist_count
  FROM user_favorites 
  WHERE listing_id = p_listing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create or get conversation (with listing)
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID,
  p_listing_id UUID
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  participant1_id UUID;
  participant2_id UUID;
BEGIN
  -- Ensure consistent ordering of participants
  IF p_user1_id < p_user2_id THEN
    participant1_id := p_user1_id;
    participant2_id := p_user2_id;
  ELSE
    participant1_id := p_user2_id;
    participant2_id := p_user1_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM conversations
  WHERE participant_1_id = participant1_id 
    AND participant_2_id = participant2_id 
    AND (listing_id = p_listing_id OR (listing_id IS NULL AND p_listing_id IS NULL));

  -- If not found, create new conversation
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (participant_1_id, participant_2_id, listing_id)
    VALUES (participant1_id, participant2_id, p_listing_id)
    RETURNING id INTO conversation_id;
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create or get conversation (without listing - general chat)
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID AS $$
BEGIN
  RETURN get_or_create_conversation(p_user1_id, p_user2_id, NULL);
END;
$$ LANGUAGE plpgsql;

-- Function to ensure user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  username TEXT;
BEGIN
  -- Extract username from email (part before @)
  username := split_part(NEW.email, '@', 1);
  
  INSERT INTO public.users (id, email, display_name, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', username), NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', username),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION ensure_user_profile();

-- Function to get user by email (for compatibility)
CREATE OR REPLACE FUNCTION get_user_by_email(p_email TEXT)
RETURNS TABLE(id UUID, email TEXT, display_name TEXT, profile_image_url TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.display_name, u.profile_image_url
  FROM users u
  WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql;

-- View for listing with user details (for easier queries)
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

-- Notification functions
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_actor_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}',
  p_listing_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, title, message, data, listing_id)
  VALUES (p_user_id, p_actor_id, p_type, p_title, p_message, p_data, p_listing_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = p_user_id AND is_read = false;
END;
$$ LANGUAGE plpgsql;