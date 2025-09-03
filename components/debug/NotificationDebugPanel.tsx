import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { NotificationTestUtils } from '~/utils/testNotifications';
import { testNotificationDatabaseSetup, createTestNotification, checkNotificationCount } from '~/utils/testDatabaseSetup';
import { useNotificationSync } from '~/contexts/NotificationSyncContext';
import { COLORS } from '~/theme/colors';
import MessageNotificationTestPanel from './MessageNotificationTestPanel';

interface NotificationDebugPanelProps {
  visible?: boolean;
  onToggle?: () => void;
}

export const NotificationDebugPanel: React.FC<NotificationDebugPanelProps> = ({ 
  visible = false, 
  onToggle 
}) => {
  const { user } = useAuth();
  const { unreadCount, refreshCount } = useNotificationSync();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTestNotifications = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setIsLoading(true);
    try {
      await NotificationTestUtils.createTestNotifications(user.id);
      await refreshCount();
      Alert.alert('Success', 'Test notifications created! Check your notifications screen.');
    } catch (error) {
      Alert.alert('Error', 'Failed to create test notifications');
      console.error('Error creating test notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPushNotification = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setIsLoading(true);
    try {
      await NotificationTestUtils.testPushNotification(user.id);
      Alert.alert('Success', 'Push notification sent! You should receive it shortly.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send push notification');
      console.error('Error sending push notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await NotificationTestUtils.clearAllNotifications(user.id);
              await refreshCount();
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
              console.error('Error clearing notifications:', error);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRefreshCount = async () => {
    setIsLoading(true);
    try {
      await refreshCount();
      const dbCount = user?.id ? await checkNotificationCount(user.id) : 0;
      Alert.alert('Success', `UI Count: ${unreadCount}\nDB Count: ${dbCount}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh count');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestDatabaseSetup = async () => {
    setIsLoading(true);
    try {
      const isWorking = await testNotificationDatabaseSetup();
      Alert.alert(
        isWorking ? 'Database Setup OK' : 'Database Setup Error',
        isWorking 
          ? 'All database functions and tables are properly configured!' 
          : 'Database setup is missing. Please run the migration in Supabase SQL editor.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test database setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestNotificationDirect = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setIsLoading(true);
    try {
      const success = await createTestNotification(user.id);
      await refreshCount();
      Alert.alert(
        success ? 'Success' : 'Error', 
        success 
          ? 'Test notification created directly in database!'
          : 'Failed to create test notification'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create test notification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View className="bg-gray-900 p-4 m-4 rounded-lg">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-lg font-bold">🧪 Notification Debug Panel</Text>
        {onToggle && (
          <Switch
            value={visible}
            onValueChange={onToggle}
            trackColor={{ false: '#767577', true: COLORS.utOrange }}
            thumbColor={visible ? '#f5dd4b' : '#f4f3f4'}
          />
        )}
      </View>

      <View className="space-y-3">
        <View className="bg-gray-800 p-3 rounded">
          <Text className="text-white font-medium">Current Status:</Text>
          <Text className="text-gray-300">User ID: {user?.id || 'Not logged in'}</Text>
          <Text className="text-gray-300">Unread Count: {unreadCount}</Text>
        </View>

        <TouchableOpacity
          onPress={handleCreateTestNotifications}
          disabled={isLoading || !user?.id}
          className={`p-3 rounded ${isLoading || !user?.id ? 'bg-gray-600' : 'bg-blue-600'}`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Creating...' : 'Create Test Notifications'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTestPushNotification}
          disabled={isLoading || !user?.id}
          className={`p-3 rounded ${isLoading || !user?.id ? 'bg-gray-600' : 'bg-green-600'}`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Sending...' : 'Test Push Notification'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTestDatabaseSetup}
          disabled={isLoading}
          className={`p-3 rounded ${isLoading ? 'bg-gray-600' : 'bg-purple-600'}`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Testing...' : 'Test Database Setup'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreateTestNotificationDirect}
          disabled={isLoading || !user?.id}
          className={`p-3 rounded ${isLoading || !user?.id ? 'bg-gray-600' : 'bg-indigo-600'}`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Creating...' : 'Create Test (Direct DB)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRefreshCount}
          disabled={isLoading}
          className={`p-3 rounded ${isLoading ? 'bg-gray-600' : 'bg-yellow-600'}`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Refreshing...' : 'Check Counts'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClearAllNotifications}
          disabled={isLoading || !user?.id}
          className={`p-3 rounded ${isLoading || !user?.id ? 'bg-gray-600' : 'bg-red-600'}`}
        >
          <Text className="text-white text-center font-medium">
            {isLoading ? 'Clearing...' : 'Clear All Notifications'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-400 text-xs mt-4 text-center">
        Debug panel for testing notification functionality
      </Text>

      {/* Message Notification Test Panel */}
      <MessageNotificationTestPanel />
    </View>
  );
};

export default NotificationDebugPanel;