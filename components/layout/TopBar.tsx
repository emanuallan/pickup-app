import { memo, useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { MessageCircle, Bell, Search, Settings, ChevronLeft, Plus } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Icon from '~/assets/ios-light.png';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/contexts/AuthContext';
import { useNotificationSync } from '~/contexts/NotificationSyncContext';
import { COLORS } from '~/theme/colors';

// Home Top Bar (logo and notifications)
const HomeTopBar = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useNotificationSync();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch unread message count and set up real-time updates
  useEffect(() => {
    if (user?.email) {
      fetchUnreadMessageCount();
      
      // Set up real-time subscription for messages
      const subscription = supabase
        .channel(`topbar_messages:${user.email}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id=eq.${user.email}`
          }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setUnreadMessageCount(prev => prev + 1);
            } else if (payload.eventType === 'UPDATE') {
              if (payload.old.read === false && payload.new.read === true) {
                setUnreadMessageCount(prev => Math.max(0, prev - 1));
              } else if (payload.old.read === true && payload.new.read === false) {
                setUnreadMessageCount(prev => prev + 1);
              }
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.email]);

  const fetchUnreadMessageCount = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.email)
        .eq('read', false);
      
      if (error) throw error;
      setUnreadMessageCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

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
          onPress={() => handlePress(() => router.push('/notifications'))} 
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

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-xl font-bold text-gray-900">My Profile</Text>
      
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(modals)/settings');
        }}
      >
        <Settings size={24} color="#374151" />
      </TouchableOpacity>
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