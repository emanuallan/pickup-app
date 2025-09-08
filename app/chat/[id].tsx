import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert, Pressable, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatSettingsModal from '../../components/modals/ChatSettingsModal';
import { Message } from '../../types/chat';
import { formatTime, shouldShowTimestamp, buildMessageQuery, isRelevantMessage } from '../../utils/chat';
import { UserNotificationService } from '../../lib/userNotifications';
import { useMessageCount } from '../../contexts/MessageCountContext';
import { useNotificationSync } from '../../contexts/NotificationSyncContext';
import React from 'react';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const { otherUserName, otherUserId, listingId, listingTitle } = params;
  const { user } = useAuth();
  const router = useRouter();
  const { refreshMessageCount } = useMessageCount();
  const { refreshCount } = useNotificationSync();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [otherUserImage, setOtherUserImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [pressedMessageId, setPressedMessageId] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string>('');
  const [listingDetails, setListingDetails] = useState<{ title?: string; price?: number; image?: string; is_sold?: boolean } | null>(null);

  useEffect(() => {
    if (!otherUserId || !otherUserName) {
      router.back();
      return;
    }

    if (user?.id) {
      console.log('🔌 Setting up chat for:', { user: user.id, otherUser: otherUserId, listingId });
      
      fetchMessages();
      fetchOtherUserProfile();
      fetchSenderProfile();
      fetchListingDetails();
      
      const subscription = subscribeToMessages();
      
      return () => {
        console.log('🔌 Cleaning up chat subscription');
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [user?.id, otherUserId, otherUserName, listingId]);

  // Handle back navigation to refresh messages screen
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Refresh message counts when navigating back
        refreshMessageCount();
        refreshCount();
        return false; // Let the default back behavior continue
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Also refresh when screen loses focus (user navigates away)
      return () => {
        subscription.remove();
        // Refresh counts when leaving the chat screen
        setTimeout(() => {
          refreshMessageCount();
          refreshCount();
        }, 100);
      };
    }, [refreshMessageCount, refreshCount])
  );

  const fetchOtherUserProfile = async () => {
    if (!otherUserId) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('profile_image_url')
        .eq('id', otherUserId.toString())
        .single();

      if (error) throw error;
      setOtherUserImage(data?.profile_image_url);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchSenderProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('display_name, email')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const displayName = data?.display_name || (data?.email ? data.email.split('@')[0] : 'User');
      setSenderName(displayName);
    } catch (error) {
      console.error('Error fetching sender profile:', error);
      setSenderName('User');
    }
  };

  const fetchListingDetails = async () => {
    if (!listingId || listingId === 'general') {
      setListingDetails(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('title, price, images, is_sold')
        .eq('id', listingId.toString())
        .single();

      if (error) throw error;
      
      setListingDetails({
        title: data?.title,
        price: data?.price,
        image: data?.images?.[0],
        is_sold: data?.is_sold
      });
    } catch (error) {
      console.error('Error fetching listing details:', error);
      setListingDetails(null);
    }
  };

  const subscribeToMessages = () => {
    if (!user?.id || !otherUserId) return;

    // Create unique channel name for this conversation
    const channelName = `chat:${user.id}:${otherUserId}:${listingId || 'general'}`;
    
    console.log('🔌 Creating subscription for channel:', channelName);
    
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${otherUserId},receiver_id=eq.${user.id}`
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Verify this message belongs to our conversation
          if (!isRelevantMessage(
            newMessage, 
            user?.id || '', 
            otherUserId.toString(), 
            listingId?.toString() || "general"
          )) {
            return;
          }
          
          console.log('📨 Real-time message received:', newMessage);
          
          // Check if message already exists (to prevent duplicates)
          setMessages(prev => {
            if (prev.some(msg => msg.id === newMessage.id)) {
              console.log('⚠️ Message already exists, skipping duplicate');
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Auto-mark received messages as read and mark notification as read
          try {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
            
            await UserNotificationService.markMessageNotificationAsRead(newMessage.id);
            
            // Update local state
            setMessages(prev => 
              prev.map(msg => 
                msg.id === newMessage.id ? { ...msg, is_read: true } : msg
              )
            );
          } catch (error) {
            console.error('Error marking message as read:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id},receiver_id=eq.${otherUserId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Verify this message belongs to our conversation
          if (!isRelevantMessage(
            newMessage, 
            user?.id || '', 
            otherUserId.toString(), 
            listingId?.toString() || "general"
          )) {
            return;
          }
          
          console.log('📤 Own message confirmed in database:', newMessage);
          
          // Replace optimistic message with real one from database
          setMessages(prev => 
            prev.map(msg => {
              // Replace temporary message with real one
              if (msg.id.startsWith('temp-') && msg.content === newMessage.content && msg.sender_id === newMessage.sender_id) {
                return newMessage;
              }
              // Or if it's already the real message, don't duplicate
              if (msg.id === newMessage.id) {
                return msg;
              }
              return msg;
            })
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id}))`
        },
        async (payload) => {
          const updatedMessage = payload.new as Message;
          
          if (!isRelevantMessage(
            updatedMessage, 
            user?.id || '', 
            otherUserId.toString(), 
            listingId?.toString() || "general"
          )) {
            return;
          }
          
          console.log('🔄 Message updated:', updatedMessage);
          
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Real-time subscription timed out');
        }
      });

    return subscription;
  };

  const fetchMessages = async () => {
    if (!user?.id || !otherUserId) return;

    try {
      setLoading(true);
      
      const { data: messages, error } = await buildMessageQuery(
        supabase,
        user.id,
        otherUserId as string,
        (listingId as string) || "general"
      );

      if (error) throw error;

      setMessages(messages || []);

      const unreadMessages = (messages || []).filter(
        (msg: Message) => !msg.is_read && msg.sender_id === otherUserId
      );

      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in(
            'id',
            unreadMessages.map((msg: Message) => msg.id)
          );
        
        // Mark corresponding notifications as read for each message
        for (const message of unreadMessages) {
          await UserNotificationService.markMessageNotificationAsRead(message.id);
        }
        
        // Update local state immediately to reflect read status
        setMessages(prev => 
          prev.map(msg => 
            unreadMessages.some(unreadMsg => unreadMsg.id === msg.id)
              ? { ...msg, is_read: true }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const isValidUUID = (id: string | undefined | null) => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(id);
  };

  const sendMessage = async () => {
    if (!user?.id || !otherUserId || !newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      id: `temp-${Date.now()}-${Math.random()}`, // Unique temporary ID
      sender_id: user.id,
      receiver_id: otherUserId.toString(),
      content: messageContent,
      listing_id: listingId === "general" ? null : (listingId || null),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    // Add message optimistically to UI
    setMessages(prev => [...prev, optimisticMessage]);

    // Auto-scroll to bottom when sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      setSending(true);
      
      const messageData = {
        sender_id: user.id,
        receiver_id: otherUserId,
        content: messageContent,
        listing_id: listingId === "general" ? null : (listingId || null),
        is_read: false,
      };

      console.log('📤 Sending message to database:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Message sent successfully:', data);

      // The real-time subscription will handle replacing the optimistic message
      // So we don't need to manually replace it here to avoid race conditions
      
      // Send notification to the receiver (NOT the sender)
      if (senderName && otherUserId && data) {
        console.log('🔔 Sending notification - Sender:', user.id, 'Receiver:', otherUserId);
        
        // Double-check we're not sending notification to ourselves
        if (user.id === otherUserId.toString()) {
          console.log('⚠️ Attempted to send notification to self, skipping');
          return;
        }
        
        try {
          await UserNotificationService.notifyNewMessage({
            receiverId: otherUserId.toString(),
            senderId: user.id,
            senderName: senderName,
            messageContent: messageContent,
            messageId: data.id,
            listingId: listingId && listingId !== 'general' ? listingId.toString() : undefined,
            listingTitle: listingDetails?.title
          });
          console.log('📱 Notification sent successfully to receiver:', otherUserId);
        } catch (error) {
          console.error('Error sending notification:', error);
          // Don't throw error - message was sent successfully, just notification failed
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      // Restore message text
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!user?.email || !otherUserId) return;

    try {
      Alert.alert(
        "Delete Conversation",
        "Are you sure you want to delete this conversation? This cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setShowSettings(false);
              const { error } = await supabase
                .from("messages")
                .delete()
                .or(
                  `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
                )
                .eq("listing_id", listingId === "general" ? null : listingId);

              if (error) {
                Alert.alert("Error", "Failed to delete conversation");
              } else {
                router.back();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert("Error", "Failed to delete conversation");
    }
  };

  const handleBlock = () => {
    Alert.alert(
      "Block User",
      "Are you sure you want to block this user? You won't receive messages from them.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            setShowSettings(false);
            // TODO: Implement block functionality
            Alert.alert("Coming Soon", "This feature will be available soon!");
          }
        }
      ]
    );
  };

  const handleReport = () => {
    setShowSettings(false);
    // TODO: Implement report functionality
    Alert.alert("Coming Soon", "This feature will be available soon!");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#C1501F" />
      </View>
    );
  }

  if (!otherUserId || !otherUserName) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ChatHeader
        otherUserName={otherUserName.toString()}
        otherUserImage={otherUserImage}
        otherUserId={otherUserId.toString()}
        listingId={listingId?.toString() || "general"}
        listingTitle={listingTitle?.toString() || ""}
        listingImageUrl={listingDetails?.image || null}
        listingIsSold={listingDetails?.is_sold || false}
        onSettingsPress={() => setShowSettings(true)}
      />

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        className="flex-1 p-4"
        renderItem={({ item, index }) => {
          const isOwnMessage = item.sender_id === user?.id;
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showTimestamp = shouldShowTimestamp(item, prevMessage);
          const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
          const isLastInGroup = !nextMessage || nextMessage.sender_id !== item.sender_id;

          return (
            <View>
              <Pressable 
                onLongPress={() => setPressedMessageId(item.id)}
                onPressOut={() => setPressedMessageId(null)}
                className={`flex-row items-end ${
                  isOwnMessage ? 'justify-end' : 'justify-start'
                } ${!isLastInGroup ? 'mb-1' : 'mb-3'}`}
              >
                {!isOwnMessage && (
                  <View className="w-8 h-8 rounded-full bg-gray-200 justify-center items-center mr-2">
                    {otherUserImage ? (
                      <Image
                        source={{ uri: otherUserImage }}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <Text className="text-sm font-semibold text-gray-500">
                        {otherUserName?.[0]?.toUpperCase()}
                      </Text>
                    )}
                  </View>
                )}
                <View 
                  className={`
                    px-4 py-2 rounded-2xl max-w-[75%]
                    ${isOwnMessage 
                      ? 'bg-[#C1501F] rounded-br-sm' 
                      : 'bg-gray-200 rounded-bl-sm'
                    }
                  `}
                >
                  <Text 
                    className={`text-base ${
                      isOwnMessage ? 'text-white' : 'text-black'
                    }`}
                  >
                    {item.content}
                  </Text>
                  {pressedMessageId === item.id && (
                    <Text 
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(item.created_at)}
                    </Text>
                  )}
                </View>
              </Pressable>
              {isLastInGroup && showTimestamp && nextMessage && (
                <Text className="text-gray-500 text-xs text-center my-2">
                  {formatTime(nextMessage.created_at)}
                </Text>
              )}
            </View>
          );
        }}
        onContentSizeChange={() => {
          // Auto-scroll to bottom when new messages arrive
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
        onLayout={() => {
          // Scroll to end when component mounts
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }}
      />

      {/* Message Input */}
      <View className="px-4 py-2 border-t border-gray-200 flex-row items-center pb-10">
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

      <ChatSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onBlock={handleBlock}
        onReport={handleReport}
        onDelete={handleDeleteConversation}
      />
    </KeyboardAvoidingView>
  );
} 