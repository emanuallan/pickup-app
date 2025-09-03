import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserNotificationService } from '~/lib/userNotifications';
import { useAuth } from './AuthContext';

interface UserNotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => Promise<void>;
}

const UserNotificationContext = createContext<UserNotificationContextType | undefined>(undefined);

export const useUserNotifications = () => {
  const context = useContext(UserNotificationContext);
  if (!context) {
    throw new Error('useUserNotifications must be used within a UserNotificationProvider');
  }
  return context;
};

interface UserNotificationProviderProps {
  children: React.ReactNode;
}

export const UserNotificationProvider: React.FC<UserNotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Refresh unread count from database
  const refreshUnreadCount = useCallback(async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await UserNotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error refreshing notification count:', error);
    }
  }, [user?.id]);

  // Mark single notification as read (optimistic update)
  const markAsRead = useCallback((notificationId: string) => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await UserNotificationService.markAllAsRead(user.id);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Refresh to get actual count if update failed
      await refreshUnreadCount();
    }
  }, [user?.id, refreshUnreadCount]);

  // Initial load and user change
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const subscription = UserNotificationService.subscribeToNotifications(
      user.id,
      (payload) => {
        console.log('New notification received:', payload);
        
        if (payload.eventType === 'INSERT' && payload.new) {
          // New notification came in
          if (!payload.new.is_read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const value: UserNotificationContextType = {
    unreadCount,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <UserNotificationContext.Provider value={value}>
      {children}
    </UserNotificationContext.Provider>
  );
};