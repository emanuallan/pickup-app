import { TouchableOpacity, Animated } from 'react-native';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style: any;
  hapticType?: 'light' | 'medium' | 'heavy';
  scaleValue?: number;
  [key: string]: any;
}

export const AnimatedButton = ({ 
  onPress, 
  children, 
  style, 
  hapticType = 'light',
  scaleValue = 0.96,
  ...props 
}: AnimatedButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    // Haptic feedback
    if (hapticType === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (hapticType === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hapticType === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    // Additional success haptic for navigation
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}; 