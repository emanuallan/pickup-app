import { supabase } from '../lib/supabase';
import { UserNotificationService } from '../lib/userNotifications';

interface TestUser {
  id: string;
  email: string;
  display_name?: string;
}

interface TestListing {
  id: number;
  title: string;
  price: number;
  images: string[];
}

export async function testMessagingNotifications() {
  console.log('🧪 Testing messaging notification functionality...');

  try {
    // 1. Create two test users
    console.log('📝 Creating test users...');
    
    const testUser1Email = `test.sender.${Date.now()}@example.com`;
    const testUser2Email = `test.receiver.${Date.now()}@example.com`;
    
    const { data: user1, error: user1Error } = await supabase.auth.signUp({
      email: testUser1Email,
      password: 'TestPassword123!',
    });
    
    if (user1Error) {
      throw new Error(`Failed to create user1: ${user1Error.message}`);
    }

    const { data: user2, error: user2Error } = await supabase.auth.signUp({
      email: testUser2Email,
      password: 'TestPassword123!',
    });
    
    if (user2Error) {
      throw new Error(`Failed to create user2: ${user2Error.message}`);
    }

    if (!user1.user?.id || !user2.user?.id) {
      throw new Error('Failed to get user IDs');
    }

    // 2. Set display names for the users
    await supabase
      .from('users')
      .update({ display_name: 'Test Sender' })
      .eq('id', user1.user.id);

    await supabase
      .from('users')
      .update({ display_name: 'Test Receiver' })
      .eq('id', user2.user.id);

    // 3. Create a test listing
    console.log('📋 Creating test listing...');
    
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        title: 'Test Laptop for Sale',
        description: 'Great condition laptop',
        price: 500,
        category: 'electronics',
        condition: 'good',
        images: ['https://example.com/laptop.jpg'],
        user_id: user1.user.id,
        location: 'Austin, TX'
      })
      .select()
      .single();

    if (listingError || !listing) {
      throw new Error(`Failed to create listing: ${listingError?.message}`);
    }

    // 4. Create a test message
    console.log('💬 Creating test message...');
    
    const messageContent = 'Hi! Is this laptop still available?';
    
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: user1.user.id,
        receiver_id: user2.user.id,
        content: messageContent,
        listing_id: listing.id,
        is_read: false
      })
      .select()
      .single();

    if (messageError || !message) {
      throw new Error(`Failed to create message: ${messageError?.message}`);
    }

    // 5. Test notification creation
    console.log('🔔 Testing notification creation...');
    
    const notificationId = await UserNotificationService.notifyNewMessage({
      receiverId: user2.user.id,
      senderId: user1.user.id,
      senderName: 'Test Sender',
      messagePreview: messageContent,
      listingId: listing.id.toString(), // Convert to string since listing.id is a UUID string
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingImage: listing.images[0]
    });

    if (!notificationId) {
      throw new Error('Failed to create notification');
    }

    console.log(`✅ Notification created with ID: ${notificationId}`);

    // 6. Verify notification was created
    console.log('🔍 Verifying notification in database...');
    
    const { data: notifications, error: notificationFetchError } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (notificationFetchError || !notifications) {
      throw new Error(`Failed to fetch notification: ${notificationFetchError?.message}`);
    }

    console.log('📋 Notification details:');
    console.log(`  - Type: ${notifications.type}`);
    console.log(`  - Title: ${notifications.title}`);
    console.log(`  - Message: ${notifications.message}`);
    console.log(`  - Data:`, notifications.data);
    console.log(`  - User ID: ${notifications.user_id}`);
    console.log(`  - Actor ID: ${notifications.actor_id}`);
    console.log(`  - Listing ID: ${notifications.listing_id}`);

    // 7. Test unread count
    console.log('📊 Testing unread count...');
    
    const unreadCount = await UserNotificationService.getUnreadCount(user2.user.id);
    console.log(`📈 Unread count for receiver: ${unreadCount}`);

    if (unreadCount < 1) {
      throw new Error('Unread count should be at least 1');
    }

    // 8. Test general message (no listing)
    console.log('💬 Testing general message notification...');
    
    const { data: generalMessage, error: generalMessageError } = await supabase
      .from('messages')
      .insert({
        sender_id: user1.user.id,
        receiver_id: user2.user.id,
        content: 'Hi there! How are you doing?',
        listing_id: null,
        is_read: false
      })
      .select()
      .single();

    if (generalMessageError || !generalMessage) {
      throw new Error(`Failed to create general message: ${generalMessageError?.message}`);
    }

    const generalNotificationId = await UserNotificationService.notifyNewMessage({
      receiverId: user2.user.id,
      senderId: user1.user.id,
      senderName: 'Test Sender',
      messagePreview: 'Hi there! How are you doing?'
    });

    if (!generalNotificationId) {
      throw new Error('Failed to create general notification');
    }

    console.log(`✅ General notification created with ID: ${generalNotificationId}`);

    // 9. Cleanup - Delete test data
    console.log('🧹 Cleaning up test data...');
    
    // Delete notifications
    await supabase.from('user_notifications').delete().eq('id', notificationId);
    await supabase.from('user_notifications').delete().eq('id', generalNotificationId);
    
    // Delete messages
    await supabase.from('messages').delete().eq('id', message.id);
    await supabase.from('messages').delete().eq('id', generalMessage.id);
    
    // Delete listing
    await supabase.from('listings').delete().eq('id', listing.id);
    
    // Delete users
    await supabase.from('users').delete().eq('id', user1.user.id);
    await supabase.from('users').delete().eq('id', user2.user.id);

    console.log('✅ All tests passed! Messaging notifications are working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Function to test in development
export async function runMessagingNotificationTest() {
  try {
    await testMessagingNotifications();
    console.log('🎉 Messaging notification test completed successfully!');
  } catch (error) {
    console.error('💥 Messaging notification test failed:', error);
  }
}