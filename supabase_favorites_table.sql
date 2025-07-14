-- Create user_favorites table for favorites and watchlist functionality
CREATE TABLE user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  listing_id BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('favorite', 'watchlist')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, listing_id, type),
  
  -- Foreign key to listings table (assuming listings table exists)
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_listing_id ON user_favorites(listing_id);
CREATE INDEX idx_user_favorites_type ON user_favorites(type);
CREATE INDEX idx_user_favorites_user_type ON user_favorites(user_id, type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT USING (auth.jwt() ->> 'email' = user_id);

-- Users can only insert their own favorites
CREATE POLICY "Users can insert their own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_id);

-- Users can only update their own favorites
CREATE POLICY "Users can update their own favorites" ON user_favorites
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE USING (auth.jwt() ->> 'email' = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_favorites_updated_at
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for favorite counts per listing
CREATE VIEW listing_favorite_counts AS
SELECT 
  listing_id,
  COUNT(*) FILTER (WHERE type = 'favorite') as favorite_count,
  COUNT(*) FILTER (WHERE type = 'watchlist') as watchlist_count,
  COUNT(*) as total_count
FROM user_favorites
GROUP BY listing_id;

-- Grant permissions for the view
GRANT SELECT ON listing_favorite_counts TO authenticated;

-- Create function to get user's favorite/watchlist status for a listing
CREATE OR REPLACE FUNCTION get_user_listing_status(p_user_id TEXT, p_listing_id BIGINT)
RETURNS TABLE(
  is_favorited BOOLEAN,
  is_watchlisted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM user_favorites WHERE user_id = p_user_id AND listing_id = p_listing_id AND type = 'favorite') as is_favorited,
    EXISTS(SELECT 1 FROM user_favorites WHERE user_id = p_user_id AND listing_id = p_listing_id AND type = 'watchlist') as is_watchlisted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_listing_status(TEXT, BIGINT) TO authenticated;

-- Create function to toggle favorite/watchlist status
CREATE OR REPLACE FUNCTION toggle_user_favorite(p_user_id TEXT, p_listing_id BIGINT, p_type VARCHAR(20))
RETURNS BOOLEAN AS $$
DECLARE
  exists_already BOOLEAN;
BEGIN
  -- Check if the record already exists
  SELECT EXISTS(
    SELECT 1 FROM user_favorites 
    WHERE user_id = p_user_id AND listing_id = p_listing_id AND type = p_type
  ) INTO exists_already;
  
  IF exists_already THEN
    -- Remove the favorite/watchlist
    DELETE FROM user_favorites 
    WHERE user_id = p_user_id AND listing_id = p_listing_id AND type = p_type;
    RETURN FALSE;
  ELSE
    -- Add the favorite/watchlist
    INSERT INTO user_favorites (user_id, listing_id, type)
    VALUES (p_user_id, p_listing_id, p_type)
    ON CONFLICT (user_id, listing_id, type) DO NOTHING;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION toggle_user_favorite(TEXT, BIGINT, VARCHAR) TO authenticated;