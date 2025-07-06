import { View, Text, TouchableOpacity, ScrollView, Alert, Image, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { LogOut, Camera, User, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalHeader from '~/components/ModalHeader';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { supabase } from '~/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { COLORS } from '~/theme/colors';

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

  useEffect(() => {
    if (user) fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      setSettings(data);
      setBio(data?.bio || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveBio = async () => {
    if (!user?.email) return;

    try {
      setSavingBio(true);
      const { error } = await supabase
        .from('user_settings')
        .update({ bio })
        .eq('email', user.email);

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
          .upload(filePath, decode(file.base64), {
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
          .from('user_settings')
          .update({ profile_image_url: publicUrl })
          .eq('email', user?.email);

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
            <Text className="text-xl font-semibold mt-4">{settings?.display_name || user?.email}</Text>
            <Text className="text-gray-500">{user?.email}</Text>
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