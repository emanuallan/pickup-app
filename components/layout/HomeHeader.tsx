import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Edit3 } from 'lucide-react-native';
import { useAuth } from '~/contexts/AuthContext';
import { COLORS } from '~/theme/colors';
import TopBar from './TopBar';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSettings } from '~/contexts/SettingsContext';

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, onPress }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
}) => {
  const { hapticFeedbackEnabled } = useSettings();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(0.8, { damping: 15, stiffness: 400 });
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Reanimated.View style={[{ flex: 1 }, animatedStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        className="bg-white rounded-lg p-4 border border-gray-200 flex-1"
        activeOpacity={1}
        style={{
          shadowColor: '#BF5700',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mb-3">
          {icon}
        </View>
        <Text className="text-gray-900 font-bold text-base mb-1">{title}</Text>
        <Text className="text-gray-500 text-sm font-medium">{description}</Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

function HomeHeader() {
  const router = useRouter();
  const { user } = useAuth();

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUsername = () => {
    if (!user?.email) return 'there';
    return user.email.split('@')[0];
  };

  return (
    <View className="bg-white">
      {/* Top Bar */}
      <TopBar />
      
      {/* Home Content */}
      <View className="px-6 pb-6 pt-4">
        {/* Greeting */}
        <View className="mb-6">
          <Text className="text-3xl font-black text-gray-900 mb-1">
            {getTimeOfDayGreeting()}, {getUsername()}! 👋
          </Text>
          <Text className="text-lg text-gray-600 font-medium">
            Ready to find something great?
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3">
          <QuickActionCard 
            title="Sell Item"
            description="List something"
            icon={<Plus size={18} color="#BF5700" />}
            onPress={() => router.push('/create')}
          />
          <QuickActionCard 
            title="Browse All"
            description="Find deals"
            icon={<Edit3 size={18} color="#BF5700" />}
            onPress={() => router.push('/browse')}
          />
        </View>
      </View>
    </View>
  );
}

export default memo(HomeHeader);