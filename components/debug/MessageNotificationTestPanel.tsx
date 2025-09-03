import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { testGeneralMessageNotification, testListingMessageNotification } from '../../utils/testMessagingNotificationsSimple';
import { testMessageReadStatus, testOpenChatWithUser } from '../../utils/testMessageReadStatus';
import { testGeneralMessagePush, testListingMessagePush, testNewReviewPush, testUpdatedReviewPush } from '../../utils/testPushNotifications';
import { COLORS } from '../../theme/colors';

export default function MessageNotificationTestPanel() {
  const { user } = useAuth();
  const [receiverId, setReceiverId] = useState('');
  const [messageContent, setMessageContent] = useState('This is a test message!');
  const [listingId, setListingId] = useState('');
  const [listingTitle, setListingTitle] = useState('Test Laptop');
  const [listingPrice, setListingPrice] = useState('500');

  if (!user) {
    return (
      <View className="p-4 bg-gray-100 rounded-lg m-4">
        <Text className="text-center text-gray-600">Please log in to test messaging notifications</Text>
      </View>
    );
  }

  const testGeneralMessage = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Please enter a receiver ID');
      return;
    }

    const result = await testGeneralMessageNotification(
      user.id,
      receiverId.trim(),
      'Test User', // You can modify this to use actual display name
      messageContent
    );

    if (result) {
      Alert.alert('Success', `General message notification created with ID: ${result}`);
    } else {
      Alert.alert('Error', 'Failed to create general message notification');
    }
  };

  const testListingMessage = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Please enter a receiver ID');
      return;
    }

    if (!listingId.trim()) {
      Alert.alert('Error', 'Please enter a listing ID');
      return;
    }

    const result = await testListingMessageNotification(
      user.id,
      receiverId.trim(),
      'Test User', // You can modify this to use actual display name
      messageContent,
      listingId, // Keep as string since it's a UUID
      listingTitle,
      parseFloat(listingPrice)
    );

    if (result) {
      Alert.alert('Success', `Listing message notification created with ID: ${result}`);
    } else {
      Alert.alert('Error', 'Failed to create listing message notification');
    }
  };

  const testReadStatus = async () => {
    try {
      await testMessageReadStatus();
      Alert.alert('Success', 'Message read status test completed! Check console for details.');
    } catch (error) {
      Alert.alert('Error', 'Message read status test failed. Check console for details.');
    }
  };

  const testChatOpen = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Please enter a user ID to test chat opening with');
      return;
    }

    try {
      await testOpenChatWithUser(receiverId.trim());
      Alert.alert('Success', 'Chat open simulation completed! Check console for details.');
    } catch (error) {
      Alert.alert('Error', 'Chat open simulation failed. Check console for details.');
    }
  };

  const testPushGeneral = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Please enter a receiver ID');
      return;
    }

    try {
      const result = await testGeneralMessagePush(receiverId.trim(), 'Test User');
      if (result) {
        Alert.alert('Success', 'General message push notification sent! Check your device.');
      } else {
        Alert.alert('Error', 'Failed to send push notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send push notification');
    }
  };

  const testPushListing = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Please enter a receiver ID');
      return;
    }

    try {
      const result = await testListingMessagePush(receiverId.trim(), 'Test User', listingTitle);
      if (result) {
        Alert.alert('Success', 'Listing message push notification sent! Check your device.');
      } else {
        Alert.alert('Error', 'Failed to send push notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send push notification');
    }
  };

  const testReviewNew = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Please enter a user ID to send review notification to');
      return;
    }

    try {
      const result = await testNewReviewPush(receiverId.trim(), 'Test User');
      if (result) {
        Alert.alert('Success', 'New review push notification sent! Check your device.');
      } else {
        Alert.alert('Error', 'Failed to send review push notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send review push notification');
    }
  };

  const testReviewUpdate = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Please enter a user ID to send review notification to');
      return;
    }

    try {
      const result = await testUpdatedReviewPush(receiverId.trim(), 'Test User');
      if (result) {
        Alert.alert('Success', 'Updated review push notification sent! Check your device.');
      } else {
        Alert.alert('Error', 'Failed to send review push notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send review push notification');
    }
  };

  return (
    <View className="p-4 bg-white rounded-lg m-4 border border-gray-200">
      <Text className="text-lg font-semibold mb-4" style={{ color: COLORS.utOrange }}>
        🧪 Message Notification Testing
      </Text>

      <View className="space-y-3">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Receiver User ID:</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            placeholder="Enter receiver user ID"
            value={receiverId}
            onChangeText={setReceiverId}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">Message Content:</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            placeholder="Enter test message"
            value={messageContent}
            onChangeText={setMessageContent}
            multiline
            numberOfLines={2}
          />
        </View>

        <TouchableOpacity
          onPress={testGeneralMessage}
          className="bg-blue-500 rounded-lg p-3 items-center"
        >
          <Text className="text-white font-medium">Test General Message Notification</Text>
        </TouchableOpacity>

        <View className="border-t border-gray-200 pt-3 mt-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">For Listing Messages:</Text>
          
          <View className="space-y-2">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Listing ID"
              value={listingId}
              onChangeText={setListingId}
              keyboardType="numeric"
            />
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Listing Title"
              value={listingTitle}
              onChangeText={setListingTitle}
            />
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Listing Price"
              value={listingPrice}
              onChangeText={setListingPrice}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            onPress={testListingMessage}
            className="bg-green-500 rounded-lg p-3 items-center mt-3"
          >
            <Text className="text-white font-medium">Test Listing Message Notification</Text>
          </TouchableOpacity>
        </View>

        <View className="border-t border-gray-200 pt-3 mt-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">Message Read Status Tests:</Text>
          
          <TouchableOpacity
            onPress={testReadStatus}
            className="bg-purple-500 rounded-lg p-3 items-center mb-2"
          >
            <Text className="text-white font-medium">Test Message Read Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={testChatOpen}
            className="bg-indigo-500 rounded-lg p-3 items-center"
          >
            <Text className="text-white font-medium">Test Chat Open (Clear Read Count)</Text>
          </TouchableOpacity>
        </View>

        <View className="border-t border-gray-200 pt-3 mt-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">Push Notification Tests:</Text>
          
          <TouchableOpacity
            onPress={testPushGeneral}
            className="bg-orange-500 rounded-lg p-3 items-center mb-2"
          >
            <Text className="text-white font-medium">Test General Message Push</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={testPushListing}
            className="bg-red-500 rounded-lg p-3 items-center"
          >
            <Text className="text-white font-medium">Test Listing Message Push</Text>
          </TouchableOpacity>
        </View>

        <View className="border-t border-gray-200 pt-3 mt-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">Review Notification Tests:</Text>
          
          <TouchableOpacity
            onPress={testReviewNew}
            className="bg-yellow-500 rounded-lg p-3 items-center mb-2"
          >
            <Text className="text-white font-medium">Test New Review Push</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={testReviewUpdate}
            className="bg-amber-600 rounded-lg p-3 items-center"
          >
            <Text className="text-white font-medium">Test Updated Review Push</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 p-3 bg-gray-50 rounded-lg">
        <Text className="text-xs text-gray-600">
          💡 Tip: Check the console for detailed logs. Push notifications will appear on your device if you have notifications enabled.
          Test both message and review notifications to ensure they work properly.
        </Text>
      </View>
    </View>
  );
}