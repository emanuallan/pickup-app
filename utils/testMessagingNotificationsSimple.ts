import { UserNotificationService } from '../lib/userNotifications';

/**
 * Simple test function that can be called from the app to test messaging notifications
 * This simulates what happens when a real message is sent
 */
export async function testMessageNotification(
  senderId: string,
  receiverId: string,
  senderName: string,
  messageContent: string,
  listingId?: string,
  listingTitle?: string,
  listingPrice?: number,
  listingImage?: string
) {
  console.log('🧪 Testing message notification creation...');
  
  try {
    const notificationId = await UserNotificationService.notifyNewMessage({
      receiverId,
      senderId,
      senderName,
      messagePreview: messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent,
      listingId,
      listingTitle,
      listingPrice,
      listingImage
    });

    if (notificationId) {
      console.log('✅ Message notification created successfully!');
      console.log('📋 Details:');
      console.log(`  - Notification ID: ${notificationId}`);
      console.log(`  - Receiver: ${receiverId}`);
      console.log(`  - Sender: ${senderName}`);
      console.log(`  - Message: ${messageContent}`);
      if (listingTitle) {
        console.log(`  - Listing: ${listingTitle} ($${listingPrice})`);
      }
      return notificationId;
    } else {
      console.error('❌ Failed to create message notification');
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing message notification:', error);
    return null;
  }
}

/**
 * Test function specifically for general messages (no listing)
 */
export async function testGeneralMessageNotification(
  senderId: string,
  receiverId: string,
  senderName: string,
  messageContent: string
) {
  console.log('🧪 Testing general message notification...');
  
  return await testMessageNotification(
    senderId,
    receiverId,
    senderName,
    messageContent
  );
}

/**
 * Test function specifically for listing-related messages
 */
export async function testListingMessageNotification(
  senderId: string,
  receiverId: string,
  senderName: string,
  messageContent: string,
  listingId: string,
  listingTitle: string,
  listingPrice: number,
  listingImage?: string
) {
  console.log('🧪 Testing listing message notification...');
  
  return await testMessageNotification(
    senderId,
    receiverId,
    senderName,
    messageContent,
    listingId,
    listingTitle,
    listingPrice,
    listingImage
  );
}