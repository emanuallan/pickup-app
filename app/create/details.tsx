import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Dropdown from '~/components/Dropdown';

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

export default function DetailsScreen() {
  const router = useRouter();
  const { images: imagesJson } = useLocalSearchParams();
  const images = JSON.parse(imagesJson as string) as string[];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<typeof categories[number]>('Select a category');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<typeof locations[number]>('Select a location');
  const [condition, setCondition] = useState<typeof conditions[number]>('Select condition');

  const isValid = title && 
    category !== 'Select a category' && 
    price && 
    description && 
    location !== 'Select a location' && 
    condition !== 'Select condition';

  const handleNext = () => {
    if (!isValid) return;

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
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="border-b border-gray-100 px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Item Details</Text>
          <TouchableOpacity onPress={handleNext} disabled={!isValid}>
            <Text className={`font-medium ${isValid ? 'text-[#C1501F]' : 'text-gray-300'}`}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4 space-y-5">
            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Title</Text>
              <TextInput
                className="text-base bg-gray-50 rounded-xl px-4 py-3"
                placeholder="What are you selling?"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Category</Text>
              <Dropdown
                value={category}
                options={categories}
                onSelect={(value) => setCategory(value as typeof categories[number])}
                placeholder="Select a category"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Price</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-gray-500 mr-2">$</Text>
                <TextInput
                  className="flex-1 text-base p-0"
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Condition</Text>
              <Dropdown
                value={condition}
                options={conditions}
                onSelect={(value) => setCondition(value as typeof conditions[number])}
                placeholder="Select condition"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Location</Text>
              <Dropdown
                value={location}
                options={locations}
                onSelect={(value) => setLocation(value as typeof locations[number])}
                placeholder="Select a location"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Description</Text>
              <TextInput
                className="text-base bg-gray-50 rounded-xl px-4 py-3"
                placeholder="Describe your item..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="px-4 py-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={handleNext}
            disabled={!isValid}
            className={`w-full flex-row items-center justify-center py-3.5 rounded-xl ${
              isValid ? 'bg-[#C1501F]' : 'bg-gray-100'
            }`}
          >
            <Text className={`font-medium mr-2 ${isValid ? 'text-white' : 'text-gray-400'}`}>
              Review Listing
            </Text>
            <MaterialIcons 
              name="arrow-forward" 
              size={20} 
              color={isValid ? 'white' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 