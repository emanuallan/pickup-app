import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Search, MessageCircle, DollarSign, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Welcome to UT Marketplace',
    subtitle: 'Your campus trading hub',
    description: 'Buy and sell textbooks, furniture, electronics, and more with fellow UT students.',
    icon: ShieldCheck,
    color: '#C1501F',
    background: 'linear-gradient(135deg, #C1501F 0%, #E67E22 100%)',
  },
  {
    id: 2,
    title: 'Browse & Discover',
    subtitle: 'Find what you need',
    description: 'Search through thousands of listings from verified UT students. Filter by category, price, and location.',
    icon: Search,
    color: '#3498DB',
    background: 'linear-gradient(135deg, #3498DB 0%, #5DADE2 100%)',
  },
  {
    id: 3,
    title: 'Connect Safely',
    subtitle: 'Chat with confidence',
    description: 'Message sellers directly through our secure platform. Arrange meetups on campus safely.',
    icon: MessageCircle,
    color: '#27AE60',
    background: 'linear-gradient(135deg, #27AE60 0%, #58D68D 100%)',
  },
  {
    id: 4,
    title: 'Sell & Earn',
    subtitle: 'Turn items into cash',
    description: 'List your items in minutes. Set your price, add photos, and start earning from things you no longer need.',
    icon: DollarSign,
    color: '#8E44AD',
    background: 'linear-gradient(135deg, #8E44AD 0%, #BB8FCE 100%)',
  },
];

export default function WelcomeSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  const router = useRouter();

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % slides.length;
        scrollViewRef.current?.scrollTo({
          x: nextSlide * screenWidth,
          animated: true,
        });
        return nextSlide;
      });
    }, 4000);
  };

  useEffect(() => {
    startTimer();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentSlide(slideIndex);
  };

  const handleScrollBeginDrag = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleScrollEndDrag = () => {
    startTimer();
  };

  const handleDotPress = (index: number) => {
    setCurrentSlide(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
    startTimer();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View key={slide.id} className="flex-1 justify-center items-center px-8" style={{ width: screenWidth }}>
            <View className="items-center space-y-6 max-w-sm">
              <View className="w-24 h-24 rounded-full items-center justify-center mb-4" style={{ backgroundColor: slide.color + '20' }}>
                <slide.icon size={48} color={slide.color} strokeWidth={1.5} />
              </View>
              
              <View className="items-center space-y-3">
                <Text className="text-3xl font-bold text-gray-900 text-center">
                  {slide.title}
                </Text>
                <Text className="text-xl font-medium text-center" style={{ color: slide.color }}>
                  {slide.subtitle}
                </Text>
                <Text className="text-gray-600 text-center text-base leading-6 mt-4">
                  {slide.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="items-center pb-8">
        <View className="flex-row space-x-2 mb-8">
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: currentSlide === index ? '#C1501F' : '#E5E7EB',
              }}
            />
          ))}
        </View>

        <View className="space-y-3 w-full px-8">
          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/register')}
            className="bg-[#C1501F] rounded-lg p-4 w-full"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Get Started
            </Text>
          </TouchableOpacity>

          <View className="mt-2"/>
          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/login')}
            className="border border-[#C1501F] rounded-lg p-4 w-full"
          >
            <Text className="text-[#C1501F] text-center font-semibold text-lg">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}