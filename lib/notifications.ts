import { supabase } from './supabase';
import { sendNotificationToUser } from './pushNotifications';

export interface NotificationData {
  listing_title?: string;
  listing_price?: number;
  listing_image?: string;
  actor_name?: string;
  sender_name?: string;
  message_preview?: string;
  rating?: number;
  review?: string;
  star_emoji?: string;
}

export interface CreateNotificationParams {
  user_id: string;
  actor_id?: string;
  type: 'message' | 'review' | 'listing' | 'system';
  title: string;
  message: string;
  data?: NotificationData;
  listing_id?: string;
}

/**
 * Service class for handling notifications
 */
export class NotificationService {
  /**
   * Create a new notification
   */
  static async create(params: CreateNotificationParams): Promise<string | null> {
    try {
      // Import UserNotificationService to use its create method
      const { UserNotificationService } = await import('./userNotifications');
      
      return await UserNotificationService.create({
        userId: params.user_id,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data,
        actorId: params.actor_id,
        listingId: params.listing_id
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Get unread notification count for a user
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
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('mark_all_user_notifications_read', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error marking all as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
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
   * Get all notifications for a user
   */
  static async getNotifications(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
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
   * Helper functions for specific notification types
   */
  
  /**
   * Create notification with automatic push notification
   */
  static async createAndNotify(params: CreateNotificationParams): Promise<string | null> {
    return this.create(params);
  }
  
  /**
   * Send immediate push notification without storing in database
   */
  static async sendImmediatePush(userId: string, title: string, message: string, data?: any): Promise<void> {
    try {
      await sendNotificationToUser(userId, title, message, data);
    } catch (error) {
      console.error('Error sending immediate push notification:', error);
    }
  }
  
  static async notifyFavoriteAdded(params: {
    listingOwnerId: string;
    actorId: string;
    actorName: string;
    listingId: string;
    listingTitle: string;
    listingPrice: number;
    listingImage?: string;
  }) {
    return this.create({
      user_id: params.listingOwnerId,
      actor_id: params.actorId,
      type: 'listing',
      title: '❤️ Someone liked your listing!',
      message: `${params.actorName} added "${params.listingTitle}" to their favorites`,
      data: {
        listing_title: params.listingTitle,
        listing_price: params.listingPrice,
        listing_image: params.listingImage,
        actor_name: params.actorName
      },
      listing_id: params.listingId
    });
  }

  static async notifyWatchlistAdded(params: {
    listingOwnerId: string;
    actorId: string;
    actorName: string;
    listingId: string;
    listingTitle: string;
    listingPrice: number;
    listingImage?: string;
  }) {
    return this.create({
      user_id: params.listingOwnerId,
      actor_id: params.actorId,
      type: 'listing',
      title: '👀 Someone is watching your listing!',
      message: `${params.actorName} added "${params.listingTitle}" to their watchlist`,
      data: {
        listing_title: params.listingTitle,
        listing_price: params.listingPrice,
        listing_image: params.listingImage,
        actor_name: params.actorName
      },
      listing_id: params.listingId
    });
  }

  static async notifyNewMessage(params: {
    receiverId: string;
    senderId: string;
    senderName: string;
    messagePreview: string;
    listingId?: string;
    listingTitle?: string;
    listingPrice?: number;
    listingImage?: string;
  }) {
    const title = params.listingTitle 
      ? '💬 New message about your listing'
      : '💬 New message';
    
    const message = params.listingTitle
      ? `${params.senderName} sent you a message about "${params.listingTitle}"`
      : `${params.senderName} sent you a message`;

    return this.create({
      user_id: params.receiverId,
      actor_id: params.senderId,
      type: 'message',
      title,
      message,
      data: {
        sender_name: params.senderName,
        message_preview: params.messagePreview,
        listing_title: params.listingTitle,
        listing_price: params.listingPrice,
        listing_image: params.listingImage
      },
      listing_id: params.listingId
    });
  }

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
      user_id: params.ratedUserId,
      actor_id: params.raterId,
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

  /**
   * Delete a single notification
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
   * Delete all notifications for a user
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
}