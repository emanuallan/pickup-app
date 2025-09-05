import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckCircle2, Tag, DollarSign, MapPin, FileText, Zap } from 'lucide-react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useSettings } from '~/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import { supabase } from '~/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: screenWidth } = Dimensions.get('window');

export default function ConfirmScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { hapticFeedbackEnabled } = useSettings();
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
  
  const params = useLocalSearchParams();
  const images = JSON.parse(params.images as string) as string[];
  const title = params.title as string;
  const category = params.category as string;
  const price = params.price as string;
  const description = params.description as string;
  const location = params.location as string;
  const condition = params.condition as string;

  const optimizeImage = async (uri: string) => {
    try {
      // Resize and compress the image
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Resize to max width of 1080px
        {
          compress: 0.7, // 70% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      return manipResult.uri;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return uri; // Return original if optimization fails
    }
  };

  const uploadSingleImage = async (imageUri: string, index: number) => {
    try {
      console.log(`Processing image ${index + 1}/${images.length}`);

      // Optimize image first
      const optimizedUri = await optimizeImage(imageUri);
      
      // Read the optimized file as base64
      const base64 = await FileSystem.readAsStringAsync(optimizedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create a unique file name
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `${user!.id}/${fileName}`;

      // Upload to Supabase Storage using ArrayBuffer
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading image ${index + 1}:`, error);
      throw error;
    }
  };

  const uploadImages = async () => {
    if (!user?.email) return [];
    
    const uploadPromises = images.map((uri, index) => uploadSingleImage(uri, index));
    const uploadedUrls: string[] = [];
    
    try {
      // Upload all images in parallel with progress tracking
      const total = uploadPromises.length;
      let completed = 0;

      const results = await Promise.allSettled(uploadPromises);
      
      results.forEach((result, index) => {
        completed++;
        setUploadProgress((completed / total) * 100);

        if (result.status === 'fulfilled') {
          uploadedUrls.push(result.value);
        } else {
          console.error(`Failed to upload image ${index + 1}:`, result.reason);
        }
      });

      if (uploadedUrls.length === 0) {
        throw new Error('No images were uploaded successfully');
      }

      return uploadedUrls;
      } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Error', 'Failed to upload images. Please try again.');
      return uploadedUrls;
    }
  };

  // Helper function to convert UI values to database enum values
  const convertToDbFormat = (value: string, type: 'category' | 'condition') => {
    if (type === 'category') {
      // Convert UI category names to database enum values
      const categoryMap: Record<string, string> = {
        'Furniture': 'furniture',
        'Subleases': 'subleases', 
        'Tech': 'tech',
        'Vehicles': 'vehicles',
        'Textbooks': 'textbooks',
        'Clothing': 'clothing',
        'Kitchen': 'kitchen',
        'Other': 'other'
      };
      return categoryMap[value] || value.toLowerCase();
    } else {
      // Convert UI condition names to database enum values
      const conditionMap: Record<string, string> = {
        'New': 'new',
        'Like New': 'like_new',
        'Good': 'good',
        'Fair': 'fair',
        'Poor': 'poor'
      };
      return conditionMap[value] || value.toLowerCase().replace(' ', '_');
    }
  };

  const handlePublish = async () => {
    if (!user?.id) {
      router.push('/(auth)/login');
      return;
    }

    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      setSaving(true);
      setUploadProgress(0);
      console.log('Starting image upload process...');
      
      const uploadedImageUrls = await uploadImages();
      console.log('Images uploaded successfully:', uploadedImageUrls);

      const payload = {
        title,
        category: convertToDbFormat(category, 'category'),
        price: parseFloat(price),
        description,
        location,
        condition: convertToDbFormat(condition, 'condition'),
        user_id: user.id,
        created_at: new Date().toISOString(),
        images: uploadedImageUrls,
        is_sold: false,
        is_draft: false,
      };

      const { error } = await supabase.from('listings').insert([payload]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Listing created successfully');
      
      if (hapticFeedbackEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.push({
        pathname: '/(tabs)/browse',
        params: { filter: 'my-listings' }
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Preview Banner */}
        <View className="bg-green-50 border-b border-green-200 px-4 py-4">
          <View className="flex-row items-center">
            <View className="bg-green-100 rounded-full p-2 mr-3">
              <CheckCircle2 size={16} color="#10B981" />
            </View>
            <Text className="font-semibold text-base" style={{ color: '#10B981' }}>
              Preview Your Listing
            </Text>
          </View>
        </View>

        {/* Images - Full width like buying view */}
        <View className="relative">
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                className="bg-black"
              >
                {images.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{ width: screenWidth, height: 300 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              
              {images.length > 1 && (
                <View className="absolute bottom-4 left-1/2 flex-row" style={{ transform: [{ translateX: -((images.length * 12) / 2) }] }}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      className="w-2 h-2 rounded-full mx-1 bg-white"
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View className="w-full h-80 bg-gray-100 items-center justify-center">
              <Text className="text-gray-400 text-lg">No Image</Text>
            </View>
          )}
        </View>

        {/* Listing Details - Same format as buying view */}
        <View className="p-6">
          {/* Title and Price */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">{title}</Text>
            <Text className="text-3xl font-bold" style={{ color: '#C1501F' }}>
              ${price}
            </Text>
          </View>

          {/* Meta Information */}
          <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="flex-row items-center">
              <MapPin size={16} color="#C1501F" />
              <Text className="text-gray-600 ml-2">{location}</Text>
            </View>
            <View className="flex-row items-center">
              <Tag size={16} color="#C1501F" />
              <Text className="text-gray-600 ml-2">{category}</Text>
            </View>
          </View>

          {/* Condition */}
          <View className="mb-6">
            <View className="self-start px-3 py-1 rounded-full" style={{ backgroundColor: '#fef3c7' }}>
              <Text style={{ color: '#92400e', fontWeight: '600' }}>
                Condition: {condition}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Description</Text>
            <Text className="text-gray-700 leading-relaxed">{description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
        {uploadProgress > 0 && uploadProgress < 100 && (
          <View className="mb-4">
            <Text className="text-center text-gray-600 mb-2">
              Uploading images: {Math.round(uploadProgress)}%
            </Text>
            <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <View 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </View>
          </View>
        )}
        <TouchableOpacity
          onPress={handlePublish}
          disabled={saving}
          className={`w-full flex-row items-center justify-center py-4 rounded-2xl ${
            saving ? 'opacity-60' : 'opacity-100'
          }`}
          style={{
            backgroundColor: saving ? '#9CA3AF' : '#C1501F',
            shadowColor: saving ? '#000' : '#C1501F',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: saving ? 0.1 : 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Zap size={20} color="white" strokeWidth={2} style={{ marginRight: 8 }} />
          <Text className="text-white font-semibold text-base">
            {saving ? 'Publishing Your Listing...' : 'Publish Listing'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 