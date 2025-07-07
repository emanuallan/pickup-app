import { View, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, MessageCircle, User, Plus } from "lucide-react-native";
import { COLORS } from "~/theme/colors";
import * as Haptics from 'expo-haptics';
import { useRef, useEffect } from "react";

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
  const tabAnimations = useRef(tabRoutes.map(() => new Animated.Value(1))).current;
  
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
                }}
              >
                <Icon 
                  size={24} 
                  color={isFocused ? COLORS.utOrange : COLORS.light.grey} 
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}