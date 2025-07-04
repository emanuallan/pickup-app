import { View, Text, ScrollView } from 'react-native';

export default function BrowseScreen() {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
      {/* Browse Content */}
      <View className="px-4 py-2">
        <Text className="text-2xl font-bold text-gray-900">Browse</Text>
        <Text className="text-base text-gray-500">Discover items for sale</Text>
      </View>

      {/* Content will go here */}
    </ScrollView>
  );
} 