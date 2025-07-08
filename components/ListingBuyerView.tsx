import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '~/theme/colors';
import { MapPin, Calendar, Tag, MessageCircle, Heart, Share2, Star } from 'lucide-react-native';
import { AnimatedButton } from './AnimatedButton';

const { width: screenWidth } = Dimensions.get('window');

interface Listing {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  category: string;
  condition: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_image: string | null;
  is_sold: boolean;
  is_draft: boolean;
}

interface UserSettings {
  email: string;
  display_name: string | null;
  profile_image_url: string | null;
  bio: string | null;
}

interface ListingBuyerViewProps {
  listing: Listing;
  userSettings: UserSettings | null;
  userListingCount: number;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
  formatTimeAgo: (dateString: string) => string;
  handleImageScroll: (direction: 'left' | 'right') => void;
  onMessageSeller: () => void;
}

export const ListingBuyerView: React.FC<ListingBuyerViewProps> = ({
  listing,
  userSettings,
  userListingCount,
  selectedImageIndex,
  setSelectedImageIndex,
  scrollViewRef,
  formatTimeAgo,
  handleImageScroll,
  onMessageSeller
}) => {
  const router = useRouter();
  const displayName = userSettings?.display_name || listing.user_name || listing.user_id;
  const profileImage = userSettings?.profile_image_url || listing.user_image;

  const handleSaveListing = () => {
    // TODO: Implement save/favorite functionality
    console.log('Save listing');
  };

  const handleShareListing = () => {
    // TODO: Implement share functionality
    console.log('Share listing');
  };

  const handleViewSellerProfile = () => {
    // TODO: Navigate to seller profile
    router.push({
      pathname: '/profile/[userId]',
      params: { userId: listing.user_id }
    });
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Images */}
      <View className="relative">
        {listing.images && listing.images.length > 0 ? (
          <>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.floor(e.nativeEvent.contentOffset.x / screenWidth);
                setSelectedImageIndex(index);
              }}
            >
              {listing.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{ width: screenWidth, height: 300 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {listing.images.length > 1 && (
              <>
                {/* Image navigation buttons */}
                {selectedImageIndex > 0 && (
                  <TouchableOpacity
                    onPress={() => handleImageScroll('left')}
                    className="absolute left-4 top-1/2 bg-black/50 rounded-full p-2"
                    style={{ transform: [{ translateY: -20 }] }}
                  >
                    <Text className="text-white text-lg">‹</Text>
                  </TouchableOpacity>
                )}
                
                {selectedImageIndex < listing.images.length - 1 && (
                  <TouchableOpacity
                    onPress={() => handleImageScroll('right')}
                    className="absolute right-4 top-1/2 bg-black/50 rounded-full p-2"
                    style={{ transform: [{ translateY: -20 }] }}
                  >
                    <Text className="text-white text-lg">›</Text>
                  </TouchableOpacity>
                )}
                
                {/* Image indicators */}
                <View className="absolute bottom-4 left-1/2 flex-row" style={{ transform: [{ translateX: -((listing.images.length * 12) / 2) }] }}>
                  {listing.images.map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full mx-1 ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <View className="w-full h-80 bg-gray-100 items-center justify-center">
            <Text className="text-gray-400 text-lg">No Image</Text>
          </View>
        )}
        
        {listing.is_sold && (
          <View className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full">
            <Text className="text-white font-bold text-sm">SOLD</Text>
          </View>
        )}

        {/* Quick Actions Overlay */}
        <View className="absolute top-4 right-4 flex-row gap-2">
          <TouchableOpacity
            onPress={handleSaveListing}
            className="bg-white/80 backdrop-blur-sm rounded-full p-2"
          >
            <Heart size={20} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShareListing}
            className="bg-white/80 backdrop-blur-sm rounded-full p-2"
          >
            <Share2 size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Listing Details */}
      <View className="p-6">
        {/* Title and Price */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</Text>
          <Text className="text-3xl font-bold" style={{ color: COLORS.utOrange }}>
            ${listing.price}
          </Text>
        </View>

        {/* Meta Information */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-row items-center">
            <MapPin size={16} color={COLORS.utOrange} />
            <Text className="text-gray-600 ml-2">{listing.location}</Text>
          </View>
          <View className="flex-row items-center">
            <Calendar size={16} color={COLORS.utOrange} />
            <Text className="text-gray-600 ml-2">{formatTimeAgo(listing.created_at)}</Text>
          </View>
          <View className="flex-row items-center">
            <Tag size={16} color={COLORS.utOrange} />
            <Text className="text-gray-600 ml-2">{listing.category}</Text>
          </View>
        </View>

        {/* Condition */}
        <View className="mb-6">
          <View className="self-start px-3 py-1 rounded-full" style={{ backgroundColor: '#fef3c7' }}>
            <Text style={{ color: '#92400e', fontWeight: '600' }}>
              Condition: {listing.condition}
            </Text>
          </View>
        </View>

        {/* Description */}
        {listing.description && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Description</Text>
            <Text className="text-gray-700 leading-relaxed">{listing.description}</Text>
          </View>
        )}

        {/* Seller Information */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Seller Information</Text>
          <TouchableOpacity onPress={handleViewSellerProfile}>
            <View className="flex-row items-center">
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
                  <Text className="text-gray-600 font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="font-semibold text-gray-900">{displayName}</Text>
                  <View className="flex-row items-center ml-2">
                    <Star size={14} color="#fbbf24" />
                    <Text className="text-sm text-gray-600 ml-1">4.8</Text>
                  </View>
                </View>
                <Text className="text-gray-500">{userListingCount} active listings</Text>
                {userSettings?.bio && (
                  <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                    {userSettings.bio}
                  </Text>
                )}
              </View>
              <View className="items-center justify-center bg-gray-200 rounded-full p-2">
                <Text className="text-xs text-gray-600">View Profile</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Safety Tips */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Text className="font-semibold text-blue-800 mb-2">🛡️ Safety Tips</Text>
          <Text className="text-blue-700 text-sm leading-relaxed">
            • Meet in public places on campus{'\n'}
            • Inspect items before purchasing{'\n'}
            • Use safe payment methods{'\n'}
            • Trust your instincts
          </Text>
        </View>
      </View>

      {/* Contact Actions */}
      {!listing.is_sold && (
        <View className="p-4 gap-3">
          {/* Primary Action - Message Seller */}
          <AnimatedButton
            onPress={onMessageSeller}
            hapticType="medium"
            scaleValue={0.97}
            style={{
              backgroundColor: COLORS.utOrange,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              borderRadius: 12,
            }}
          >
            <MessageCircle size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Message Seller</Text>
          </AnimatedButton>

          {/* Secondary Actions */}
          <View className="flex-row gap-3">
            <AnimatedButton
              onPress={handleSaveListing}
              hapticType="light"
              scaleValue={0.95}
              style={{
                borderColor: '#e5e7eb',
                borderWidth: 2,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: 'white',
                flex: 1,
              }}
            >
              <Heart size={16} color="#ef4444" />
              <Text className="text-gray-700 font-semibold ml-2">Save</Text>
            </AnimatedButton>

            <AnimatedButton
              onPress={handleShareListing}
              hapticType="light"
              scaleValue={0.95}
              style={{
                borderColor: '#e5e7eb',
                borderWidth: 2,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: 'white',
                flex: 1,
              }}
            >
              <Share2 size={16} color="#6b7280" />
              <Text className="text-gray-700 font-semibold ml-2">Share</Text>
            </AnimatedButton>
          </View>
        </View>
      )}

      {/* Sold Items Message */}
      {listing.is_sold && (
        <View className="p-4">
          <View className="bg-red-50 border border-red-200 rounded-xl p-4">
            <Text className="text-red-800 font-semibold text-center">
              ❌ This item has been sold
            </Text>
            <Text className="text-red-600 text-sm text-center mt-1">
              Check out other listings from this seller
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}; 