import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Message {
  id: string;
  text: string;
  created_at: string;
  sender_id: string;
}

export default function ChatScreen() {
  const { id: conversationId, otherUserName, otherUserId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, conversationId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data
      // In a real app, you would fetch this from your database
      const mockMessages: Message[] = [
        {
          id: '1',
          text: 'Hi, is this still available?',
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          sender_id: otherUserId as string
        },
        {
          id: '2',
          text: 'Yes, it is! When would you like to meet?',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          sender_id: user?.id || ''
        },
        {
          id: '3',
          text: 'How about tomorrow at 2pm?',
          created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          sender_id: otherUserId as string
        },
        {
          id: '4',
          text: 'That works for me!',
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          sender_id: user?.id || ''
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      
      // In a real app, you would send this to your database
      const mockMessage: Message = {
        id: Date.now().toString(),
        text: newMessage,
        created_at: new Date().toISOString(),
        sender_id: user.id
      };

      setMessages(prev => [...prev, mockMessage]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#C1501F" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4"
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isOwnMessage = item.sender_id === user?.id;
          return (
            <View className={`flex-row ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
              <View 
                className={`
                  px-4 py-2 rounded-2xl max-w-[80%]
                  ${isOwnMessage ? 'bg-[#C1501F]' : 'bg-gray-100'}
                `}
              >
                <Text 
                  className={`text-base ${isOwnMessage ? 'text-white' : 'text-black'}`}
                >
                  {item.text}
                </Text>
                <Text 
                  className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}
                >
                  {formatTime(item.created_at)}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Message Input */}
      <View className="px-4 py-2 border-t border-gray-200 flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
          placeholder="Message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={sending || !newMessage.trim()}
          className={`
            rounded-full p-2
            ${(!newMessage.trim() || sending) ? 'bg-gray-300' : 'bg-[#C1501F]'}
          `}
        >
          <MaterialIcons 
            name="send" 
            size={24} 
            color="white"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
} 