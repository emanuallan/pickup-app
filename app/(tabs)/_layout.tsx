import * as Haptics from 'expo-haptics';
import { Tabs , usePathname } from 'expo-router';
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react-native';
import { View } from 'react-native';
import { useState, createContext, useContext } from 'react';
import TopBar from "~/components/layout/TopBar";
import { COLORS } from '~/theme/colors';
import { useMessageCount } from '~/contexts/MessageCountContext';

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
  const { unreadMessageCount, refreshMessageCount } = useMessageCount();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pathname = usePathname();

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
    <HomeRefreshContext.Provider value={{ triggerRefresh, refreshKey: refreshTrigger, refreshMessages: refreshMessageCount }}>
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