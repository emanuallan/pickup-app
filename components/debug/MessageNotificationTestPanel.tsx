import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  testGeneralMessageNotification,
  testListingMessageNotification,
} from '../../utils/testMessagingNotificationsSimple';
import { testMessageReadStatus, testOpenChatWithUser } from '../../utils/testMessageReadStatus';
import {
  testGeneralMessagePush,
  testListingMessagePush,
  testNewReviewPush,
  testUpdatedReviewPush,
} from '../../utils/testPushNotifications';
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
      <View className="m-4 rounded-lg bg-gray-100 p-4">
        <Text className="text-center text-gray-600">
          Please log in to test messaging notifications
        </Text>
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
    <View className="m-4 rounded-lg border border-gray-200 bg-white p-4">
      <Text className="mb-4 text-lg font-semibold" style={{ color: COLORS.utOrange }}>
        🧪 Message Notification Testing
      </Text>

      <View className="gap-y-3">
        <View>
          <Text className="mb-1 text-sm font-medium text-gray-700">Receiver User ID:</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-gray-50 p-3"
            placeholder="Enter receiver user ID"
            value={receiverId}
            onChangeText={setReceiverId}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-gray-700">Message Content:</Text>
          <TextInput
            className="rounded-lg border border-gray-300 bg-gray-50 p-3"
            placeholder="Enter test message"
            value={messageContent}
            onChangeText={setMessageContent}
            multiline
            numberOfLines={2}
          />
        </View>

        <TouchableOpacity
          onPress={testGeneralMessage}
          className="items-center rounded-lg bg-blue-500 p-3">
          <Text className="font-medium text-white">Test General Message Notification</Text>
        </TouchableOpacity>

        <View className="mt-3 border-t border-gray-200 pt-3">
          <Text className="mb-2 text-sm font-medium text-gray-700">For Listing Messages:</Text>

          <View className="gap-y-2">
            <TextInput
              className="rounded-lg border border-gray-300 bg-gray-50 p-3"
              placeholder="Listing ID"
              value={listingId}
              onChangeText={setListingId}
              keyboardType="numeric"
            />

            <TextInput
              className="rounded-lg border border-gray-300 bg-gray-50 p-3"
              placeholder="Listing Title"
              value={listingTitle}
              onChangeText={setListingTitle}
            />

            <TextInput
              className="rounded-lg border border-gray-300 bg-gray-50 p-3"
              placeholder="Listing Price"
              value={listingPrice}
              onChangeText={setListingPrice}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            onPress={testListingMessage}
            className="mt-3 items-center rounded-lg bg-green-500 p-3">
            <Text className="font-medium text-white">Test Listing Message Notification</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3 border-t border-gray-200 pt-3">
          <Text className="mb-2 text-sm font-medium text-gray-700">Message Read Status Tests:</Text>

          <TouchableOpacity
            onPress={testReadStatus}
            className="mb-2 items-center rounded-lg bg-purple-500 p-3">
            <Text className="font-medium text-white">Test Message Read Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={testChatOpen}
            className="items-center rounded-lg bg-indigo-500 p-3">
            <Text className="font-medium text-white">Test Chat Open (Clear Read Count)</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3 border-t border-gray-200 pt-3">
          <Text className="mb-2 text-sm font-medium text-gray-700">Push Notification Tests:</Text>

          <TouchableOpacity
            onPress={testPushGeneral}
            className="mb-2 items-center rounded-lg bg-orange-500 p-3">
            <Text className="font-medium text-white">Test General Message Push</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={testPushListing}
            className="items-center rounded-lg bg-red-500 p-3">
            <Text className="font-medium text-white">Test Listing Message Push</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-3 border-t border-gray-200 pt-3">
          <Text className="mb-2 text-sm font-medium text-gray-700">Review Notification Tests:</Text>

          <TouchableOpacity
            onPress={testReviewNew}
            className="mb-2 items-center rounded-lg bg-yellow-500 p-3">
            <Text className="font-medium text-white">Test New Review Push</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={testReviewUpdate}
            className="items-center rounded-lg bg-amber-600 p-3">
            <Text className="font-medium text-white">Test Updated Review Push</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 rounded-lg bg-gray-50 p-3">
        <Text className="text-xs text-gray-600">
          💡 Tip: Check the console for detailed logs. Push notifications will appear on your device
          if you have notifications enabled. Test both message and review notifications to ensure
          they work properly.
        </Text>
      </View>
    </View>
  );
}
