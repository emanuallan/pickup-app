import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '~/theme/colors';

export default function CreateScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1  px-4" edges={['top']}>
        <View className="items-center mb-8">
          <MaterialIcons name="add-box" size={64} color={COLORS.utOrange} />
          <Text className="text-2xl font-semibold mt-4">Create a Listing</Text>
          <Text className="text-gray-500 text-center mt-2">
            Add photos and details about what you&apos;re selling
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/create/photos')}
          className="w-full flex-row items-center justify-center py-3.5 rounded-xl"
          style={{ backgroundColor: COLORS.utOrange }}
        >
          <MaterialIcons name="add-photo-alternate" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text className="text-white font-medium">Start with Photos</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}