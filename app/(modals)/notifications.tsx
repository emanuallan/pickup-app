import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '~/theme/colors';
import { MessageCircle, User, Clock, ChevronRight, Bell, BellOff } from 'lucide-react-native';
import ModalHeader from '~/components/ModalHeader';
import { getTimeAgo } from '~/utils/timeago';

interface NotificationMessage {
  id: string;
  type: 'message';
  senderName: string;
  senderImage?: string;
  listingTitle: string;
  listingImage?: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  listingId: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for notifications - replace with actual API calls later
  const mockNotifications: NotificationMessage[] = [
    {
      id: '1',
      type: 'message',
      senderName: 'Sarah Johnson',
      senderImage: 'https://picsum.photos/400/400?random=1',
      listingTitle: 'iPhone 13 Pro Max - Excellent Condition',
      listingImage: 'https://picsum.photos/200/200?random=10',
      message: 'Hi! Is this still available? I\'m very interested.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      isRead: false,
      listingId: '1'
    },
    {
      id: '2',
      type: 'message',
      senderName: 'Mike Chen',
      listingTitle: 'MacBook Air M2 - Like New',
      listingImage: 'https://picsum.photos/200/200?random=11',
      message: 'What\'s the lowest price you\'d accept?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: false,
      listingId: '2'
    },
    {
      id: '3',
      type: 'message',
      senderName: 'Emily Davis',
      senderImage: 'https://picsum.photos/400/400?random=2',
      listingTitle: 'Desk Chair - Ergonomic Office Chair',
      listingImage: 'https://picsum.photos/200/200?random=12',
      message: 'Thanks for the quick response! I\'ll take it.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      isRead: true,
      listingId: '3'
    },
    {
      id: '4',
      type: 'message',
      senderName: 'David Wilson',
      listingTitle: 'Textbook: Calculus Early Transcendentals',
      listingImage: 'https://picsum.photos/200/200?random=13',
      message: 'Could we meet on campus tomorrow?',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      isRead: true,
      listingId: '4'
    },
    {
      id: '5',
      type: 'message',
      senderName: 'Jessica Lee',
      senderImage: 'https://picsum.photos/400/400?random=3',
      listingTitle: 'Gaming Monitor - 144Hz',
      listingImage: 'https://picsum.photos/200/200?random=14',
      message: 'Is there any warranty left on this monitor?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isRead: true,
      listingId: '5'
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  };

  const onRefresh = () => {
    loadNotifications();
  };

  const handleNotificationPress = (notification: NotificationMessage) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate to the chat for this listing
    router.push({
      pathname: '/chat/[id]',
      params: { id: notification.listingId }
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotificationItem = (notification: NotificationMessage) => (
    <TouchableOpacity
      key={notification.id}
      onPress={() => handleNotificationPress(notification)}
      className={`mb-3 ${notification.isRead ? 'opacity-70' : ''}`}
    >
      <View className={`bg-white rounded-xl p-4 shadow-sm border ${!notification.isRead ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
        <View className="flex-row items-start">
          {/* Sender Avatar */}
          <View className="mr-3">
            {notification.senderImage ? (
              <Image
                source={{ uri: notification.senderImage }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
                <User size={20} color="#6b7280" />
              </View>
            )}
            {!notification.isRead && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
            )}
          </View>

          {/* Content */}
          <View className="flex-1 mr-3">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-semibold text-gray-900" numberOfLines={1}>
                {notification.senderName}
              </Text>
              <View className="flex-row items-center">
                <Clock size={12} color="#6b7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {getTimeAgo(notification.timestamp)}
                </Text>
              </View>
            </View>

            {/* Listing Info */}
            <View className="flex-row items-center mb-2">
              <MessageCircle size={14} color={COLORS.utOrange} />
              <Text className="text-sm text-gray-600 ml-1 flex-1" numberOfLines={1}>
                About: {notification.listingTitle}
              </Text>
            </View>

            {/* Message Preview */}
            <Text className="text-gray-700 mb-3" numberOfLines={2}>
              {notification.message}
            </Text>

            {/* Listing Preview */}
            <View className="flex-row items-center p-2 bg-gray-50 rounded-lg">
              {notification.listingImage && (
                <Image
                  source={{ uri: notification.listingImage }}
                  className="w-10 h-10 rounded-lg mr-3"
                />
              )}
              <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
                {notification.listingTitle}
              </Text>
            </View>
          </View>

          {/* Arrow */}
          <ChevronRight size={20} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ModalHeader title="Notifications" />
      
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <View className="flex-row items-center justify-between py-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Recent Messages</Text>
            <Text className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </Text>
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
        {notifications.length > 0 ? (
          <View className="pb-6">
            {notifications.map(renderNotificationItem)}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Bell size={40} color="#9ca3af" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</Text>
            <Text className="text-gray-600 text-center px-8">
              When someone messages you about your listings, you'll see their messages here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}