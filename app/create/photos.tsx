import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, Sparkles, X, ArrowRight } from 'lucide-react-native';
import { useSettings } from '~/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function PhotosScreen() {
  const router = useRouter();
  const { hapticFeedbackEnabled } = useSettings();
  const [images, setImages] = useState<string[]>([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for add photo button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pickImage = async () => {
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 5));
      
      if (hapticFeedbackEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const removeImage = (index: number) => {
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (images.length === 0) {
      if (hapticFeedbackEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    router.push({
      pathname: '/create/details',
      params: { images: JSON.stringify(images) }
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View className="p-6">
            {/* Header Section */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                <Camera size={28} color="#3B82F6" strokeWidth={2} />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">Show Off Your Item</Text>
              <Text className="text-gray-600 text-center text-base leading-6">
                Great photos help your item sell faster. Add up to 5 images.
              </Text>
            </View>

            {/* Photo Grid */}
            <View className="bg-white rounded-3xl p-6 shadow-sm mb-6">
              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                {images.map((uri, index) => (
                  <Animated.View 
                    key={index} 
                    className="relative"
                    style={{
                      width: '30%',
                      aspectRatio: 1,
                    }}
                  >
                    <View className="w-full h-full bg-gray-100 shadow-sm">
                      <Image source={{ uri }} className="w-full h-full rounded-2xl" resizeMode="cover" />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full items-center justify-center shadow-lg"
                        style={{
                          shadowColor: '#EF4444',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 4,
                        }}
                      >
                        <X size={14} color="white" strokeWidth={2}  />
                      </TouchableOpacity>
                    </View>
                    {/* Image number indicator */}
                    <View className="absolute bottom-2 left-2 bg-black/60 rounded-full w-6 h-6 items-center justify-center">
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    </View>
                  </Animated.View>
                ))}
                
                {/* Add Photo Button */}
                {images.length < 5 && (
                  <Animated.View
                    style={{
                      width: '30%',
                      aspectRatio: 1,
                      transform: [{ scale: images.length === 0 ? pulseAnim : 1 }],
                    }}
                  >
                    <TouchableOpacity
                      onPress={pickImage}
                      className="w-full h-full rounded-2xl items-center justify-center border-2 border-dashed"
                      style={{
                        borderColor: '#C1501F',
                        backgroundColor: '#FFF7ED',
                      }}
                    >
                      <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-2">
                        <ImageIcon size={20} color="#C1501F" />
                      </View>
                      <Text className="text-xs font-semibold" style={{ color: '#C1501F' }}>
                        Add Photo
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>

              {/* Progress Indicator */}
              {images.length > 0 && (
                <View className="mt-6 pt-6 border-t border-gray-100">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      Photos added: {images.length}/5
                    </Text>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <View
                          key={num}
                          className={`w-2 h-2 rounded-full mx-1 ${
                            num <= images.length ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </View>
                  </View>
                  <View className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <Animated.View
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                      style={{
                        width: `${(images.length / 5) * 100}%`,
                      }}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Tips Section */}
            {images.length < 3 && (
              <View className="bg-blue-50 rounded-2xl p-4 mb-6">
                <View className="flex-row items-start">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Sparkles size={16} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-blue-900 mb-1">Photo Tips</Text>
                    <Text className="text-blue-700 text-sm leading-5">
                      • Use good lighting and clean backgrounds{'\n'}
                      • Show different angles of your item{'\n'}
                      • Include any flaws or wear honestly
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleNext}
          disabled={images.length === 0}
          className={`w-full flex-row items-center justify-center py-4 rounded-2xl ${
            images.length === 0 ? 'opacity-60' : 'opacity-100'
          }`}
          style={{
            backgroundColor: images.length === 0 ? '#9CA3AF' : '#C1501F',
            shadowColor: images.length === 0 ? '#000' : '#C1501F',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: images.length === 0 ? 0.1 : 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text className="text-white font-semibold text-base mr-2">
            {images.length === 0 ? 'Add at least 1 photo' : 'Continue to Details'}
          </Text>
          <ArrowRight size={20} color="white" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
} 