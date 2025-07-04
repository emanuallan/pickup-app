import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-4">
        <View className="items-center mb-8">
          <MaterialIcons name="add-box" size={64} color="#C1501F" />
          <Text className="text-2xl font-semibold mt-4">Create a Listing</Text>
          <Text className="text-gray-500 text-center mt-2">
            Add photos and details about what you're selling
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/create/photos')}
          className="w-full flex-row items-center justify-center py-3.5 bg-[#C1501F] rounded-xl"
        >
          <MaterialIcons name="add-photo-alternate" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-medium">Start with Photos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}