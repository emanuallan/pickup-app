import { memo, useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { MessageCircle, Search, Bell, Settings } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import Logo from '../assets/utmplogo.png';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/contexts/AuthContext';

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch unread notification and message counts
  useEffect(() => {
    if (user?.email) {
      fetchUnreadCount();
      fetchUnreadMessageCount();
      
      // Set up real-time subscription for notifications
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.email}`
          }, 
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.email]);

  const fetchUnreadCount = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_id: user.email
      });

      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchUnreadMessageCount = async () => {
    if (!user?.email) return;

    try {
      // TODO: Implement when messages system is ready
      // For now, placeholder - would count unread messages
      setUnreadMessageCount(0);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const renderLeftSide = () => {
    if (pathname === '/profile') {
      return (
        <View className="flex-row items-center">
          <Text className="text-xl font-bold">My Profile</Text>
        </View>
      );
    }

    return (
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.push('/')}>
          <Image source={Logo} className="w-14 h-14" />
        </TouchableOpacity>
      </View>
    );
  };

  const getHeaderIcons = () => {
    switch (pathname) {
      case '/':
        return (
          <>
            <TouchableOpacity onPress={() => router.push('/browse')} className="p-1">
              <Search size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/messages')} className="p-1 relative">
              <MessageCircle size={24} color="black" strokeWidth={1.5} />
              {unreadMessageCount > 0 && (
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')} className="p-1 relative">
              <Bell size={24} color="black" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        );
      
      case '/profile':
        return (
          <>
            <TouchableOpacity onPress={() => router.push('/messages')}>
              <MessageCircle size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(modals)/settings')}>
              <Settings size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  // Don't show header on modal screens
  if (pathname.startsWith('/(modals)')) {
    return null;
  }

  return (
    <View className="border-b border-gray-100 bg-white">
      <View className="flex-row items-center justify-between px-4 h-12">
        {renderLeftSide()}
        <View className="flex-row items-center gap-5">
          {getHeaderIcons()}
        </View>
      </View>
    </View>
  );
}
// Memoize the header to prevent unnecessary re-renders
export default memo(Header);
