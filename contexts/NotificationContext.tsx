import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { initializePushNotifications, pushNotificationService } from '~/lib/pushNotifications';
import { useAuth } from './AuthContext';
import { supabase } from '~/lib/supabase';
import { useRouter } from 'expo-router';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  initializeNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    if (user?.email) {
      initializeNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Set up notification listener
    const subscription = pushNotificationService.subscribeToNotifications((notification) => {
      setNotification(notification);
      console.log('Received notification:', notification);
    });

    // Set up notification response listener (when user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      // Handle notification tap - navigate to appropriate screen
      const data = response.notification.request.content.data;
      console.log('Notification data:', data);
      
      // Handle different notification types
      if (data?.notification_type === 'message' && data?.actor_id && user?.id) {
        // Navigate to chat with the person who sent the message
        console.log('Navigating to chat with:', data.actor_id);
        
        // Construct the chat ID (same format used in chat screens)
        const chatId = data.listing_id && data.listing_id !== 'general' 
          ? `${user.id}_${data.actor_id}_${data.listing_id}`
          : `${user.id}_${data.actor_id}`;
        
        // Navigate to the specific chat
        router.push({
          pathname: '/chat/[id]',
          params: { 
            id: chatId,
            otherUserId: data.actor_id,
            listingId: data.listing_id || 'general'
          }
        });
      } else if (data?.listing_id && data?.notification_type !== 'message') {
        // Navigate to listing for other notification types
        console.log('Navigate to listing:', data.listing_id);
        router.push({
          pathname: '/listing/[id]',
          params: { id: data.listing_id }
        });
      } else if (data?.notification_type === 'review') {
        // Navigate to reviews/profile page
        console.log('Navigate to reviews');
        router.push('/reviews');
      } else {
        // Default: navigate to notifications screen
        console.log('Navigate to notifications');
        router.push('/user-notifications');
      }
    });

    return () => {
      subscription();
      responseSubscription.remove();
    };
  }, []);

  const initializeNotifications = async () => {
    if (!user?.id) return;

    try {
      await initializePushNotifications(user.id);
      const token = await pushNotificationService.getPushToken();
      setExpoPushToken(token);
      console.log('Push notifications initialized with token:', token);
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!user?.email || !expoPushToken) return;

    try {
      await pushNotificationService.sendPushNotification(
        expoPushToken,
        '🎉 Test Notification',
        'This is a test notification from UT Marketplace!',
        { test: true }
      );
      console.log('Test notification sent');
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    initializeNotifications,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};