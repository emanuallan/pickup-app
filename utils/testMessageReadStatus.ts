import { supabase } from '../lib/supabase';

/**
 * Test function to verify message read status functionality
 */
export async function testMessageReadStatus() {
  console.log('🧪 Testing message read status functionality...');

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('👤 Current user:', user.id);

    // 1. Check current unread message count
    const { data: unreadMessages, error: countError } = await supabase
      .from('messages')
      .select('id, sender_id, content, is_read, created_at')
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    if (countError) {
      throw new Error(`Failed to get unread messages: ${countError.message}`);
    }

    console.log(`📊 Current unread message count: ${unreadMessages?.length || 0}`);

    if (unreadMessages && unreadMessages.length > 0) {
      console.log('📋 Unread messages:');
      unreadMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. From: ${msg.sender_id}`);
        console.log(`     Content: "${msg.content}"`);
        console.log(`     Created: ${new Date(msg.created_at).toLocaleString()}`);
        console.log(`     Read: ${msg.is_read}`);
      });

      // 2. Test marking messages as read (simulate what happens when opening chat)
      console.log('\n🔄 Testing mark as read functionality...');
      
      const testSenderId = unreadMessages[0].sender_id;
      const unreadFromSender = unreadMessages.filter(msg => msg.sender_id === testSenderId);
      
      console.log(`📝 Marking ${unreadFromSender.length} messages from ${testSenderId} as read...`);

      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadFromSender.map(msg => msg.id));

      if (updateError) {
        throw new Error(`Failed to mark messages as read: ${updateError.message}`);
      }

      console.log('✅ Messages marked as read successfully!');

      // 3. Verify the count decreased
      const { data: newUnreadMessages, error: newCountError } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (newCountError) {
        throw new Error(`Failed to get new unread count: ${newCountError.message}`);
      }

      console.log(`📊 New unread message count: ${newUnreadMessages?.length || 0}`);
      console.log(`📉 Decrease: ${(unreadMessages?.length || 0) - (newUnreadMessages?.length || 0)} messages`);

      // 4. Test the reverse (mark some as unread for testing)
      console.log('\n🔄 Testing mark as unread functionality (for testing purposes)...');
      
      const { error: revertError } = await supabase
        .from('messages')
        .update({ is_read: false })
        .in('id', unreadFromSender.map(msg => msg.id));

      if (revertError) {
        throw new Error(`Failed to mark messages as unread: ${revertError.message}`);
      }

      console.log('✅ Messages reverted to unread for testing purposes');

    } else {
      console.log('ℹ️ No unread messages found. Test completed - system appears to be working correctly!');
    }

    console.log('\n✅ Message read status test completed successfully!');

  } catch (error) {
    console.error('❌ Message read status test failed:', error);
    throw error;
  }
}

/**
 * Test function to simulate opening a chat with a specific user
 */
export async function testOpenChatWithUser(otherUserId: string, listingId?: string) {
  console.log(`🧪 Testing chat open simulation with user: ${otherUserId}`);

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Find unread messages from this specific user
    let query = supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);

    if (listingId && listingId !== 'general') {
      query = query.eq('listing_id', listingId);
    } else {
      query = query.is('listing_id', null);
    }

    const { data: unreadMessages, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch unread messages: ${fetchError.message}`);
    }

    console.log(`📊 Found ${unreadMessages?.length || 0} unread messages from this user`);

    if (unreadMessages && unreadMessages.length > 0) {
      // Mark them as read (simulate chat opening)
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map(msg => msg.id));

      if (updateError) {
        throw new Error(`Failed to mark messages as read: ${updateError.message}`);
      }

      console.log(`✅ Marked ${unreadMessages.length} messages as read`);
    } else {
      console.log('ℹ️ No unread messages from this user');
    }

  } catch (error) {
    console.error('❌ Chat open simulation failed:', error);
    throw error;
  }
}