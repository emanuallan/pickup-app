import { View, Text, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { Flame } from 'lucide-react-native';

export const LiveTicker = () => {
  const [messages] = useState([
    "🔥 50+ new listings this week",
    "🎉 Join 500+ Longhorn students", 
    "👀 Amazing deals happening now",
    "⭐ Trusted by your fellow Horns",
  ]);
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        setIndex(i => (i + 1) % messages.length);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, [messages.length, fadeAnim]);

  return (
    <View className="w-full flex items-center py-4 px-6">
      <Animated.View 
        style={{
          opacity: fadeAnim,
        }}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fef3c7',
            borderWidth: 0,
          }}
        >
          <Flame size={16} color="#d97706" />
          <Text
            style={{
              color: '#92400e',
              fontWeight: '600',
              marginLeft: 8,
              fontSize: 14,
            }}
          >
            {messages[index]}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}; 