import { sendNotificationToUser } from '../lib/pushNotifications';

/**
 * Test function to verify push notification functionality
 */
export async function testMessagePushNotification(
  receiverId: string,
  senderName: string = 'Test User',
  messageContent: string = 'This is a test message!',
  listingTitle?: string
) {
  console.log('🧪 Testing message push notification...');
  console.log(`📤 Sending to user: ${receiverId}`);
  console.log(`👤 From: ${senderName}`);
  console.log(`💬 Message: ${messageContent}`);
  if (listingTitle) {
    console.log(`📋 About listing: ${listingTitle}`);
  }

  try {
    const notificationTitle = listingTitle 
      ? '💬 New message about your listing'
      : '💬 New message';
    
    const notificationMessage = listingTitle
      ? `${senderName} sent you a message about "${listingTitle}"`
      : `${senderName} sent you a message`;

    await sendNotificationToUser(
      receiverId,
      notificationTitle,
      notificationMessage,
      {
        sender_name: senderName,
        message_preview: messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent,
        listing_title: listingTitle,
        notification_type: 'message'
      }
    );

    console.log('✅ Push notification sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    return false;
  }
}

/**
 * Test general message push notification
 */
export async function testGeneralMessagePush(receiverId: string, senderName: string = 'Test User') {
  return await testMessagePushNotification(
    receiverId,
    senderName,
    'Hey! How are you doing?'
  );
}

/**
 * Test listing-related message push notification
 */
export async function testListingMessagePush(
  receiverId: string,
  senderName: string = 'Test User',
  listingTitle: string = 'Test Laptop'
) {
  return await testMessagePushNotification(
    receiverId,
    senderName,
    'Hi! Is this item still available?',
    listingTitle
  );
}

/**
 * Test review push notification
 */
export async function testReviewPushNotification(
  ratedUserId: string,
  reviewerName: string = 'Test Reviewer',
  rating: number = 5,
  comment: string = 'Great experience!',
  isUpdate: boolean = false
) {
  console.log('🧪 Testing review push notification...');
  console.log(`📤 Sending to user: ${ratedUserId}`);
  console.log(`👤 From: ${reviewerName}`);
  console.log(`⭐ Rating: ${rating}/5`);
  console.log(`💬 Comment: ${comment}`);
  console.log(`🔄 Is update: ${isUpdate}`);

  try {
    const starEmoji = '⭐'.repeat(Math.min(5, Math.max(1, rating)));
    
    const notificationTitle = isUpdate 
      ? '⭐ Rating updated!'
      : '⭐ New rating received!';
    
    let notificationMessage = isUpdate
      ? `${reviewerName} updated their rating to ${starEmoji} (${rating}/5)`
      : `${reviewerName} rated you ${starEmoji} (${rating}/5)`;

    if (comment.trim()) {
      notificationMessage += ' and left a review';
    }

    await sendNotificationToUser(
      ratedUserId,
      notificationTitle,
      notificationMessage,
      {
        reviewer_name: reviewerName,
        rating: rating,
        review: comment.trim() || null,
        star_emoji: starEmoji,
        notification_type: 'rating',
        is_update: isUpdate
      }
    );

    console.log('✅ Review push notification sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to send review push notification:', error);
    return false;
  }
}

/**
 * Test new review push notification
 */
export async function testNewReviewPush(ratedUserId: string, reviewerName: string = 'Test Reviewer') {
  return await testReviewPushNotification(
    ratedUserId,
    reviewerName,
    5,
    'Amazing transaction! Very reliable and communicative.',
    false
  );
}

/**
 * Test updated review push notification
 */
export async function testUpdatedReviewPush(ratedUserId: string, reviewerName: string = 'Test Reviewer') {
  return await testReviewPushNotification(
    ratedUserId,
    reviewerName,
    4,
    'Updated my review - still a good experience overall.',
    true
  );
}

/**
 * Get current user ID for testing
 */
export async function getCurrentUserId() {
  const { supabase } = await import('../lib/supabase');
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user.id;
}