import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '~/theme/colors';
import { AnimatedButton } from './AnimatedButton';

interface Item {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
}

interface RecentListingsSectionProps {
  recentListings: Item[];
  recentLoading: boolean;
}

export const RecentListingsSection = ({ recentListings, recentLoading }: RecentListingsSectionProps) => {
  const router = useRouter();

  const renderListingItem = ({ item }: { item: Item }) => (
    <AnimatedButton 
      onPress={() => router.push(`/listing/${item.id}`)}
      hapticType="light"
      scaleValue={0.96}
      style={{ marginRight: 16, width: 160 }}
    >
      <View 
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: 120 }}
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="font-semibold text-gray-900 text-sm mb-2" numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={{ color: COLORS.utOrange, fontWeight: 'bold', fontSize: 16 }}>
            ${item.price}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">{item.location}</Text>
        </View>
      </View>
    </AnimatedButton>
  );

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center px-6 mb-5">
        <Text className="text-xl font-bold text-gray-900">Recent Listings</Text>
        <TouchableOpacity 
          onPress={() => router.push('/browse')}
          className="flex-row items-center"
        >
          <Text style={{ color: COLORS.utOrange, fontWeight: '600', fontSize: 15 }}>See All</Text>
          <ArrowRight size={16} color={COLORS.utOrange} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
      
      {recentLoading ? (
        <View className="py-12">
          <ActivityIndicator size="large" color={COLORS.utOrange} />
        </View>
      ) : recentListings.length > 0 ? (
        <FlatList
          data={recentListings}
          renderItem={renderListingItem}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
        />
      ) : (
        <View className="px-6">
          <Text className="text-gray-500 text-center py-12">No recent listings found.</Text>
        </View>
      )}
    </View>
  );
}; 