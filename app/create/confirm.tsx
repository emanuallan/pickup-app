import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthContext';
import { supabase } from '~/lib/supabase';

export default function ConfirmScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const params = useLocalSearchParams();
  const images = JSON.parse(params.images as string) as string[];
  const title = params.title as string;
  const category = params.category as string;
  const price = params.price as string;
  const description = params.description as string;
  const location = params.location as string;
  const condition = params.condition as string;

  const uploadImages = async () => {
    if (!user?.email) return [];
    
    const uploadedImageUrls: string[] = [];
    for (const imageUri of images) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileName = `${user.email}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, blob);

        if (uploadError) {
          console.error('Image upload failed:', uploadError?.message || uploadError);
          throw new Error(`Failed to upload image: ${uploadError?.message || 'Unknown error'}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);

        uploadedImageUrls.push(publicUrlData.publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    return uploadedImageUrls;
  };

  const handlePublish = async () => {
    if (!user?.email) {
      router.push('/(auth)/login');
      return;
    }

    try {
      setSaving(true);
      const uploadedImageUrls = await uploadImages();

      const payload = {
        title,
        category,
        price: parseFloat(price),
        description,
        location,
        condition,
        user_id: user.email,
        user_name: user.email.split('@')[0],
        created_at: new Date().toISOString(),
        images: uploadedImageUrls,
        is_sold: false,
        is_draft: false,
      };

      const { error } = await supabase.from('listings').insert([payload]);

      if (error) throw error;
      
      router.push({
        pathname: '/(tabs)/browse',
        params: { filter: 'my-listings' }
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setSaving(false);
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