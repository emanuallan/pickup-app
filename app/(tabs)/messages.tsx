import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Conversation {
  id: string;
  other_user: {
    id: string;
    email: string;
    profile_image_url: string | null;
    display_name: string | null;
  };
  last_message: {
    text: string;
    created_at: string;
  };
  unread_count: number;
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data
      // In a real app, you would fetch this from your database
      const mockConversations: Conversation[] = [
        {
          id: '1',
          other_user: {
            id: '2',
            email: 'john@utexas.edu',
            profile_image_url: null,
            display_name: 'John Doe'
          },
          last_message: {
            text: 'Is this still available?',
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
          },
          unread_count: 2
        },
        {
          id: '2',
          other_user: {
            id: '3',
            email: 'sarah@utexas.edu',
            profile_image_url: null,
            display_name: 'Sarah Smith'
          },
          last_message: {
            text: 'Great! When can we meet?',
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
          },
          unread_count: 0
        },
        {
          id: '3',
          other_user: {
            id: '4',
            email: 'mike@utexas.edu',
            profile_image_url: null,
            display_name: 'Mike Johnson'
          },
          last_message: {
            text: 'Thanks for the quick response!',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
          },
          unread_count: 0
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
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

  const navigateToChat = (conversationId: string, otherUser: Conversation['other_user']) => {
    router.push({
      pathname: '/chat/[id]',
      params: { 
        id: conversationId,
        otherUserName: otherUser.display_name || otherUser.email.split('@')[0],
        otherUserId: otherUser.id
      }
    });
  };

  if (!user) {
    return (
      <View className="flex-1 bg-white px-4 justify-center">
        <Text className="text-xl text-center text-gray-600">
          Please sign in to view your messages
        </Text>
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

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200">
        <Text className="text-2xl font-bold">Messages</Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center px-4 py-3 border-b border-gray-100"
            onPress={() => navigateToChat(item.id, item.other_user)}
          >
            {/* Profile Picture */}
            <View className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center mr-3">
              {item.other_user.profile_image_url ? (
                <Image
                  source={{ uri: item.other_user.profile_image_url }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <MaterialIcons name="person" size={24} color="#9CA3AF" />
              )}
            </View>

            {/* Message Preview */}
            <View className="flex-1">
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-base">
                  {item.other_user.display_name || item.other_user.email.split('@')[0]}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {formatTimestamp(item.last_message.created_at)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text 
                  className="text-gray-500 text-sm"
                  numberOfLines={1}
                >
                  {item.last_message.text}
                </Text>
                {item.unread_count > 0 && (
                  <View className="bg-[#C1501F] rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs">
                      {item.unread_count}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
} 