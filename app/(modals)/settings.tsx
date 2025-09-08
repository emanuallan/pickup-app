import { View, Text, TouchableOpacity, ScrollView, Alert, Image, TextInput, ActivityIndicator, Switch, Linking , useColorScheme } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, Camera, User, Save, Bell, Shield, HelpCircle, Mail, Star, Moon, Palette, Globe, Info, Heart, MessageCircle, Code, ExternalLink } from 'lucide-react-native';
import ModalHeader from '~/components/layout/ModalHeader';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { COLORS } from '~/theme/colors';
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
      setLoading(true);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        if (!file.base64) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
          return;
        }

        if (!user?.id || !user?.email) {
          Alert.alert('Error', 'User information not available. Please try signing in again.');
          return;
        }

        const filePath = `${user.email}/profile/${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(file.base64), {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Upload Error', uploadError.message || 'Failed to upload image');
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_image_url: publicUrl })
          .eq('id', user.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          Alert.alert('Update Error', updateError.message || 'Failed to update profile');
          return;
        }

        setSettings(prev => prev ? { ...prev, profile_image_url: publicUrl } : null);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/welcome');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ModalHeader title="Settings" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Beta Feedback Banner */}
        <View className="mx-4 mt-4 mb-6">
          <View 
            className="rounded-3xl p-6 border-2 shadow-lg"
            style={{
              backgroundColor: '#FFF7ED',
              borderColor: COLORS.utOrange,
              shadowColor: COLORS.utOrange,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: COLORS.utOrange }}
              >
                <MessageCircle size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">Beta Version 🚀</Text>
                <Text className="text-sm text-gray-600">Help us improve UT Marketplace</Text>
              </View>
            </View>
            <Text className="text-gray-700 mb-6 leading-6 text-base">
              UT Marketplace is currently in beta! Your feedback is incredibly valuable to help us build the best marketplace for Longhorns. Share your thoughts, report bugs, or suggest features.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://docs.google.com/document/d/1S4U-EeyNrYOpqSUcmpoOWEBNOIpMwCOReZ2PyIxBwSI/edit?usp=sharing')}
              className="flex-row items-center justify-center rounded-2xl py-4 px-6 shadow-sm"
              style={{ 
                backgroundColor: COLORS.utOrange,
                shadowColor: COLORS.utOrange,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <MessageCircle size={20} color="white" />
              <Text className="text-white font-bold text-base ml-3">
                Leave Feedback
              </Text>
              <ExternalLink size={18} color="white" className="ml-2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Section */}
        <View className="mx-4 mb-6">
          <View 
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            style={{
              shadowColor: COLORS.utOrange,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View className="items-center mb-6">
              <TouchableOpacity 
                onPress={handleImagePick}
                disabled={loading}
                className="relative"
              >
                {settings?.profile_image_url ? (
                  <Image
                    source={{ uri: settings.profile_image_url }}
                    className="w-28 h-28 rounded-3xl bg-gray-100"
                  />
                ) : (
                  <View className="w-28 h-28 rounded-3xl bg-orange-50 items-center justify-center border-2 border-orange-100">
                    <User size={44} color={COLORS.utOrange} />
                  </View>
                )}
                <View 
                  className="absolute -bottom-2 -right-2 rounded-2xl p-3 shadow-lg border-2 border-white"
                  style={{ backgroundColor: COLORS.utOrange }}
                >
                  <Camera size={18} color="white" />
                </View>
              </TouchableOpacity>
              <Text className="text-sm text-gray-500 mt-4 font-medium">
                {loading ? 'Uploading...' : 'Tap to change profile picture'}
              </Text>
              <Text className="text-2xl font-bold mt-2 text-gray-900">
                {settings?.display_name || (user?.email ? user.email.split('@')[0] : 'User')}
              </Text>
            </View>

            {/* Display Name Section */}
            <View className="mt-6">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <User size={18} color={COLORS.utOrange} />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Display Name</Text>
                </View>
                {!editingDisplayName && (
                  <TouchableOpacity 
                    onPress={() => setEditingDisplayName(true)}
                    className="px-4 py-2 rounded-xl"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Text style={{ color: COLORS.utOrange }} className="font-semibold">Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {editingDisplayName ? (
                <View className="space-y-3">
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter your display name"
                    className="border border-orange-200 rounded-2xl px-4 py-4 bg-orange-50 text-base"
                    autoFocus
                    style={{ fontSize: 16 }}
                  />
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={handleSaveDisplayName}
                      disabled={savingDisplayName}
                      className="flex-1 rounded-2xl py-3 items-center"
                      style={{ backgroundColor: COLORS.utOrange }}
                    >
                      {savingDisplayName ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <View className="flex-row items-center">
                          <Save size={16} color="white" />
                          <Text className="text-white font-semibold ml-2">Save</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingDisplayName(false);
                        setDisplayName(settings?.display_name || '');
                      }}
                      className="flex-1 bg-gray-100 rounded-2xl py-3 items-center"
                    >
                      <Text className="text-gray-600 font-semibold">Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-2xl p-4">
                  <Text className="text-gray-700 text-base leading-relaxed">
                    {settings?.display_name || 'No display name set'}
                  </Text>
                </View>
              )}
            </View>

            {/* Bio Section */}
            <View className="mt-6">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <MessageCircle size={18} color={COLORS.utOrange} />
                  </View>
                  <Text className="text-lg font-bold text-gray-900">Bio</Text>
                </View>
                {!editingBio && (
                  <TouchableOpacity 
                    onPress={() => setEditingBio(true)}
                    className="px-4 py-2 rounded-xl"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Text style={{ color: COLORS.utOrange }} className="font-semibold">Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              {editingBio ? (
                <View className="space-y-3">
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Write something about yourself..."
                    multiline
                    className="bg-orange-50 rounded-2xl p-4 border border-orange-200 text-gray-800"
                    placeholderTextColor="#9CA3AF"
                    style={{ minHeight: 120, fontSize: 16, textAlignVertical: 'top' }}
                  />
                  <View className="flex-row gap-3">
                    <TouchableOpacity 
                      onPress={() => {
                        setEditingBio(false);
                        setBio(settings?.bio || '');
                      }}
                      className="flex-1 bg-gray-100 rounded-2xl py-3 items-center"
                    >
                      <Text className="text-gray-600 font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleSaveBio}
                      disabled={savingBio}
                      className="flex-1 rounded-2xl py-3 items-center"
                      style={{ backgroundColor: COLORS.utOrange }}
                    >
                      {savingBio ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <View className="flex-row items-center">
                          <Save size={16} color="white" />
                          <Text className="text-white font-semibold ml-2">Save</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-2xl p-4">
                  <Text className="text-gray-700 text-base leading-relaxed">
                    {settings?.bio || 'No bio yet'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* App Preferences */}
        <View className="mx-4 mb-6">
          <View 
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            style={{
              shadowColor: COLORS.utOrange,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: '#FFF7ED' }}
              >
                <Palette size={24} color={COLORS.utOrange} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">App Preferences</Text>
                <Text className="text-sm text-gray-500">Customize your experience</Text>
              </View>
            </View>
            
            <View className="space-y-1">
              {/* Notifications */}
              <View className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl mb-3">
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Bell size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Notifications</Text>
                    <Text className="text-sm text-gray-600">Get updates on your listings</Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#D1D5DB', true: COLORS.utOrange }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Dark Mode */}
              <View className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl mb-3">
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Moon size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Dark Mode</Text>
                    <Text className="text-sm text-gray-600">Switch to dark theme</Text>
                  </View>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: '#D1D5DB', true: COLORS.utOrange }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Location */}
              <View className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl mb-3">
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Globe size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Location Services</Text>
                    <Text className="text-sm text-gray-600">Show location in listings</Text>
                  </View>
                </View>
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{ false: '#D1D5DB', true: COLORS.utOrange }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Haptic Feedback */}
              <View className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl">
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Palette size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Haptic Feedback</Text>
                    <Text className="text-sm text-gray-600">Vibration for button taps</Text>
                  </View>
                </View>
                <Switch
                  value={hapticFeedbackEnabled}
                  onValueChange={setHapticFeedbackEnabled}
                  trackColor={{ false: '#D1D5DB', true: COLORS.utOrange }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </View>





        {/* About Card - Modern Gradient Design */}
        <View className="mx-4 mb-8">
          <View 
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            style={{
              shadowColor: '#BF5700',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl items-center justify-center mr-4">
                <Text className="text-2xl">🤘</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">About UT Marketplace</Text>
                <Text className="text-sm text-gray-500">Built by Longhorns, for Longhorns</Text>
              </View>
            </View>
            <Text className="text-gray-700 leading-6 text-base">
              A safe and secure marketplace exclusively for UT students to buy and sell items within the campus community. Every transaction happens between verified students.
            </Text>
          </View>
        </View>

        {/* Developer & Links - Card Grid Layout */}
        <View className="mx-4 mb-8">
          {/* Developer Card */}
          <View 
            className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-gray-100"
            style={{
              shadowColor: COLORS.utOrange,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: '#FFF7ED' }}
              >
                <User size={24} color={COLORS.utOrange} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">Created by</Text>
                <Text className="text-sm text-gray-500">Meet the developer</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://austintran.me')}
              className="flex-row items-center justify-between py-4 px-4 rounded-2xl"
              style={{ backgroundColor: '#FFF7ED' }}
            >
              <View className="flex-row items-center flex-1">
                <View 
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: COLORS.utOrange }}
                >
                  <User size={18} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">Austin Tran</Text>
                  <Text className="text-sm text-gray-600">Lead Developer & Designer</Text>
                </View>
              </View>
              <ExternalLink size={18} color={COLORS.utOrange} />
            </TouchableOpacity>
          </View>

          {/* Resources & Support Card */}
          <View 
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            style={{
              shadowColor: COLORS.utOrange,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: '#FFF7ED' }}
              >
                <Code size={24} color={COLORS.utOrange} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">Resources & Support</Text>
                <Text className="text-sm text-gray-500">Links, help, and documentation</Text>
              </View>
            </View>
            
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => Linking.openURL('https://github.com/austin616/utmarketplace')}
                className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl"
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Code size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Source Code</Text>
                    <Text className="text-sm text-gray-600">View on GitHub</Text>
                  </View>
                </View>
                <ExternalLink size={18} color={COLORS.utOrange} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://github.com/austin616/utmarketplace/issues')}
                className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl"
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <HelpCircle size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Report Issues</Text>
                    <Text className="text-sm text-gray-600">Bug reports and feature requests</Text>
                  </View>
                </View>
                <ExternalLink size={18} color={COLORS.utOrange} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('mailto:austintran616@utexas.edu?subject=UT Marketplace Support')}
                className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl"
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Mail size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Contact Support</Text>
                    <Text className="text-sm text-gray-600">Get help with your account</Text>
                  </View>
                </View>
                <ExternalLink size={18} color={COLORS.utOrange} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://apps.apple.com/')}
                className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl"
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Star size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Rate the App</Text>
                    <Text className="text-sm text-gray-600">Leave a review on the App Store</Text>
                  </View>
                </View>
                <ExternalLink size={18} color={COLORS.utOrange} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://github.com/austin616/utmarketplace/blob/main/PRIVACY_POLICY.md')}
                className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl"
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: '#FFF7ED' }}
                  >
                    <Shield size={18} color={COLORS.utOrange} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">Privacy Policy</Text>
                    <Text className="text-sm text-gray-600">How we protect your data</Text>
                  </View>
                </View>
                <ExternalLink size={18} color={COLORS.utOrange} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Community & Thanks */}
        <View className="mx-4 mb-8">
          <View 
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
            style={{
              shadowColor: COLORS.utOrange,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: '#FFF7ED' }}
              >
                <Heart size={24} color={COLORS.utOrange} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">Community</Text>
                <Text className="text-sm text-gray-500">Built with love for UT</Text>
              </View>
            </View>
            <Text className="text-gray-700 mb-6 leading-6 text-base">
              Built with ❤️ for the UT community. Special thanks to all contributors, beta testers, and the amazing students who help make this marketplace better every day.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://github.com/Longhorn-Developers')}
              className="bg-gray-50 rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View 
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: '#FFF7ED' }}
                >
                  <Text style={{ color: COLORS.utOrange }} className="font-bold text-sm">LD</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">Longhorn Developers</Text>
                  <Text className="text-sm text-gray-600">Student developer community</Text>
                </View>
              </View>
              <ExternalLink size={18} color={COLORS.utOrange} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View className="mx-4 mb-6">
          <View 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            style={{
              shadowColor: COLORS.utOrange,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center justify-center">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#FFF7ED' }}
              >
                <Info size={16} color={COLORS.utOrange} />
              </View>
              <Text className="text-gray-700 font-medium">UT Marketplace v1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="mx-4 flex-row items-center justify-center rounded-3xl py-5 px-6 mb-8 shadow-lg"
          style={{
            backgroundColor: '#DC2626',
            shadowColor: '#DC2626',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 15,
            elevation: 8,
          }}
          activeOpacity={0.85}
        >
          <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center mr-4">
            <LogOut size={22} color="white" />
          </View>
          <Text className="text-white font-bold text-lg">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
} 