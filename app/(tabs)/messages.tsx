import { View, Text, ScrollView } from 'react-native';

export default function MessagesScreen() {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
      {/* Messages Content */}
      <View className="px-4 pt-2 pb-6">
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
        <Text className="text-base text-gray-500 mt-1">Your conversations</Text>
      </View>

      {/* Content will go here */}
    </ScrollView>
  );
} 