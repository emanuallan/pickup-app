import { View, Text, ScrollView } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Content */}
      <View className="px-4 pt-2 pb-6">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        <Text className="text-base text-gray-500 mt-1">Your account details</Text>
      </View>

      {/* Content will go here */}
    </ScrollView>
  );
} 