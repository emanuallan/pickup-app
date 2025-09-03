/**
 * Test utility functions for the notification system
 * Use these functions in development to test notification functionality
 */

import { UserNotificationService } from '~/lib/userNotifications';

export class NotificationTestUtils {
  /**
   * Create test notifications for a user
   */
  static async createTestNotifications(userId: string): Promise<void> {
    console.log('Creating test notifications for user:', userId);
    
    try {
      // Test favorite notification
      await UserNotificationService.notifyFavoriteAdded({
        listingOwnerId: userId,
        actorId: 'test-actor-id',
        actorName: 'Test User',
        listingId: 1,
        listingTitle: 'Test MacBook Pro',
        listingPrice: 1200,
        listingImage: 'https://example.com/macbook.jpg'
      });

      // Test watchlist notification
      await UserNotificationService.notifyWatchlistAdded({
        listingOwnerId: userId,
        actorId: 'test-actor-id',
        actorName: 'Test User',
        listingId: 2,
        listingTitle: 'Test iPhone',
        listingPrice: 800,
        listingImage: 'https://example.com/iphone.jpg'
      });

      // Test message notification
      await UserNotificationService.notifyNewMessage({
        receiverId: userId,
        senderId: 'test-sender-id',
        senderName: 'Test Sender',
        messagePreview: 'Hey, is this item still available?',
        listingId: 1,
        listingTitle: 'Test MacBook Pro',
        listingPrice: 1200
      });

      // Test rating notification
      await UserNotificationService.notifyNewRating({
        ratedUserId: userId,
        raterId: 'test-rater-id',
        raterName: 'Test Rater',
        rating: 5,
        review: 'Great seller! Item was exactly as described.'
      });

      console.log('Test notifications created successfully');
    } catch (error) {
      console.error('Error creating test notifications:', error);
    }
  }

  /**
   * Test push notification functionality
   */
  static async testPushNotification(userId: string): Promise<void> {
    try {
      await UserNotificationService.sendImmediatePush(
        userId,
        '🧪 Test Push Notification',
        'This is a test push notification from UT Marketplace!',
        { test: true }
      );
      console.log('Test push notification sent');
    } catch (error) {
      console.error('Error sending test push notification:', error);
    }
  }

  /**
   * Clear all notifications for a user (useful for testing)
   */
  static async clearAllNotifications(userId: string): Promise<void> {
    try {
      await UserNotificationService.clearAllNotifications(userId);
      console.log('All notifications cleared for user:', userId);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Get notification count for a user
   */
  static async getNotificationCount(userId: string): Promise<number> {
    try {
      const count = await UserNotificationService.getUnreadCount(userId);
      console.log('Unread notification count:', count);
      return count;
    } catch (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }
  }
}

// Export individual functions for convenience
export const {
  createTestNotifications,
  testPushNotification,
  clearAllNotifications,
  getNotificationCount
} = NotificationTestUtils;