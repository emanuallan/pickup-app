import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react-native';
import { View } from 'react-native';
import { useEffect, useState } from 'react';
import TopBar from "~/components/TopBar";
import { COLORS } from '~/theme/colors';
import { useAuth } from '~/contexts/AuthContext';
import { useNotificationSync } from '~/contexts/NotificationSyncContext';
import { supabase } from '~/lib/supabase';
import { usePathname } from 'expo-router';

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
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    if (user?.email) {
      fetchUnreadMessages();
    }
  }, [user?.email]);

  // Real-time updates for message count
  useEffect(() => {
    if (!user?.email) return;

    const subscription = supabase
      .channel(`messages_count:${user.email}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.email}`,
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
  }, [user?.email]);

  const fetchUnreadMessages = async () => {
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
      console.error('Error fetching unread messages:', error);
    }
  };

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
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
            tabPress: handleTabPress,
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
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: COLORS.utOrange,
              color: 'white',
            },
          }}
          listeners={{
            tabPress: handleTabPress,
          }}
        />
      </Tabs>
    </View>
  );
} 