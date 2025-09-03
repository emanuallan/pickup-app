import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  Pressable,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';
import { UserNotificationService, UserNotification } from '~/lib/userNotifications';
import { ArrowLeft, MessageCircle, Star, Trash2, CheckCheck, Bell, BellOff, Heart, Eye, Settings } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';
import { getTimeAgo } from '~/utils/timeago';
import * as Haptics from 'expo-haptics';

export default function UserNotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id]);

  const fetchNotifications = async (showLoading = true) => {
    if (!user?.id) return;

    try {
      if (showLoading) setLoading(true);
      
      const data = await UserNotificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const count = await UserNotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
    fetchUnreadCount();
  };

  const handleNotificationPress = async (notification: UserNotification) => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mark as read if unread
    if (!notification.is_read) {
      await UserNotificationService.markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        if (notification.actor_id) {
          router.push({
            pathname: '/chat/[id]',
            params: { 
              id: notification.actor_id,
              otherUserId: notification.actor_id,
              otherUserName: notification.data?.actor_name || 'User',
              listingId: notification.listing_id || 'general',
              listingTitle: notification.data?.listing_title || ''
            }
          });
        }
        break;
      case 'review':
        router.push(`/profile/${user?.id}`);
        break;
      case 'listing':
        if (notification.listing_id) {
          router.push(`/listing/${notification.listing_id}`);
        }
        break;
      case 'system':
        // Handle system notifications
        break;
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await UserNotificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      fetchUnreadCount(); // Refresh count in case it was unread
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;

    try {
      await UserNotificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={20} color={COLORS.utOrange} />;
      case 'review':
        return <Star size={20} color={COLORS.utOrange} fill={COLORS.utOrange} />;
      case 'listing':
        return <Heart size={20} color={COLORS.utOrange} fill={COLORS.utOrange} />;
      case 'system':
        return <Settings size={20} color={COLORS.utOrange} />;
      default:
        return <Bell size={20} color={COLORS.utOrange} />;
    }
  };

  const renderNotification = ({ item }: { item: UserNotification }) => (
    <Pressable
      onPress={() => handleNotificationPress(item)}
      className={`mx-4 mb-3 ${!item.is_read ? 'opacity-100' : 'opacity-70'}`}
    >
      <View className={`bg-white rounded-xl shadow-sm border ${!item.is_read ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
        <View className="p-4">
          <View className="flex-row items-start">
            {/* Notification Icon */}
            <View className="mr-3">
              <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
                {getNotificationIcon(item.type)}
              </View>
              {!item.is_read && (
                <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
              )}
            </View>

            {/* Content */}
            <View className="flex-1 mr-3">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className={`font-semibold text-gray-900 ${!item.is_read ? 'font-bold' : 'font-semibold'}`} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-500">
                  {getTimeAgo(item.created_at)}
                </Text>
              </View>

              {/* Message */}
              <Text className="text-gray-700 mb-3" numberOfLines={2}>
                {item.message}
              </Text>

              {/* Additional data for specific notification types */}
              {item.type === 'review' && item.data?.rating && (
                <View className="flex-row items-center mb-2">
                  <Text className="text-lg mr-2">{item.data.star_emoji || '⭐'.repeat(item.data.rating)}</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {item.data.rating}/5 stars
                  </Text>
                  {item.data.review && (
                    <Text className="text-xs text-gray-500 ml-2" numberOfLines={1}>
                      • "{item.data.review}"
                    </Text>
                  )}
                </View>
              )}

              {/* Message Preview for message notifications */}
              {item.type === 'message' && item.data?.message_preview && (
                <View className="bg-blue-50 p-2 rounded-lg mb-2">
                  <Text className="text-sm text-blue-800 italic" numberOfLines={2}>
                    "{item.data.message_preview}"
                  </Text>
                </View>
              )}

              {/* Listing Preview */}
              {item.data?.listing_title && (
                <View className="flex-row items-center p-2 bg-gray-50 rounded-lg">
                  {item.data.listing_image && (
                    <Image
                      source={{ uri: item.data.listing_image }}
                      className="w-10 h-10 rounded-lg mr-3"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600" numberOfLines={1}>
                      {item.data.listing_title}
                    </Text>
                    {item.data.listing_price && (
                      <Text className="text-xs font-semibold" style={{ color: COLORS.utOrange }}>
                        ${item.data.listing_price}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center justify-end px-4 pb-3 pt-1 border-t border-gray-100">
          {/* Delete */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert(
                'Delete Notification',
                'Are you sure you want to delete this notification?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => handleDeleteNotification(item.id) }
                ]
              );
            }}
            className="flex-row items-center bg-red-50 rounded-full px-3 py-1.5"
          >
            <Trash2 size={14} color="#dc2626" />
            <Text className="text-red-800 font-medium text-xs ml-1">
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="py-4 px-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.utOrange} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
            <View className="w-6" />
          </View>
        </View>

        {/* Login Required Content */}
        <View className="flex-1 justify-center">
          <View className="bg-white mx-4 rounded-3xl p-8 shadow-sm">
            <View className="items-center mb-8">
              <Bell size={64} color={COLORS.utOrange} />
              <Text className="text-2xl font-semibold mt-4">Your Notifications</Text>
              <Text className="text-gray-500 text-center mt-2">
                Stay updated on marketplace activity
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-gray-600 text-center mb-4 text-lg">
                You need to be logged in to view your notifications
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                className="w-full flex-row items-center justify-center py-3.5 rounded-xl"
                style={{ backgroundColor: COLORS.utOrange }}
              >
                <Text className="text-white font-medium">Go to Profile to Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="py-4 px-4 border-b border-gray-200 bg-white">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.utOrange} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
          <View className="w-6" />
        </View>
        
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600">
            {notifications.length === 0 
              ? 'No notifications'
              : unreadCount > 0 
                ? `${unreadCount} unread of ${notifications.length} total`
                : `All ${notifications.length} read`
            }
          </Text>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              className="flex-row items-center bg-blue-50 rounded-full px-3 py-2"
            >
              <CheckCheck size={14} color="#1e40af" />
              <Text className="text-blue-800 font-medium text-xs ml-1">
                Read all
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-20 px-4">
          <ActivityIndicator size="large" color={COLORS.utOrange} />
          <Text className="text-gray-500 mt-4">Loading notifications...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.utOrange}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center py-20 px-4">
          <View className="bg-gray-100 rounded-full p-6 mb-4">
            <Bell size={40} color="#9ca3af" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</Text>
          <Text className="text-gray-600 text-center px-8">
            When someone messages you, rates you, or interacts with your listings, you'll see notifications here.
          </Text>
        </View>
      )}
    </View>
  );
}