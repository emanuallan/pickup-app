import { View, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, MessageCircle, User, Plus } from "lucide-react-native";
import { COLORS } from "~/theme/colors";
import * as Haptics from 'expo-haptics';
import { useRef, useEffect, useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";

const tabRoutes = [
  { name: "index", icon: Home },
  { name: "browse", icon: Search },
  { name: "create", icon: Plus },
  { name: "messages", icon: MessageCircle },
  { name: "profile", icon: User },
] as const;

export default function TabBar({
  state,
  navigation,
}: {
  state: any;
  navigation: any;
}) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const tabAnimations = useRef(tabRoutes.map(() => new Animated.Value(1))).current;
  
  // TODO: Implement actual unread message count fetching
  // For now, this is a placeholder - you would implement this when you have a messages system
  useEffect(() => {
    if (user?.email) {
      // Placeholder for unread message count
      // This would be replaced with actual message count fetching
      setUnreadMessageCount(0);
    }
  }, [user?.email]);
  
  return (
    <View 
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200"
      style={{ 
        paddingBottom: insets.bottom,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <View className="flex-row justify-around items-center h-16">
        {tabRoutes.map((tab, index) => {
          const isFocused = state.routes[state.index].name === tab.name;
          const Icon = tab.icon;
          const scaleAnim = tabAnimations[index];

          const handlePress = () => {
            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            // Scale animation
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();

            navigation.navigate(tab.name);
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={handlePress}
              className="flex-1 items-center justify-center"
              activeOpacity={0.8}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }],
                  backgroundColor: isFocused ? COLORS.iconBg : 'transparent',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  position: 'relative',
                }}
              >
                <Icon 
                  size={24} 
                  color={isFocused ? COLORS.utOrange : COLORS.light.grey} 
                  strokeWidth={isFocused ? 2.5 : 2}
                />
                {/* Unread message indicator */}
                {tab.name === 'messages' && unreadMessageCount > 0 && (
                  <View 
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#ef4444',
                    }}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}