import { memo, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { Sun, Moon } from 'lucide-react-native';
import { supabase } from '~/lib/supabase';
import TopBar from './TopBar';

function HomeHeader() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('there');

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user?.id) return;
      
      try {
        const { data: userData } = await supabase
          .from('user_settings')
          .select('display_name')
          .eq('email', user.email)
          .single();
        
        if (userData?.display_name) {
          setDisplayName(userData.display_name);
        } else if (user.email) {
          setDisplayName(user.email.split('@')[0]);
        }
      } catch (error) {
        // Fallback to email username if query fails
        if (user.email) {
          setDisplayName(user.email.split('@')[0]);
        }
      }
    };

    fetchDisplayName();
  }, [user]);

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const getTimeOfDayIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return <Sun size={24} color="#F59E0B" />; // Sun for daytime (6 AM - 6 PM)
    }
    return <Moon size={24} color="#6366F1" />; // Moon for nighttime (6 PM - 6 AM)
  };

  return (
    <View className="bg-white">
      {/* Top Bar */}
      <TopBar />
      
      {/* Home Content */}
      <View className="px-6 pb-4 pt-4">
        {/* Greeting */}
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-3xl font-black text-gray-900 mb-1">
              {getTimeOfDayGreeting()}, {displayName}!
            </Text>
            <Text className="text-lg text-gray-600 font-medium">
              Ready to find something great?
            </Text>
          </View>
          <View className="ml-4">
            {getTimeOfDayIcon()}
          </View>
        </View>
      </View>
    </View>
  );
}

export default memo(HomeHeader);