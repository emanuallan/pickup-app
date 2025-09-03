import * as Haptics from 'expo-haptics';
import { Tabs , usePathname } from 'expo-router';
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react-native';
import { View } from 'react-native';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import TopBar from "~/components/layout/TopBar";
import { COLORS } from '~/theme/colors';
import { useAuth } from '~/contexts/AuthContext';
import { useNotificationSync } from '~/contexts/NotificationSyncContext';
import { useUserNotifications } from '~/contexts/UserNotificationContext';
import { supabase } from '~/lib/supabase';

// Create context for home refresh
const HomeRefreshContext = createContext<{
  triggerRefresh: () => void;
  refreshKey: number;
  refreshMessages: () => Promise<void>;
}>({
  triggerRefresh: () => {},
  refreshKey: 0,
  refreshMessages: async () => {},
});

export const useHomeRefresh = () => useContext(HomeRefreshContext);

function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header for modal screens or specific routes
  if (pathname.startsWith('/(modals)') || pathname.startsWith('/chat/') || pathname.startsWith('/listing/')) {
    return null;
  }

  // Show appropriate header based on current tab
  switch (pathname) {
    case '/browse':
      return (
        <View className="bg-white border-b border-gray-100">
          <TopBar variant="browse" />
        </View>
      );
    case '/profile':
      return (
        <View className="bg-white border-b border-gray-100">
          <TopBar variant="profile" />
        </View>
      );
    case '/messages':
      return (
        <View className="bg-white border-b border-gray-100">
          <TopBar variant="messages" />
        </View>
      );
    case '/create':
      return (
        <View className="bg-white border-b border-gray-100">
          <TopBar variant="create" />
        </View>
      );
    case '/':
    default:
      return null; // Home page will handle its own header
  }
}

export default function TabsLayout() {
  const { user } = useAuth();
  const { unreadCount } = useNotificationSync();
  const { unreadCount: userNotificationCount } = useUserNotifications();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pathname = usePathname();

  const fetchUnreadMessages = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      setUnreadMessageCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  }, [user?.id]);

  // Fetch unread messages count
  useEffect(() => {
    if (user?.email) {
      fetchUnreadMessages();
    }
  }, [user?.email, fetchUnreadMessages]);

  // Real-time updates for message count
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel(`messages_count:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUnreadMessageCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.old.is_read === false && payload.new.is_read === true) {
              setUnreadMessageCount(prev => Math.max(0, prev - 1));
            } else if (payload.old.is_read === true && payload.new.is_read === false) {
              setUnreadMessageCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHomeTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // If already on home page, trigger refresh
    if (pathname === '/') {
      setRefreshTrigger(prev => prev + 1);
      // Trigger refresh through context
      triggerRefresh();
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <HomeRefreshContext.Provider value={{ triggerRefresh, refreshKey: refreshTrigger, refreshMessages: fetchUnreadMessages }}>
      <View className="flex-1">
        <ConditionalHeader />
        <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e5e7eb',
            borderTopWidth: 1,
            height: 76,
            paddingBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarActiveTintColor: COLORS.utOrange,
          tabBarInactiveTintColor: COLORS.light.grey,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 1,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.2} />,
            tabBarActiveBackgroundColor: 'rgba(191, 87, 0, 0.05)',
          }}
          listeners={{
            tabPress: handleHomeTabPress,
          }}
        />
        <Tabs.Screen
          name="browse"
          options={{
            title: 'Browse',
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} strokeWidth={1.2} />,
            tabBarActiveBackgroundColor: 'rgba(191, 87, 0, 0.05)',
          }}
          listeners={{
            tabPress: handleTabPress,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Sell',
            tabBarIcon: ({ color, size }) => <Plus size={size} color={color} strokeWidth={1.2} />,
            tabBarActiveBackgroundColor: 'rgba(191, 87, 0, 0.05)',
          }}
          listeners={{
            tabPress: handleTabPress,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} strokeWidth={1.2} />,
            tabBarActiveBackgroundColor: 'rgba(191, 87, 0, 0.05)',
            tabBarBadge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: COLORS.utOrange,
              color: 'white',
            },
          }}
          listeners={{
            tabPress: handleTabPress,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.2} />,
            tabBarActiveBackgroundColor: 'rgba(191, 87, 0, 0.05)',
          }}
          listeners={{
            tabPress: handleTabPress,
          }}
        />
      </Tabs>
      </View>
    </HomeRefreshContext.Provider>
  );
} 