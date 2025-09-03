import { supabase } from './supabase';
import { sendNotificationToUser } from './pushNotifications';

export interface UserNotification {
  id: string;
  user_id: string;
  type: 'message' | 'review' | 'listing' | 'system';
  title: string;
  message: string;
  data: any;
  actor_id?: string;
  actor_name?: string;
  listing_id?: string;
  message_id?: string;
  review_id?: string;
  is_read: boolean;
  push_sent: boolean;
  created_at: string;
  read_at?: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: 'message' | 'review' | 'listing' | 'system';
  title: string;
  message: string;
  data?: any;
  actorId?: string;
  listingId?: string;
}

/**
 * Clean notification service that stores notifications and sends push notifications
 */
export class UserNotificationService {
  /**
   * Create and send a notification
   */
  static async create(params: CreateNotificationParams): Promise<string | null> {
    try {
      console.log('📝 Creating user notification:', params.title);

      // 1. Store notification in database
      const { data: notification, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          data: params.data || {},
          actor_id: params.actorId,
          actor_name: params.data?.actor_name,
          listing_id: params.listingId,
          message_id: params.data?.message_id,
          review_id: params.data?.review_id,
          is_read: false,
          push_sent: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to store notification:', error);
        return null;
      }

      console.log('✅ Notification stored with ID:', notification.id);

      // 2. Send push notification
      try {
        await sendNotificationToUser(
          params.userId,
          params.title,
          params.message,
          {
            ...params.data,
            notification_id: notification.id,
            notification_type: params.type
          }
        );

        // 3. Mark as sent
        await supabase
          .from('user_notifications')
          .update({ push_sent: true })
          .eq('id', notification.id);

        console.log('📱 Push notification sent successfully');

      } catch (pushError) {
        console.error('❌ Push notification failed (but notification stored):', pushError);
        // Notification is still stored, just push failed
        await supabase
          .from('user_notifications')
          .update({ push_sent: false })
          .eq('id', notification.id);
      }

      return notification.id;

    } catch (error) {
      console.error('❌ Error in notification service:', error);
      return null;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getNotifications(userId: string, limit = 50): Promise<UserNotification[]> {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('mark_all_user_notifications_read', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Clear all notifications for a user
   */
  static async clearAllNotifications(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing all notifications:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time notification updates
   */
  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Helper methods for specific notification types
   */

  /**
   * Send message notification
   */
  static async notifyNewMessage(params: {
    receiverId: string;
    senderId: string;
    senderName: string;
    messageContent: string;
    messageId: string;
    listingId?: string;
    listingTitle?: string;
  }) {
    const title = params.listingTitle 
      ? '💬 New message about your listing'
      : '💬 New message';
    
    const message = params.listingTitle
      ? `${params.senderName} sent you a message about "${params.listingTitle}"`
      : `${params.senderName} sent you a message`;

    return this.create({
      userId: params.receiverId,
      type: 'message',
      title,
      message,
      data: {
        message_preview: params.messageContent.length > 100 
          ? params.messageContent.substring(0, 100) + '...' 
          : params.messageContent,
        listing_title: params.listingTitle,
        actor_name: params.senderName,
        message_id: params.messageId
      },
      actorId: params.senderId,
      listingId: params.listingId
    });
  }

  /**
   * Send review notification
   */
  static async notifyNewReview(params: {
    ratedUserId: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    comment?: string;
    reviewId: string;
    isUpdate?: boolean;
  }) {
    const starEmoji = '⭐'.repeat(Math.min(5, Math.max(1, params.rating)));
    
    const title = params.isUpdate 
      ? '⭐ Rating updated!'
      : '⭐ New rating received!';
    
    let message = params.isUpdate
      ? `${params.reviewerName} updated their rating to ${starEmoji} (${params.rating}/5)`
      : `${params.reviewerName} rated you ${starEmoji} (${params.rating}/5)`;

    if (params.comment) {
      message += ' and left a review';
    }

    return this.create({
      userId: params.ratedUserId,
      type: 'review',
      title,
      message,
      data: {
        rating: params.rating,
        star_emoji: starEmoji,
        review: params.comment,
        is_update: params.isUpdate || false,
        actor_name: params.reviewerName,
        review_id: params.reviewId
      },
      actorId: params.reviewerId
    });
  }

  /**
   * Send immediate push notification without storing in database
   */
  static async sendImmediatePush(userId: string, title: string, message: string, data?: any): Promise<void> {
    try {
      const { sendNotificationToUser } = await import('./pushNotifications');
      await sendNotificationToUser(userId, title, message, data);
    } catch (error) {
      console.error('Error sending immediate push notification:', error);
    }
  }

  /**
   * Notify when someone adds a listing to favorites (for compatibility with old interface)
   */
  static async notifyFavoriteAdded(params: {
    listingOwnerId: string;
    actorId: string;
    actorName: string;
    listingId: string | number;
    listingTitle: string;
    listingPrice: number;
    listingImage?: string;
  }) {
    return this.create({
      userId: params.listingOwnerId,
      actorId: params.actorId,
      type: 'listing',
      title: '❤️ Someone liked your listing!',
      message: `${params.actorName} added "${params.listingTitle}" to their favorites`,
      data: {
        listing_title: params.listingTitle,
        listing_price: params.listingPrice,
        listing_image: params.listingImage,
        actor_name: params.actorName
      },
      listingId: params.listingId.toString()
    });
  }

  /**
   * Notify when someone adds a listing to watchlist (for compatibility with old interface)
   */
  static async notifyWatchlistAdded(params: {
    listingOwnerId: string;
    actorId: string;
    actorName: string;
    listingId: string | number;
    listingTitle: string;
    listingPrice: number;
    listingImage?: string;
  }) {
    return this.create({
      userId: params.listingOwnerId,
      actorId: params.actorId,
      type: 'listing',
      title: '👀 Someone is watching your listing!',
      message: `${params.actorName} added "${params.listingTitle}" to their watchlist`,
      data: {
        listing_title: params.listingTitle,
        listing_price: params.listingPrice,
        listing_image: params.listingImage,
        actor_name: params.actorName
      },
      listingId: params.listingId.toString()
    });
  }

  /**
   * Notify when someone rates a user (for compatibility with old interface)
   */
  static async notifyNewRating(params: {
    ratedUserId: string;
    raterId: string;
    raterName: string;
    rating: number;
    review?: string;
  }) {
    const starEmoji = '⭐'.repeat(Math.min(5, Math.max(1, params.rating)));
    
    let message = `${params.raterName} rated you ${starEmoji} (${params.rating}/5)`;
    if (params.review) {
      message += ' and left a review';
    }

    return this.create({
      userId: params.ratedUserId,
      actorId: params.raterId,
      type: 'review',
      title: '⭐ New rating received!',
      message,
      data: {
        actor_name: params.raterName,
        rating: params.rating,
        review: params.review,
        star_emoji: starEmoji
      }
    });
  }
}