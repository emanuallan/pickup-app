import { memo } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { MessageCircle, Bell, Search, Settings, ChevronLeft, Plus } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Icon from '~/assets/ios-light.png';
import { useAuth } from '~/contexts/AuthContext';
import { useNotificationSync } from '~/contexts/NotificationSyncContext';
import { useMessageCount } from '~/contexts/MessageCountContext';
import { COLORS } from '~/theme/colors';

// Home Top Bar (logo and notifications)
const HomeTopBar = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useNotificationSync();
  const { unreadMessageCount } = useMessageCount();

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <TouchableOpacity onPress={() => handlePress(() => router.push('/'))}>
        <Image source={Icon} className="w-12 h-12 rounded-xl" />
      </TouchableOpacity>

      <View className="flex-row items-center gap-5">
        <TouchableOpacity 
          onPress={() => handlePress(() => router.push('/browse'))} 
          className="p-1"
        >
          <Search size={24} color="#374151" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handlePress(() => router.push('/messages'))} 
          className="p-1 relative"
        >
          <MessageCircle size={24} color="#374151" />
          {unreadMessageCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handlePress(() => router.push('/user-notifications'))} 
          className="p-1 relative"
        >
          <Bell size={24} color="#374151" />
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Simple Back Top Bar
const BackTopBar = ({ title }: { title?: string }) => {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <TouchableOpacity 
        className="flex-row items-center"
        onPress={handleBack}
      >
        <ChevronLeft size={24} color={COLORS.utOrange} />
        <Text className="font-semibold text-lg ml-1" style={{ color: COLORS.utOrange }}>
          Back
        </Text>
      </TouchableOpacity>
      
      {title && (
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
      )}
      
      <View style={{ width: 80 }} /> {/* Spacer for centering */}
    </View>
  );
};

// Browse Top Bar
const BrowseTopBar = () => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-xl font-bold text-gray-900">Browse Marketplace</Text>
      
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/create');
        }}
        className="p-2 bg-orange-50 rounded-full"
      >
        <Plus size={20} color={COLORS.utOrange} />
      </TouchableOpacity>
    </View>
  );
};

// Profile Top Bar
const ProfileTopBar = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-xl font-bold text-gray-900">My Profile</Text>
      
      {user && (
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(modals)/settings');
          }}
        >
          <Settings size={24} color="#374151" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Messages Top Bar
const MessagesTopBar = () => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-xl font-bold text-gray-900">Messages</Text>
    </View>
  );
};

// Create Top Bar
const CreateTopBar = () => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-xl font-bold text-gray-900">Sell Item</Text>
    </View>
  );
};

interface TopBarProps {
  variant?: 'home' | 'back' | 'browse' | 'profile' | 'messages' | 'create';
  title?: string;
}

function TopBar({ variant = 'home', title }: TopBarProps) {
  switch (variant) {
    case 'home':
      return <HomeTopBar />;
    case 'back':
      return <BackTopBar title={title} />;
    case 'browse':
      return <BrowseTopBar />;
    case 'profile':
      return <ProfileTopBar />;
    case 'messages':
      return <MessagesTopBar />;
    case 'create':
      return <CreateTopBar />;
    default:
      return <HomeTopBar />;
  }
}

export default memo(TopBar);