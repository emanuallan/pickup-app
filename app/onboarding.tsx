import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/contexts/AuthContext';
import { COLORS } from '~/theme/colors';
import { ChevronRight, ShoppingBag, Shield, Users, MessageCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: "Welcome to UT Marketplace",
    subtitle: "Built by Longhorns, for Longhorns 🤘",
    description: "Your trusted marketplace exclusively for UT students. Buy and sell items safely within our campus community.",
    icon: ShoppingBag,
    gradient: ['#FF6B35', '#F7931E'],
  },
  {
    id: 2,
    title: "Safe & Secure Trading",
    subtitle: "Verified students only",
    description: "Every transaction happens between verified UT students. Your safety and security are our top priorities.",
    icon: Shield,
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 3,
    title: "Connect with Campus",
    subtitle: "Build community connections",
    description: "Meet fellow Longhorns, discover great deals, and help build a sustainable campus economy.",
    icon: Users,
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: 4,
    title: "Easy Communication",
    subtitle: "Chat directly with sellers",
    description: "Built-in messaging system makes it easy to ask questions, negotiate prices, and arrange meetups.",
    icon: MessageCircle,
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: 5,
    title: "Ready to Start?",
    subtitle: "Join the UT Marketplace community",
    description: "Start buying and selling with your fellow Longhorns. Welcome to your campus marketplace!",
    icon: ShoppingBag,
    gradient: ['#fa709a', '#fee140'],
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  const slideX = useSharedValue(0);
  const indicatorScale = useSharedValue(1);
  
  useEffect(() => {
    slideX.value = withSpring(-currentSlide * width);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      indicatorScale.value = withSpring(1.2, {}, () => {
        indicatorScale.value = withSpring(1);
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsCompleting(true);
    
    try {
      // Mark onboarding as complete
      const { error } = await supabase
        .from('users')
        .update({ 
          onboard_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating onboarding status:', error);
      }
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const animatedSlideStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideX.value }],
    };
  });

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: indicatorScale.value }],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Slides Container */}
      <View className="flex-1">
        <Animated.View 
          className="flex-row"
          style={[
            { width: width * slides.length },
            animatedSlideStyle
          ]}
        >
          {slides.map((slide, index) => (
            <View key={slide.id} className="flex-1 justify-center items-center px-8" style={{ width }}>
              {/* Icon Container with UT Orange Background */}
              <View 
                className="w-32 h-32 rounded-full items-center justify-center mb-8 shadow-lg"
                style={{ 
                  backgroundColor: COLORS.utOrange,
                  shadowColor: COLORS.utOrange,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.25,
                  shadowRadius: 16,
                  elevation: 10,
                }}
              >
                <slide.icon size={64} color="white" />
              </View>

              {/* Content */}
              <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
                {slide.title}
              </Text>
              
              <Text className="text-lg font-semibold text-center mb-6" style={{ color: COLORS.utOrange }}>
                {slide.subtitle}
              </Text>
              
              <Text className="text-base text-gray-600 text-center leading-7 px-4">
                {slide.description}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Bottom Section */}
      <View className="px-8 pb-8">
        {/* Progress Indicators */}
        <View className="flex-row justify-center items-center mb-8">
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              className="mx-2 rounded-full"
              style={[
                {
                  width: 12,
                  height: 12,
                  backgroundColor: index === currentSlide ? COLORS.utOrange : '#E5E7EB',
                },
                index === currentSlide && animatedIndicatorStyle
              ]}
            />
          ))}
        </View>

        {/* Navigation Button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isCompleting}
          className="flex-row items-center justify-center rounded-2xl py-4 px-8 shadow-lg"
          style={{ 
            backgroundColor: COLORS.utOrange,
            opacity: isCompleting ? 0.7 : 1,
            shadowColor: COLORS.utOrange,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg mr-2">
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ChevronRight size={24} color="white" />
        </TouchableOpacity>

        {/* Skip Button */}
        {currentSlide < slides.length - 1 && (
          <TouchableOpacity
            onPress={handleComplete}
            className="mt-4 py-2"
            activeOpacity={0.7}
          >
            <Text className="text-gray-500 text-center font-medium">
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}