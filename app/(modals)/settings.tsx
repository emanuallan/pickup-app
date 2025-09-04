import { View, Text, TouchableOpacity, ScrollView, Alert, Image, TextInput, ActivityIndicator, Switch, Linking , useColorScheme } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, Camera, User, Save, Bell, Shield, HelpCircle, Mail, Star, Moon, Palette, Globe, Info, ChevronRight, Heart, MessageCircle, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalHeader from '~/components/layout/ModalHeader';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { COLORS } from '~/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useSettings } from '~/contexts/SettingsContext';

interface UserSettings {
  display_name: string | null;
  profile_image_url: string | null;
  bio: string | null;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [bio, setBio] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const colorScheme = useColorScheme();
  const {
    notificationsEnabled,
    darkModeEnabled,
    locationEnabled,
    hapticFeedbackEnabled,
    setNotificationsEnabled,
    setDarkModeEnabled,
    setLocationEnabled,
    setHapticFeedbackEnabled
  } = useSettings();

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setSettings(data);
      setBio(data?.bio || '');
      setDisplayName(data?.display_name || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveBio = async () => {
    if (!user?.email) return;

    try {
      setSavingBio(true);
      const { error } = await supabase
        .from('users')
        .update({ bio })
        .eq('id', user.id);

      if (error) throw error;
      setSettings(prev => prev ? { ...prev, bio } : null);
      setEditingBio(false);
    } catch (error) {
      console.error('Error saving bio:', error);
      Alert.alert('Error', 'Failed to save bio. Please try again.');
    } finally {
      setSavingBio(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!user?.email) return;

    try {
      setSavingDisplayName(true);
      const { error } = await supabase
        .from('users')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) throw error;
      setSettings(prev => prev ? { ...prev, display_name: displayName } : null);
      setEditingDisplayName(false);
    } catch (error) {
      console.error('Error saving display name:', error);
      Alert.alert('Error', 'Failed to save display name. Please try again.');
    } finally {
      setSavingDisplayName(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        const file = result.assets[0];
        const filePath = `${user?.email}/profile/${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(file.base64 || ''), {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_image_url: publicUrl })
          .eq('id', user?.id);

        if (updateError) {
          throw updateError;
        }

        setSettings(prev => prev ? { ...prev, profile_image_url: publicUrl } : null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ModalHeader title="Settings" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="bg-white p-4 mb-6">
          <View className="items-center mb-6">
            <TouchableOpacity 
              onPress={handleImagePick}
              disabled={loading}
              className="relative"
            >
              {settings?.profile_image_url ? (
                <Image
                  source={{ uri: settings.profile_image_url }}
                  className="w-24 h-24 rounded-full bg-gray-100"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
                  <User size={40} color={COLORS.light.grey} />
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow">
                <Camera size={20} color={COLORS.utOrange} />
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-gray-500 mt-2">
              {loading ? 'Uploading...' : 'Tap to change profile picture'}
            </Text>
            <Text className="text-xl font-semibold mt-4">{settings?.display_name || (user?.email ? user.email.split('@')[0] : 'User')}</Text>
          </View>

          {/* Display Name Section */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold">Display Name</Text>
              {!editingDisplayName && (
                <TouchableOpacity onPress={() => setEditingDisplayName(true)}>
                  <Text style={{ color: COLORS.utOrange }}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {editingDisplayName ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter your display name"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleSaveDisplayName}
                  disabled={savingDisplayName}
                  className="bg-green-500 rounded-lg px-4 py-2"
                >
                  {savingDisplayName ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Save size={16} color="white" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEditingDisplayName(false);
                    setDisplayName(settings?.display_name || '');
                  }}
                  className="bg-gray-500 rounded-lg px-4 py-2"
                >
                  <Text className="text-white font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-gray-600 text-base leading-relaxed">
                {settings?.display_name || 'No display name set'}
              </Text>
            )}
          </View>

          {/* Bio Section */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold">Bio</Text>
              {!editingBio && (
                <TouchableOpacity onPress={() => setEditingBio(true)}>
                  <Text style={{ color: COLORS.utOrange }}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            {editingBio ? (
              <View>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Write something about yourself..."
                  multiline
                  className="bg-gray-50 rounded-lg p-3 min-h-[100] text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <View className="flex-row justify-end mt-2 space-x-2">
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingBio(false);
                      setBio(settings?.bio || '');
                    }}
                    className="px-4 py-2"
                  >
                    <Text className="text-gray-600">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleSaveBio}
                    disabled={savingBio}
                    className="bg-[#C1501F] px-4 py-2 rounded-lg flex-row items-center"
                  >
                    {savingBio ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Save size={16} color="white" />
                        <Text className="text-white ml-2">Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text className="text-gray-600">
                {settings?.bio || 'No bio yet'}
              </Text>
            )}
          </View>
        </View>

        {/* App Preferences */}
        <View className="bg-white p-4 mb-6">
          <Text className="text-xl font-bold mb-4">App Preferences</Text>
          
          <View className="space-y-4">
            {/* Notifications */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mr-3">
                  <Bell size={16} color="#BF5700" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Notifications</Text>
                  <Text className="text-sm text-gray-500">Get updates on your listings</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D1D5DB', true: '#BF5700' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Dark Mode */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mr-3">
                  <Moon size={16} color="#BF5700" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Dark Mode</Text>
                  <Text className="text-sm text-gray-500">Switch to dark theme</Text>
                </View>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#D1D5DB', true: '#BF5700' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Location */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mr-3">
                  <Globe size={16} color="#BF5700" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Location Services</Text>
                  <Text className="text-sm text-gray-500">Show location in listings</Text>
                </View>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#D1D5DB', true: '#BF5700' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Haptic Feedback */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mr-3">
                  <Palette size={16} color="#BF5700" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Haptic Feedback</Text>
                  <Text className="text-sm text-gray-500">Vibration for button taps</Text>
                </View>
              </View>
              <Switch
                value={hapticFeedbackEnabled}
                onValueChange={setHapticFeedbackEnabled}
                trackColor={{ false: '#D1D5DB', true: '#BF5700' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>




        {/* Support & Feedback */}
        <View className="bg-white p-4 mb-6">
          <Text className="text-xl font-bold mb-4">Support & Feedback</Text>
          
          <View className="space-y-2">
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:support@utmarketplace.com?subject=UT Marketplace Support')}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mr-3">
                  <Mail size={16} color="#BF5700" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Contact Support</Text>
                  <Text className="text-sm text-gray-500">Get help with your account</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Help & FAQ', 'Feature coming soon! Contact support for immediate assistance.')}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mr-3">
                  <HelpCircle size={16} color="#BF5700" />
                </View>
                <Text className="font-semibold text-gray-900">Help & FAQ</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://apps.apple.com/app/id123456789')}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mr-3">
                  <Star size={16} color="#BF5700" />
                </View>
                <View>
                  <Text className="font-semibold text-gray-900">Rate the App</Text>
                  <Text className="text-sm text-gray-500">Leave a review on the App Store</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Privacy Policy', 'Your privacy is important to us. We only collect necessary data to provide our services.')}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-50 rounded-full items-center justify-center mr-3">
                  <Shield size={16} color="#BF5700" />
                </View>
                <Text className="font-semibold text-gray-900">Privacy Policy</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>


        {/* App Info */}
        <View className="bg-white p-4 mb-6">
          <View className="flex-row items-center justify-center">
            <Info size={16} color="#9CA3AF" />
            <Text className="text-gray-500 ml-2">UT Marketplace v1.0.0</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="mx-4 flex-row items-center justify-center bg-red-500 rounded-xl py-4 px-6 mb-6"
          activeOpacity={0.7}
        >
          <LogOut size={24} color="white" className="mr-2" />
          <Text className="text-white font-semibold text-lg ml-2">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
} 