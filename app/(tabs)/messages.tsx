import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '~/theme/colors';
import { useNotificationSync } from '~/contexts/NotificationSyncContext';
import { useSettings } from '~/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import SuccessMessage from '~/components/ui/SuccessMessage';
import { UserNotificationService } from '~/lib/userNotifications';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  listing_id?: string;
}

interface Conversation {
  user_id: string;
  user_name: string;
  user_image?: string;
  listing_id: string;
  listing_title: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshCount } = useNotificationSync();
  const { hapticFeedbackEnabled } = useSettings();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToMessages();
    }
  }, [user]);

  // Refresh notification counts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refreshCount();
        // Silently refresh conversations when returning to messages screen
        fetchConversations(false, true); // isRefresh=false, silent=true
      }
    }, [user, refreshCount])
  );

  const subscribeToMessages = () => {
    if (!user?.id) return;

    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id) {
              fetchConversations();
            }
          } else if (payload.eventType === 'UPDATE') {
            // Refresh conversations when messages are marked as read
            const updatedMessage = payload.new as Message;
            if (updatedMessage.sender_id === user.id || updatedMessage.receiver_id === user.id) {
              fetchConversations();
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            fetchConversations();
          } else if (payload.eventType === 'UPDATE') {
            // Refresh conversations when messages are marked as read
            const updatedMessage = payload.new as Message;
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  };

  const fetchConversations = async (isRefresh: boolean = false, silent: boolean = false) => {
    if (!user?.id) return;
    
    try {
      if (isRefresh && !silent) {
        setRefreshing(true);
      } else if (!silent) {
        setLoading(true);
      }
      // Fetch all messages for the current user
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      const userId = user.id;
      const filteredMessages = messagesData?.filter(
        (msg) => msg.sender_id === userId || msg.receiver_id === userId
      ) || [];

      // Group by user_id and listing_id
      const conversationMap = new Map<string, Conversation>();
      for (const message of filteredMessages) {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const listingId = message.listing_id || "general";
        const key = `${partnerId}:${listingId}`;

        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            user_id: partnerId,
            user_name: "", // We'll fetch this later
            user_image: undefined,
            listing_id: listingId,
            listing_title: "",
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: message.receiver_id === user.id && !message.is_read ? 1 : 0,
          });
        } else {
          const conv = conversationMap.get(key)!;
          if (message.receiver_id === user.id && !message.is_read) {
            conv.unread_count++;
          }
        }
      }

      // Fetch user settings for all partner IDs
      const partnerIds = Array.from(conversationMap.values()).map((c) => c.user_id);
      const listingIds = Array.from(conversationMap.values())
        .map((c) => c.listing_id)
        .filter((id) => id !== "general");

      const { data: userSettingsData } = await supabase
        .from('users')
        .select('id, email, display_name, profile_image_url')
        .in('id', partnerIds);

      // Fetch listing titles
      const { data: listingData } = await supabase
        .from("listings")
        .select("id, title")
        .in("id", listingIds.length > 0 ? listingIds : [""]);

      // Update conversation map with user info and listing titles
      for (const conv of conversationMap.values()) {
        const userSettings = userSettingsData?.find((u) => u.id === conv.user_id);
        if (userSettings) {
          conv.user_name = userSettings.display_name || (userSettings.email ? userSettings.email.split('@')[0] : 'User');
          conv.user_image = userSettings.profile_image_url;
        } else {
          conv.user_name = 'User';
        }
        const listing = listingData?.find((l) => l.id === conv.listing_id);
        if (listing) {
          conv.listing_title = listing.title;
        }
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchConversations(true);
    // Show success feedback
    setTimeout(() => {
      if (hapticFeedbackEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowSuccessMessage(true);
    }, 300);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return `${days}d`;
    }
  };

  const isValidUUID = (id: string) => typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id);

  const navigateToChat = async (conversation: Conversation) => {
    // Mark all unread messages in this conversation as read
    if (conversation.unread_count > 0 && user?.id) {
      try {
        const listingId = isValidUUID(conversation.listing_id) ? conversation.listing_id : null;
        
        // First, get all unread messages in this conversation
        let selectQuery = supabase
          .from('messages')
          .select('id')
          .eq('receiver_id', user.id)
          .eq('sender_id', conversation.user_id)
          .eq('is_read', false);

        // Add listing_id filter if it's not a general conversation
        if (listingId) {
          selectQuery = selectQuery.eq('listing_id', listingId);
        } else {
          selectQuery = selectQuery.is('listing_id', null);
        }

        const { data: unreadMessages, error: selectError } = await selectQuery;
        
        if (selectError) throw selectError;
        
        if (unreadMessages && unreadMessages.length > 0) {
          // Update each message individually to trigger real-time subscriptions
          const updatePromises = unreadMessages.map(message => 
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', message.id)
          );
          
          await Promise.all(updatePromises);
        }
        
        // Update local state to reflect the change
        setConversations(prev => 
          prev.map(conv => 
            conv.user_id === conversation.user_id && conv.listing_id === conversation.listing_id
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );

        // Mark corresponding notifications as read
        const listingIdForNotifications = isValidUUID(conversation.listing_id) ? conversation.listing_id : null;
        await UserNotificationService.markConversationNotificationsAsRead(
          user.id,
          conversation.user_id,
          listingIdForNotifications
        );

        // Refresh notification counts in other components
        refreshCount();

        // Trigger a small delay to ensure the database update is processed
        // This helps ensure real-time subscriptions pick up the changes
        setTimeout(() => {
          refreshCount();
        }, 100);
      } catch (error) {
        console.error('Error marking messages as read:', error);
        // Continue with navigation even if marking as read fails
      }
    }

    router.push({
      pathname: '/chat/[id]',
      params: { 
        id: `${conversation.user_id}:${isValidUUID(conversation.listing_id) ? conversation.listing_id : 'general'}`,
        otherUserName: conversation.user_name,
        otherUserId: conversation.user_id,
        listingId: isValidUUID(conversation.listing_id) ? conversation.listing_id : 'general',
        listingTitle: conversation.listing_title
      }
    });
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 justify-center">
        <View className="bg-white mx-4 rounded-3xl p-8 shadow-sm">
          <View className="items-center mb-8">
            <MaterialIcons name="forum" size={64} color={COLORS.utOrange} />
            <Text className="text-2xl font-semibold mt-4">Your Messages</Text>
            <Text className="text-gray-500 text-center mt-2">
              Connect with other Longhorns in the marketplace
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-gray-600 text-center mb-4 text-lg">
              You need to be logged in to view your messages
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              className="w-full flex-row items-center justify-center py-3.5 rounded-xl"
              style={{ backgroundColor: COLORS.utOrange }}
            >
              <MaterialIcons name="person" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text className="text-white font-medium">Go to Profile to Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#C1501F" />
      </View>
    );
  }

  if (conversations.length === 0) {
  return (
      <View className="flex-1 bg-white px-4 py-8">
        <View className="items-center">
          <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="forum" size={32} color="#C1501F" />
          </View>
          <Text className="text-xl font-semibold text-center mb-2">No conversations yet</Text>
          <Text className="text-gray-600 text-center mb-6">
            Start messaging with other Longhorns by browsing listings and reaching out to sellers.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/browse')}
            className="bg-[#C1501F] px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Browse Listings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={conversations}
        keyExtractor={(item) => `${item.user_id}:${item.listing_id}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.utOrange}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigateToChat(item)}
            className="flex-row items-center px-4 py-3 border-b border-gray-100"
          >
            {/* Profile Picture */}
            <View className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center mr-3">
              {item.user_image ? (
                <Image
                  source={{ uri: item.user_image }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Text className="text-lg font-semibold text-gray-500">
                  {item.user_name[0]?.toUpperCase()}
                </Text>
              )}
            </View>

            {/* Message Preview */}
            <View className="flex-1">
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-base">
                  {item.user_name}
                </Text>
                {item.last_message_time && (
                  <Text className="text-gray-500 text-sm">
                    {formatTimestamp(item.last_message_time)}
                  </Text>
                )}
      </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600" numberOfLines={1}>
                  {item.listing_title || "General Chat"}
                </Text>
                {item.unread_count > 0 && (
                  <View className="bg-[#C1501F] rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs">
                      {item.unread_count}
                    </Text>
                  </View>
                )}
              </View>

              {item.last_message && (
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                  {item.last_message}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
      
      {/* Success Message */}
      <SuccessMessage
        visible={showSuccessMessage}
        message="Messages refreshed!"
        onHide={() => setShowSuccessMessage(false)}
      />
    </View>
  );
} 