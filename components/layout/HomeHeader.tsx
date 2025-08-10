import { memo } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import TopBar from './TopBar';

function HomeHeader() {
  const { user } = useAuth();

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const getTimeOfDayEmoji = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) return '☀️'; // Sun for daytime (6 AM - 6 PM)
    return '🌙'; // Moon for nighttime (6 PM - 6 AM)
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
      <View className="px-6 pb-4 pt-4">
        {/* Greeting */}
        <View>
          <Text className="text-3xl font-black text-gray-900 mb-1">
            {getTimeOfDayGreeting()}, {getUsername()}! {getTimeOfDayEmoji()}
          </Text>
          <Text className="text-lg text-gray-600 font-medium">
            Ready to find something great?
          </Text>
        </View>
      </View>
    </View>
  );
}

export default memo(HomeHeader);