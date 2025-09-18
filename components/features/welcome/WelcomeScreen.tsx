import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { slides } from './constants';

const { width: screenWidth } = Dimensions.get('window');

export const WelcomeScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const intervalRef = useRef<number>(null);
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
        className="flex-1">
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            className="flex-1 items-center justify-center px-8"
            style={{ width: screenWidth }}>
            <View className="max-w-sm items-center space-y-6">
              <View
                className="mb-4 h-24 w-24 items-center justify-center rounded-full"
                style={{ backgroundColor: slide.color + '20' }}>
                <slide.icon size={48} color={slide.color} strokeWidth={1.5} />
              </View>

              <View className="items-center space-y-3">
                <Text className="text-center text-3xl font-bold text-gray-900">{slide.title}</Text>
                <Text className="text-center text-xl font-medium" style={{ color: slide.color }}>
                  {slide.subtitle}
                </Text>
                <Text className="mt-4 text-center text-base leading-6 text-gray-600">
                  {slide.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="items-center pb-8">
        <View className="mb-8 flex-row gap-x-1">
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: currentSlide === index ? '#C1501F' : '#E5E7EB',
              }}
            />
          ))}
        </View>

        <View className="w-full space-y-3 px-8">
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/register')}
            className="w-full rounded-lg bg-[#C1501F] p-4">
            <Text className="text-center text-lg font-semibold text-white">Get Started</Text>
          </TouchableOpacity>

          <View className="mt-2" />
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="w-full rounded-lg border border-[#C1501F] p-4">
            <Text className="text-center text-lg font-semibold text-[#C1501F]">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
