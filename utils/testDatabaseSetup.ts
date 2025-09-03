import { supabase } from '~/lib/supabase';

/**
 * Test if the notification database setup is working
 */
export async function testNotificationDatabaseSetup() {
  try {
    console.log('🧪 Testing notification database setup...');

    // Test 1: Check if user_notifications table exists
    const { data: tables, error: tablesError } = await supabase
      .from('user_notifications')
      .select('count', { count: 'exact', head: true });

    if (tablesError) {
      console.error('❌ Notifications table not found:', tablesError);
      return false;
    }
    
    console.log('✅ Notifications table exists');

    // Test 2: Check if create_notification function exists
    const { data: functionTest, error: functionError } = await supabase.rpc('create_notification', {
      p_user_id: 'test-user-id',
      p_type: 'message',
      p_title: 'Test Notification',
      p_message: 'This is a test notification',
      p_actor_id: null,
      p_data: { test: true },
      p_listing_id: null
    });

    if (functionError && !functionError.message.includes('foreign key')) {
      console.error('❌ create_notification function error:', functionError);
      return false;
    }

    console.log('✅ create_notification function exists');

    // Test 3: Check if get_unread_notification_count function exists  
    const { data: countTest, error: countError } = await supabase.rpc('get_unread_notification_count', {
      p_user_id: 'test-user-id'
    });

    if (countError) {
      console.error('❌ get_unread_notification_count function error:', countError);
      return false;
    }

    console.log('✅ get_unread_notification_count function exists');

    console.log('🎉 Database setup is working correctly!');
    return true;

  } catch (error) {
    console.error('❌ Database setup test failed:', error);
    return false;
  }
}

/**
 * Create a test notification for the current user
 */
export async function createTestNotification(userId: string) {
  try {
    console.log('Creating test notification for user:', userId);
    
    const { data, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: 'message',
      p_title: '🧪 Test Notification',
      p_message: 'This is a test notification to verify the system is working',
      p_actor_id: null,
      p_data: { 
        test: true,
        created_by: 'test_function',
        message_preview: 'Test notification system' 
      },
      p_listing_id: null
    });

    if (error) {
      console.error('Error creating test notification:', error);
      return false;
    }

    console.log('✅ Test notification created:', data);
    return true;

  } catch (error) {
    console.error('Failed to create test notification:', error);
    return false;
  }
}

/**
 * Check current notification count for user
 */
export async function checkNotificationCount(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_unread_notification_count', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }

    console.log(`📊 Unread notifications for user ${userId}:`, data);
    return data || 0;
    
  } catch (error) {
    console.error('Failed to check notification count:', error);
    return 0;
  }
}