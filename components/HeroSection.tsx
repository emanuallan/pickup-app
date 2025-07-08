import { View, Text } from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';
import { COLORS } from '~/theme/colors';
import { AnimatedButton } from './AnimatedButton';

export const HeroSection = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View className="px-6 mb-8">
      <View 
        style={{
          backgroundColor: 'white',
          borderRadius: 24,
          padding: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <View className="mb-6">
          <Text className="text-gray-900 text-2xl font-bold mb-3 leading-tight">
            Your campus marketplace awaits
          </Text>
          <Text className="text-gray-600 text-base leading-relaxed">
            Connect with fellow Longhorns to buy, sell, and discover amazing deals right on campus.
          </Text>
        </View>

        <View className="flex-row gap-4 mb-6">
          <AnimatedButton 
            onPress={() => router.push('/create')}
            hapticType="medium"
            scaleValue={0.95}
            style={{
              backgroundColor: COLORS.utOrange,
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
              shadowColor: COLORS.utOrange,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Plus size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: '700', marginLeft: 8, fontSize: 16 }}>
              Create Listing
            </Text>
          </AnimatedButton>

          <AnimatedButton 
            onPress={() => router.push('/browse')}
            hapticType="light"
            scaleValue={0.97}
            style={{
              borderColor: '#d1d5db',
              borderWidth: 1.5,
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'white',
            }}
          >
            <Search size={18} color="#6b7280" />
            <Text style={{ color: '#374151', fontWeight: '600', marginLeft: 8, fontSize: 16 }}>
              Browse
            </Text>
          </AnimatedButton>
        </View>

        <View className="flex-row items-center justify-center">
          <Text className="text-2xl mr-2">🤘</Text>
          <Text style={{ color: COLORS.utOrange, fontSize: 13, fontWeight: '700' }}>
            Hook &apos;em Horns!
          </Text>
        </View>
      </View>
    </View>
  );
}; 