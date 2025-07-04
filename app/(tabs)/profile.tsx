import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-js';

interface UserSettings {
  email: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  notification_preferences: any;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBioModal, setShowBioModal] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const createInitialUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert([
          {
            id: user?.id,
            email: user?.email,
            display_name: null,
            bio: null,
            profile_image_url: null,
            notification_preferences: { email: true, push: true }
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const fetchUserSettings = async () => {
    try {
      // First try to fetch existing settings
      let { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('email', user?.email)
        .single();

      // If no settings exist, create them
      if (error && error.code === 'PGRST116') {
        console.log('No user settings found, creating initial settings...');
        data = await createInitialUserSettings();
      } else if (error) {
        console.error('Error fetching user settings:', error);
        return;
      }

      setUserSettings(data);
      setEditedBio(data?.bio || '');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBio = async () => {
    if (!user?.email) return;
    
    try {
      setSavingBio(true);
      const { error } = await supabase
        .from('user_settings')
        .update({ bio: editedBio })
        .eq('email', user.email);

      if (error) throw error;

      setUserSettings(prev => prev ? { ...prev, bio: editedBio } : null);
      setShowBioModal(false);
    } catch (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Failed to update bio. Please try again.');
    } finally {
      setSavingBio(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await uploadImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (base64Image: string) => {
    if (!user?.email) return;

    try {
      setUploadingImage(true);

      // Convert base64 to Uint8Array
      const binaryData = decode(base64Image);
      const fileName = `${user.email.replace('@', '-at-')}-${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, binaryData, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Delete old profile image if it exists
      if (userSettings?.profile_image_url) {
        const oldFileName = userSettings.profile_image_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('profile-images')
            .remove([oldFileName]);
        }
      }

      // Update user settings with new image URL
      const { error: updateError } = await supabase
        .from('user_settings')
        .update({ profile_image_url: publicUrl })
        .eq('email', user.email);

      if (updateError) throw updateError;

      setUserSettings(prev => prev ? { ...prev, profile_image_url: publicUrl } : null);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  if (!user) {
    return (
      <View className="flex-1 bg-white px-4 justify-center">
        <View className="space-y-4">
          <Text className="text-2xl font-bold text-center">Welcome to UT Marketplace</Text>
          <Text className="text-base text-gray-600 text-center">
            Sign in to manage your profile and listings
          </Text>
          <TouchableOpacity
            onPress={handleSignIn}
            className="bg-[#C1501F] rounded-lg py-3 mt-4"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#C1501F" />
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center pt-6 pb-4">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              {uploadingImage ? (
                <View className="w-full h-full items-center justify-center">
                  <ActivityIndicator color="#C1501F" />
                </View>
              ) : userSettings?.profile_image_url ? (
                <Image
                  source={{ uri: userSettings.profile_image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <MaterialIcons name="person" size={48} color="#9CA3AF" />
                </View>
              )}
            </View>
            <TouchableOpacity 
              className="absolute bottom-0 right-0 bg-[#C1501F] rounded-full p-2"
              onPress={handleImagePick}
              disabled={uploadingImage}
            >
              <MaterialIcons name="camera-alt" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold mt-4">
            {userSettings?.display_name || 'Set Your Name'}
          </Text>
          <Text className="text-gray-500">{user.email}</Text>
        </View>

        {/* Bio Section */}
        <View className="px-4 py-4 border-t border-gray-200">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Bio</Text>
            <TouchableOpacity 
              onPress={() => {
                setEditedBio(userSettings?.bio || '');
                setShowBioModal(true);
              }}
            >
              <MaterialIcons name="edit" size={20} color="#C1501F" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">
            {userSettings?.bio || 'Tell others about yourself...'}
          </Text>
        </View>

        {/* Settings Section */}
        <View className="px-4 py-4 border-t border-gray-200">
          <Text className="text-lg font-semibold mb-4">Settings</Text>
          
          <TouchableOpacity 
            className="flex-row items-center py-3"
            onPress={() => {/* TODO: Implement notifications settings */}}
          >
            <MaterialIcons name="notifications" size={24} color="#4B5563" />
            <Text className="text-gray-700 ml-3">Notification Preferences</Text>
            <MaterialIcons name="chevron-right" size={24} color="#4B5563" className="ml-auto" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3"
            onPress={() => {/* TODO: Implement account settings */}}
          >
            <MaterialIcons name="settings" size={24} color="#4B5563" />
            <Text className="text-gray-700 ml-3">Account Settings</Text>
            <MaterialIcons name="chevron-right" size={24} color="#4B5563" className="ml-auto" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View className="px-4 py-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={signOut}
            className="bg-[#C1501F] rounded-lg py-3"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>

      {/* Bio Edit Modal */}
      <Modal
        visible={showBioModal}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Edit Bio</Text>
              <TouchableOpacity onPress={() => setShowBioModal(false)}>
                <MaterialIcons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            <TextInput
              className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[100]"
              multiline
              placeholder="Tell others about yourself..."
              value={editedBio}
              onChangeText={setEditedBio}
            />
            <TouchableOpacity
              onPress={handleUpdateBio}
              disabled={savingBio}
              className="bg-[#C1501F] rounded-lg py-3"
            >
              <Text className="text-white text-center font-semibold text-lg">
                {savingBio ? 'Saving...' : 'Save Bio'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
} 