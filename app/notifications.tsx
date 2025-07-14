import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from '~/theme/colors';
import { MessageCircle, User, Clock, ChevronRight, Bell, BellOff, Heart, Eye, Mail, ChevronLeft } from 'lucide-react-native';
import ModalHeader from '~/components/ModalHeader';
import { getTimeAgo } from '~/utils/timeago';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'favorite' | 'watchlist' | 'message' | 'listing_sold' | 'listing_inquiry';
  title: string;
  message: string;
  data: {
    listing_title?: string;
    listing_price?: number;
    listing_image?: string;
    actor_name?: string;
    sender_name?: string;
    message_preview?: string;
  };
  is_read: boolean;
  created_at: string;
  listing_id?: number;
  actor_id?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.email)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read in database
    if (!notification.is_read) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.type === 'message') {
      router.push({
        pathname: '/chat/[id]',
        params: { id: notification.listing_id?.toString() || '' }
      });
    } else if (notification.listing_id) {
      router.push({
        pathname: '/listing/[id]',
        params: { id: notification.listing_id.toString() }
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user?.email) return;
    
    try {
      await supabase.rpc('mark_all_notifications_read', {
        p_user_id: user.email
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'favorite':
        return <Heart size={16} color="#ef4444" fill="#ef4444" />;
      case 'watchlist':
        return <Eye size={16} color="#3b82f6" />;
      case 'message':
        return <MessageCircle size={16} color={COLORS.utOrange} />;
      default:
        return <Bell size={16} color="#6b7280" />;
    }
  };

  const renderNotificationItem = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      onPress={() => handleNotificationPress(notification)}
      className={`mb-3 ${notification.is_read ? 'opacity-70' : ''}`}
    >
      <View className={`bg-white rounded-xl p-4 shadow-sm border ${!notification.is_read ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
        <View className="flex-row items-start">
          {/* Notification Icon */}
          <View className="mr-3">
            <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
              {getNotificationIcon(notification.type)}
            </View>
            {!notification.is_read && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
            )}
          </View>

          {/* Content */}
          <View className="flex-1 mr-3">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-semibold text-gray-900" numberOfLines={1}>
                {notification.title}
              </Text>
              <View className="flex-row items-center">
                <Clock size={12} color="#6b7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {getTimeAgo(notification.created_at)}
                </Text>
              </View>
            </View>

            {/* Message */}
            <Text className="text-gray-700 mb-3" numberOfLines={2}>
              {notification.message}
            </Text>

            {/* Listing Preview */}
            {notification.data.listing_title && (
              <View className="flex-row items-center p-2 bg-gray-50 rounded-lg">
                {notification.data.listing_image && (
                  <Image
                    source={{ uri: notification.data.listing_image }}
                    className="w-10 h-10 rounded-lg mr-3"
                  />
                )}
                <View className="flex-1">
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {notification.data.listing_title}
                  </Text>
                  {notification.data.listing_price && (
                    <Text className="text-xs font-semibold" style={{ color: COLORS.utOrange }}>
                      ${notification.data.listing_price}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Arrow */}
          <ChevronRight size={20} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
        
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-200 bg-white">
          <View className="flex-1 flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={COLORS.utOrange} />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-right">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </Text>
            </View>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="flex-row items-center bg-blue-100 rounded-full px-3 py-2"
            >
              <BellOff size={16} color="#1e40af" />
              <Text className="text-blue-800 font-medium text-sm ml-1">
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-20 px-4">
            <ActivityIndicator size="large" color={COLORS.utOrange} />
            <Text className="text-gray-500 mt-4">Loading notifications...</Text>
          </View>
        ) : notifications.length > 0 ? (
          <View className="pb-6 px-4">
            {notifications.map(renderNotificationItem)}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20 px-4">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Bell size={40} color="#9ca3af" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</Text>
            <Text className="text-gray-600 text-center px-8">
              When someone favorites your listings, adds them to their watchlist, or messages you, you&apos;ll see notifications here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}