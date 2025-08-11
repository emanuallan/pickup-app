import { View, Text } from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AnimatedButton } from '~/components/ui/AnimatedButton';

export const HomeSearchBar = () => {
  const router = useRouter();

  return (
    <View className="px-6 pt-4 pb-2">
      <AnimatedButton 
        onPress={() => router.push('/browse')}
        hapticType="light"
        scaleValue={0.98}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <Search size={22} color="#9ca3af" />
        <Text className="ml-4 text-gray-500 text-base flex-1">What are you looking for?</Text>
      </AnimatedButton>
    </View>
  );
}; 