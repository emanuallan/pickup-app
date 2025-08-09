import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '~/theme/colors';

interface ChatHeaderProps {
  otherUserName: string;
  otherUserImage: string | null;
  listingId: string;
  listingTitle?: string;
  onSettingsPress: () => void;
}

export default function ChatHeader({
  otherUserName,
  otherUserImage,
  listingId,
  listingTitle,
  onSettingsPress
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
      <TouchableOpacity onPress={() => router.back()} className="mr-3">
        <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.utOrange} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="flex-1 flex-row items-center"
        onPress={() => {
          // TODO: Navigate to user profile
        }}
      >
        <View className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center mr-3">
          {otherUserImage ? (
            <Image
              source={{ uri: otherUserImage }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Text className="text-lg font-semibold text-gray-500">
              {otherUserName?.[0]?.toUpperCase()}
            </Text>
          )}
        </View>
        <View>
          <Text className="font-semibold text-base">{otherUserName}</Text>
          {listingId && listingId !== "general" && listingTitle && (
            <Text className="text-gray-500 text-sm" numberOfLines={1}>
              {listingTitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onSettingsPress}
        className="ml-3 p-2"
      >
        <MaterialIcons name="more-vert" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
} 