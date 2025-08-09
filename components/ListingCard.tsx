import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '~/theme/colors';
import { MapPin } from 'lucide-react-native';
import { useSettings } from '~/contexts/SettingsContext';

interface ListingCardProps {
  id: number;
  title: string;
  price: number;
  location: string;
  category: string;
  timePosted: string;
  images: string[];
  user: {
    name: string;
    image?: string | null;
  };
  condition: string;
  onPress: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  title,
  price,
  location,
  category,
  timePosted,
  images,
  onPress,
}) => {
  const { locationEnabled } = useSettings();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg border border-gray-200"
      activeOpacity={0.7}
      style={{
        shadowColor: '#BF5700',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Image */}
      <View className="aspect-square bg-gray-100 rounded-t-lg">
        {images && images.length > 0 ? (
          <Image
            source={{ uri: images[0] }}
            className="w-full h-full rounded-t-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center rounded-t-lg">
            <Text className="text-gray-400">No Image</Text>
          </View>
        )}
        <View className="absolute bottom-2 right-2 bg-black/60 rounded-full px-2 py-1">
          <Text className="text-white text-xs font-medium">{timePosted}</Text>
        </View>
      </View>

      {/* Details */}
      <View className="p-3">
        <Text style={{ color: COLORS.utOrange, fontWeight: '800', fontSize: 16 }} numberOfLines={1}>
          ${price}
        </Text>
        <Text className="text-base text-gray-900 font-semibold mt-1" numberOfLines={2}>
          {title}
        </Text>
        
        {/* Category Badge */}
        <View className="mt-2">
          <View className="bg-orange-50 self-start rounded-full px-2 py-1 border border-orange-100">
            <Text className="text-orange-700 text-xs font-semibold">
              {category}
            </Text>
          </View>
        </View>
        
        {locationEnabled && (
          <View className="flex-row items-center mt-2">
            <MapPin size={12} color="#9ca3af" />
            <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
              {location}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ListingCard; 