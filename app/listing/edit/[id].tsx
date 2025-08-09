import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '~/lib/supabase';
import { useAuth } from '~/contexts/AuthContext';
import { COLORS } from '~/theme/colors';
import Dropdown from '~/components/ui/Dropdown';
import ModalHeader from '~/components/layout/ModalHeader';
import * as ImagePicker from 'expo-image-picker';

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

interface Listing {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  condition: string;
  location: string;
  user_id: string;
}

export default function EditListingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<typeof categories[number]>('Select a category');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<typeof locations[number]>('Select a location');
  const [condition, setCondition] = useState<typeof conditions[number]>('Select condition');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Listing not found');

      // Check if user owns this listing
      if (user?.email !== data.user_id) {
        Alert.alert('Error', 'You can only edit your own listings');
        router.back();
        return;
      }

      setListing(data);
      setTitle(data.title);
      setCategory(data.category as typeof categories[number]);
      setPrice(data.price.toString());
      setDescription(data.description);
      setLocation(data.location as typeof locations[number]);
      setCondition(data.condition as typeof conditions[number]);
      setImages(data.images || []);
      
    } catch (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Error', 'Failed to load listing');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const isValid = title && 
    category !== 'Select a category' && 
    price && 
    description && 
    location !== 'Select a location' && 
    condition !== 'Select condition';

  const handleSave = async () => {
    if (!isValid || !listing) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('listings')
        .update({
          title,
          category,
          price: parseFloat(price),
          description,
          location,
          condition,
          images,
        })
        .eq('id', listing.id);

      if (error) throw error;

      Alert.alert('Success', 'Listing updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
    } catch (error) {
      console.error('Error updating listing:', error);
      Alert.alert('Error', 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.utOrange} />
          <Text className="text-gray-500 mt-4">Loading listing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4 space-y-5">
            {/* Images Section */}
            <View>
              <Text className="text-sm font-medium text-gray-600 mb-2">Photos</Text>
              <Text className="text-xs text-gray-500 mb-3">Add up to 5 photos</Text>
              
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
                  {images.length}/5 photos
                </Text>
              )}
            </View>

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

        {/* Bottom Actions */}
        <View className="px-4 py-3 border-t mb-8 border-gray-100 flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl border-2"
            style={{ borderColor: COLORS.utOrange }}
          >
            <Text className="font-medium" style={{ color: COLORS.utOrange }}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isValid || saving}
            className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${
              isValid && !saving ? 'bg-[#C1501F]' : 'bg-gray-100'
            }`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className={`font-medium mr-2 ${isValid && !saving ? 'text-white' : 'text-gray-400'}`}>
                  Save Changes
                </Text>
                <MaterialIcons 
                  name="save" 
                  size={20} 
                  color={isValid && !saving ? 'white' : '#9CA3AF'} 
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}