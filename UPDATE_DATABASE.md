# Database Update Instructions

To fix the user display names across the app, you need to update the `listing_details` view in your Supabase database.

## Step 1: Run this SQL in your Supabase SQL Editor

```sql
-- Update the listing_details view to use proper display name logic
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
```

## What this fixes:

- **Profile greeting**: Now uses proper display_name from database instead of extracting from email
- **Listing displays**: All listings will show either the user's chosen display_name or their username (from email) instead of showing emails
- **Message displays**: Conversation lists and chat screens will show proper usernames
- **Search results**: Listings in search results will have proper user names

## After running the SQL:

1. The profile home screen will show the correct greeting with display_name
2. All listing cards will show proper usernames instead of emails
3. Message threads will show proper display names
4. User profiles will display consistent usernames

The app will automatically use this updated view for all user name displays.