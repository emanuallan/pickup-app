import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Eye } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';

interface ChatHeaderProps {
  otherUserName: string;
  otherUserImage: string | null;
  otherUserId: string;
  listingId: string;
  listingTitle?: string;
  listingImageUrl?: string | null;
  listingIsSold?: boolean;
  onSettingsPress: () => void;
}

export default function ChatHeader({
  otherUserName,
  otherUserImage,
  otherUserId,
  listingId,
  listingTitle,
  listingImageUrl,
  listingIsSold,
  onSettingsPress
}: ChatHeaderProps) {
  const router = useRouter();

  // Determine which image to show: listing image for listing chats, user image for general chats
  const displayImage = (listingId && listingId !== 'general' && listingImageUrl) ? listingImageUrl : otherUserImage;

  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
      <TouchableOpacity onPress={() => router.back()} className="mr-3">
        <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.utOrange} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="flex-1 flex-row items-center"
        onPress={() => {
          router.push({
            pathname: '/profile/[userId]',
            params: { userId: otherUserId }
          });
        }}
      >
        <View className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center mr-3 relative">
          {displayImage ? (
            <Image
              source={{ uri: displayImage }}
              className="w-10 h-10 rounded-full"
              style={{ opacity: (listingId !== 'general' && listingIsSold) ? 0.4 : 1 }}
            />
          ) : (
            <Text className="text-lg font-semibold text-gray-500">
              {otherUserName?.[0]?.toUpperCase()}
            </Text>
          )}
          
          {/* SOLD overlay for listing images in chat header */}
          {listingId !== 'general' && listingIsSold && listingImageUrl && (
            <View className="absolute top-[-4px] left-[-4px]">
              <View className="bg-red-500 px-2 py-0.5 rounded-full shadow-sm">
                <Text className="text-white text-[8px] font-bold" numberOfLines={1}>
                  SOLD
                </Text>
              </View>
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-base">{otherUserName}</Text>
          {listingId && listingId !== "general" && listingTitle && (
            <Text className="text-gray-500 text-sm" numberOfLines={1}>
              {listingTitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* View Listing Button - only show for listing-specific chats */}
      {listingId && listingId !== 'general' && (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/listing/[id]',
              params: { id: listingId }
            });
          }}
          className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-full mr-2"
          style={{ borderColor: COLORS.utOrange, borderWidth: 1 }}
        >
          <Eye size={14} color={COLORS.utOrange} />
          <Text className="text-xs font-semibold ml-1" style={{ color: COLORS.utOrange }}>
            View Listing
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        onPress={onSettingsPress}
        className="ml-3 p-2"
      >
        <MaterialIcons name="more-vert" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
} 