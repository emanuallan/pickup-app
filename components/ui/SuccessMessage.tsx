import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

interface SuccessMessageProps {
  visible: boolean;
  message: string;
  onHide?: () => void;
  duration?: number;
}

export default function SuccessMessage({ 
  visible, 
  message, 
  onHide,
  duration = 2500 
}: SuccessMessageProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // Reset animation values
      opacity.setValue(0);
      scale.setValue(0.5);
      
      // Enhanced entrance animation with bounce effect
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 8,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 8,
        }),
      ]).start();
      
      // Hide after specified duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHide) {
            onHide();
          }
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 1000,
        opacity: opacity,
        transform: [{ scale: scale }],
      }}
    >
      <View 
        className="bg-green-500 rounded-xl px-4 py-3 flex-row items-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <CheckCircle size={20} color="white" strokeWidth={2} />
        <Text className="text-white font-semibold text-base ml-3">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}