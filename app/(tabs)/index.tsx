import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View className="px-4 pt-2 pb-6">
          <Text className="text-2xl font-bold text-gray-900">Welcome Back!</Text>
          <Text className="text-base text-gray-500 mt-1">Find what you need at UT Austin</Text>
        </View>

        {/* Content will go here */}
      </ScrollView>
    </SafeAreaView>
  );
} 