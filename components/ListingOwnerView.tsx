import { View, Text, ScrollView, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '~/theme/colors';
import { MapPin, Calendar, Tag, Edit3, Trash2, Eye, CheckCircle } from 'lucide-react-native';
import { AnimatedButton } from './AnimatedButton';
import { supabase } from '~/lib/supabase';
import { useState } from 'react';

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

interface ListingOwnerViewProps {
  listing: Listing;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  scrollViewRef: React.RefObject<ScrollView | null>;
  formatTimeAgo: (dateString: string) => string;
  handleImageScroll: (direction: 'left' | 'right') => void;
  onListingUpdated: () => void;
}

export const ListingOwnerView: React.FC<ListingOwnerViewProps> = ({
  listing,
  selectedImageIndex,
  setSelectedImageIndex,
  scrollViewRef,
  formatTimeAgo,
  handleImageScroll,
  onListingUpdated
}) => {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const handleMarkAsSold = async () => {
    Alert.alert(
      listing.is_sold ? 'Mark as Available' : 'Mark as Sold',
      listing.is_sold 
        ? 'Are you sure you want to mark this item as available for sale again?'
        : 'Are you sure you want to mark this item as sold?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: listing.is_sold ? 'Mark Available' : 'Mark Sold',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const { error } = await supabase
                .from('listings')
                .update({ is_sold: !listing.is_sold })
                .eq('id', listing.id);

              if (error) throw error;
              onListingUpdated();
            } catch (error) {
              console.error('Error updating listing:', error);
              Alert.alert('Error', 'Failed to update listing status');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteListing = async () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listing.id);

              if (error) throw error;
              router.back();
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Error', 'Failed to delete listing');
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleEditListing = () => {
    // Navigate to edit screen - you'll need to implement this
    Alert.alert('Edit Listing', 'Edit functionality coming soon!');
  };

  const handleViewAsPublic = () => {
    Alert.alert('Public View', 'This is how buyers see your listing');
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Owner Status Banner */}
      <View className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <Text className="text-blue-800 font-semibold text-center">
          📝 You are viewing your own listing
        </Text>
      </View>

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

        {/* Status Indicators */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          <View className={`px-3 py-1 rounded-full ${listing.is_sold ? 'bg-red-100' : 'bg-green-100'}`}>
            <Text className={`font-semibold text-sm ${listing.is_sold ? 'text-red-800' : 'text-green-800'}`}>
              {listing.is_sold ? '❌ Sold' : '✅ Available'}
            </Text>
          </View>
          {listing.is_draft && (
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-gray-800 font-semibold text-sm">📝 Draft</Text>
            </View>
          )}
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

        {/* Owner Actions Section */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Manage Your Listing</Text>
          
          {/* Quick Stats */}
          <View className="flex-row justify-between mb-4 p-3 bg-white rounded-lg">
            <View className="items-center">
              <Eye size={20} color={COLORS.utOrange} />
              <Text className="text-sm text-gray-600 mt-1">Views</Text>
              <Text className="font-bold text-gray-900">--</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg">💬</Text>
              <Text className="text-sm text-gray-600 mt-1">Messages</Text>
              <Text className="font-bold text-gray-900">--</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg">❤️</Text>
              <Text className="text-sm text-gray-600 mt-1">Favorites</Text>
              <Text className="font-bold text-gray-900">--</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Owner Action Buttons */}
      <View className="p-4 space-y-3">
        {/* Edit Button */}
        <AnimatedButton
          onPress={handleEditListing}
          hapticType="light"
          scaleValue={0.97}
          style={{
            backgroundColor: COLORS.utOrange,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            borderRadius: 12,
          }}
        >
          <Edit3 size={18} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Edit Listing</Text>
        </AnimatedButton>

        {/* Secondary Actions */}
        <View className="flex-row gap-3">
          <AnimatedButton
            onPress={handleMarkAsSold}
            hapticType="medium"
            scaleValue={0.97}
            disabled={updating}
            style={{
              backgroundColor: listing.is_sold ? '#10b981' : '#ef4444',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              borderRadius: 10,
              flex: 1,
              opacity: updating ? 0.7 : 1,
            }}
          >
            <CheckCircle size={16} color="white" />
            <Text className="text-white font-semibold ml-2">
              {listing.is_sold ? 'Mark Available' : 'Mark Sold'}
            </Text>
          </AnimatedButton>

          <AnimatedButton
            onPress={handleDeleteListing}
            hapticType="heavy"
            scaleValue={0.95}
            disabled={updating}
            style={{
              backgroundColor: '#dc2626',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              borderRadius: 10,
              flex: 1,
              opacity: updating ? 0.7 : 1,
            }}
          >
            <Trash2 size={16} color="white" />
            <Text className="text-white font-semibold ml-2">Delete</Text>
          </AnimatedButton>
        </View>

        {/* View as Public */}
        <AnimatedButton
          onPress={handleViewAsPublic}
          hapticType="light"
          scaleValue={0.98}
          style={{
            borderColor: COLORS.utOrange,
            borderWidth: 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: 'white',
          }}
        >
          <Eye size={16} color={COLORS.utOrange} />
          <Text style={{ color: COLORS.utOrange, fontWeight: '600', marginLeft: 8 }}>
            View as Buyer
          </Text>
        </AnimatedButton>
      </View>
    </ScrollView>
  );
}; 