import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { FileText, Tag, DollarSign, MapPin, CheckCircle, ArrowRight } from 'lucide-react-native';
import { useSettings } from '~/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import Dropdown from '~/components/ui/Dropdown';

const categories = [
  'Select a category',
  'Furniture',
  'Subleases',
  'Tech',
  'Vehicles',
  'Textbooks',
  'Clothing',
  'Kitchen',
  'Other',
] as const;

const conditions = [
  'Select condition',
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor',
] as const;

const locations = [
  'Select a location',
  'West Campus',
  'North Campus',
  'Riverside',
  'UT Campus',
  'Jester Circle',
  'PCL',
  'Union Starbucks',
  'Greg Gym',
  'Littlefield Fountain',
  'Dobie',
  'Other',
] as const;

// Constants for validation
const MAX_PRICE = 50000; // Maximum price of $50,000
const MAX_DESCRIPTION_LENGTH = 500; // Maximum 500 characters for description

export default function DetailsScreen() {
  const router = useRouter();
  const { images: imagesJson } = useLocalSearchParams();
  const { hapticFeedbackEnabled } = useSettings();
  const images = JSON.parse(imagesJson as string) as string[];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<typeof categories[number]>('Select a category');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<typeof locations[number]>('Select a location');
  const [condition, setCondition] = useState<typeof conditions[number]>('Select condition');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Scroll and keyboard handling
  const scrollViewRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<TextInput>(null);
  const priceInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const inputRefs = useRef<{ [key: string]: View | null }>({});

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
  }, []);

  const scrollToInput = (inputKey: string, extraOffset = 0) => {
    const inputRef = inputRefs.current[inputKey];
    if (inputRef && scrollViewRef.current) {
      inputRef.measureInWindow((x, y, width, height) => {
        // Calculate the position to scroll to
        const scrollPosition = Math.max(0, y - 200 + extraOffset); // 200px from top to give space
        scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true });
      });
    }
  };

  const handleInputFocus = (inputKey: string, extraOffset = 0) => {
    // Small delay to ensure keyboard animation is starting
    setTimeout(() => {
      scrollToInput(inputKey, extraOffset);
    }, 100);
  };

  const isValid = title && 
    category !== 'Select a category' && 
    price && 
    description && 
    location !== 'Select a location' && 
    condition !== 'Select condition';

  const handleNext = () => {
    if (!isValid) return;
    
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    router.push({
      pathname: '/create/confirm',
      params: {
        images: imagesJson,
        title,
        category,
        price,
        description,
        location,
        condition,
      }
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            {/* Header Section */}
            <View className="p-6">
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-orange-50 rounded-full items-center justify-center mb-4">
                  <FileText size={28} color="#C1501F" strokeWidth={2} />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">Item Details</Text>
                <Text className="text-gray-600 text-center text-base leading-6">
                  Tell buyers about your item with clear details
                </Text>
              </View>
            </View>

            <View className="bg-white mx-6 rounded-3xl p-6 shadow-sm mb-6">
              <View>
                <View 
                  className="mb-5"
                  ref={(ref) => inputRefs.current['title'] = ref}
                >
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
                      <FileText size={16} color="#3B82F6" />
                    </View>
                    <Text className="text-sm font-semibold text-gray-700">Title</Text>
                  </View>
                  <TextInput
                    ref={titleInputRef}
                    className="text-base bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus:border-blue-200"
                    placeholder="What are you selling?"
                    value={title}
                    onFocus={() => handleInputFocus('title')}
                    onChangeText={(text) => {
                      setTitle(text);
                      if (hapticFeedbackEnabled && text.length > 0 && title.length === 0) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    placeholderTextColor="#9CA3AF"
                    style={{ fontSize: 16 }}
                  />
                </View>

                <View className="mb-5">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-purple-50 rounded-full items-center justify-center mr-3">
                      <Tag size={16} color="#8B5CF6" />
                    </View>
                    <Text className="text-sm font-semibold text-gray-700">Category</Text>
                  </View>
                  <Dropdown
                    value={category}
                    options={categories}
                    onSelect={(value) => {
                      setCategory(value as typeof categories[number]);
                      if (hapticFeedbackEnabled) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    placeholder="Select a category"
                  />
                </View>

                <View 
                  className="mb-5"
                  ref={(ref) => inputRefs.current['price'] = ref}
                >
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-green-50 rounded-full items-center justify-center mr-3">
                      <DollarSign size={16} color="#10B981" />
                    </View>
                    <Text className="text-sm font-semibold text-gray-700">Price</Text>
                  </View>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-green-200">
                    <Text className="text-gray-500 mr-2 text-base font-medium">$</Text>
                    <TextInput
                      ref={priceInputRef}
                      className="flex-1 text-base p-0"
                      placeholder="0.00"
                      value={price}
                      onFocus={() => handleInputFocus('price')}
                      onChangeText={(text) => {
                        // Remove any non-numeric characters except decimal point
                        const numericText = text.replace(/[^0-9.]/g, '');
                        
                        // Ensure only one decimal point
                        const parts = numericText.split('.');
                        const cleanText = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
                        
                        // Check if price exceeds maximum
                        const numericValue = parseFloat(cleanText);
                        if (isNaN(numericValue) || numericValue <= MAX_PRICE) {
                          setPrice(cleanText);
                          if (hapticFeedbackEnabled && cleanText.length > 0 && price.length === 0) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        } else if (hapticFeedbackEnabled) {
                          // Give feedback when price limit is reached
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        }
                      }}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                      style={{ fontSize: 16 }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 mt-2">
                    Maximum price: ${MAX_PRICE.toLocaleString()}
                  </Text>
                </View>

                <View className="mb-5">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-yellow-50 rounded-full items-center justify-center mr-3">
                      <CheckCircle size={16} color="#F59E0B" />
                    </View>
                    <Text className="text-sm font-semibold text-gray-700">Condition</Text>
                  </View>
                  <Dropdown
                    value={condition}
                    options={conditions}
                    onSelect={(value) => {
                      setCondition(value as typeof conditions[number]);
                      if (hapticFeedbackEnabled) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    placeholder="Select condition"
                  />
                </View>

                <View className="mb-5">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-red-50 rounded-full items-center justify-center mr-3">
                      <MapPin size={16} color="#EF4444" />
                    </View>
                    <Text className="text-sm font-semibold text-gray-700">Location</Text>
                  </View>
                  <Dropdown
                    value={location}
                    options={locations}
                    onSelect={(value) => {
                      setLocation(value as typeof locations[number]);
                      if (hapticFeedbackEnabled) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    placeholder="Select a location"
                  />
                </View>

                <View ref={(ref) => inputRefs.current['description'] = ref}>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mr-3">
                        <FileText size={16} color="#6366F1" />
                      </View>
                      <Text className="text-sm font-semibold text-gray-700">Description</Text>
                    </View>
                    <Text className={`text-xs font-medium ${
                      description.length > MAX_DESCRIPTION_LENGTH * 0.9 
                        ? description.length >= MAX_DESCRIPTION_LENGTH 
                          ? 'text-red-500' 
                          : 'text-orange-500'
                        : 'text-gray-500'
                    }`}>
                      {description.length}/{MAX_DESCRIPTION_LENGTH}
                    </Text>
                  </View>
                  <TextInput
                    ref={descriptionInputRef}
                    className={`text-base bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus:border-indigo-200 ${
                      description.length >= MAX_DESCRIPTION_LENGTH ? 'border-red-200' : ''
                    }`}
                    placeholder="Describe your item in detail..."
                    value={description}
                    onFocus={() => handleInputFocus('description', 150)} // Extra offset for multiline input
                    onChangeText={(text) => {
                      if (text.length <= MAX_DESCRIPTION_LENGTH) {
                        setDescription(text);
                        if (hapticFeedbackEnabled && text.length > 0 && description.length === 0) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      } else if (hapticFeedbackEnabled) {
                        // Give feedback when character limit is reached
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      }
                    }}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#9CA3AF"
                    style={{ fontSize: 16, minHeight: 100 }}
                  />
                  <Text className="text-xs text-gray-500 mt-2">
                    Provide detailed information about condition, features, and any relevant details
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleNext}
            disabled={!isValid}
            className={`w-full flex-row items-center justify-center py-4 rounded-2xl ${
              isValid ? 'opacity-100' : 'opacity-60'
            }`}
            style={{
              backgroundColor: isValid ? '#C1501F' : '#9CA3AF',
              shadowColor: isValid ? '#C1501F' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isValid ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className={`font-semibold text-base mr-2 ${isValid ? 'text-white' : 'text-white'}`}>
              Review Listing
            </Text>
            <ArrowRight 
              size={20} 
              color="white" 
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
} 