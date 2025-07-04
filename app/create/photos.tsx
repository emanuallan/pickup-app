import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function PhotosScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (images.length === 0) {
      router.push({
        pathname: '/create/details',
        params: { images: JSON.stringify([]) }
      });
      return;
    }
    router.push({
      pathname: '/create/details',
      params: { images: JSON.stringify(images) }
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-lg font-semibold mb-2">Add up to 5 photos</Text>
          <Text className="text-gray-500 mb-4">
            Photos help buyers see the details of your item
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {images.map((uri, index) => (
              <View key={index} className="w-[30%] aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-[30%] aspect-square bg-gray-50 rounded-xl items-center justify-center border border-gray-200"
              >
                <MaterialIcons name="add-photo-alternate" size={28} color="#666" />
                <Text className="text-xs text-gray-500 mt-1">Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {images.length > 0 && (
            <Text className="text-xs text-gray-500 mt-2">
              {images.length}/5 photos added
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-4 py-3 border-t mb-8 border-gray-100">
        <TouchableOpacity
          onPress={handleNext}
          className="w-full flex-row items-center justify-center py-3.5 bg-[#C1501F] rounded-xl"
        >
          <Text className="text-white font-medium mr-2">Next</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 