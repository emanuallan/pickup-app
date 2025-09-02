import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthContext';
import { supabase } from '~/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ConfirmScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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
        <View className="p-4">
          {/* Preview Header */}
          <Text className="text-sm text-gray-500 mb-4">Preview how your listing will appear</Text>

          {/* Listing Preview */}
          {/* Images */}
          {images.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  className="w-60 h-60 rounded-xl mr-2"
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}

          {/* Details */}
          <View className="space-y-4">
            <View>
              <Text className="text-2xl font-semibold">${price}</Text>
              <Text className="text-xl mt-1">{title}</Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-sm text-gray-600">{category}</Text>
              </View>
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-sm text-gray-600">{condition}</Text>
              </View>
              <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-sm text-gray-600">{location}</Text>
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-1">Description</Text>
              <Text className="text-gray-600">{description}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-4 py-3 border-t border-gray-100">
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Text className="text-center text-gray-600 mb-2">
            Uploading images: {Math.round(uploadProgress)}%
          </Text>
        )}
        <TouchableOpacity
          onPress={handlePublish}
          disabled={saving}
          className="w-full flex-row items-center justify-center py-3.5 bg-[#C1501F] rounded-xl"
        >
          <MaterialIcons name="publish" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-medium">
            {saving ? 'Publishing...' : 'Publish Listing'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 