import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '~/theme/colors';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';
import { 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Tag, 
  Users
} from 'lucide-react-native';
import { getTimeAgo } from '../../utils/timeago';
import { useSettings } from '~/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  created_at: string;
  is_sold: boolean;
}

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { hapticFeedbackEnabled } = useSettings();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchListings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    fetchListings();
  };

  const handleCreatePress = () => {
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/create/photos');
  };


  const renderListingItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity 
      className="flex-row bg-white p-4 mb-2 rounded-xl shadow-sm"
      onPress={() => router.push({
        pathname: '/listing/[id]',
        params: { id: item.id }
      })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://picsum.photos/200' }}
        className="w-20 h-20 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 ml-4">
        <Text className="text-lg font-medium text-gray-900" numberOfLines={2}>{item.title}</Text>
        <Text style={{ color: COLORS.utOrange, fontWeight: 'bold' }}>${item.price}</Text>
        <View className="flex-row items-center mt-1">
          <MapPin size={12} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-1">{item.location}</Text>
        </View>
        <Text className="text-gray-500 text-xs">{getTimeAgo(item.created_at)}</Text>
        {item.is_sold && (
          <View className="flex-row items-center mt-1">
            <CheckCircle2 size={14} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-1">Sold</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: '#f8fafc' }}>      
      <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.utOrange} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Create Section */}
          <View className="mx-4 mt-4 rounded-3xl overflow-hidden" style={{ backgroundColor: COLORS.utOrange }}>
            <View className="p-8">
              <View className="items-center mb-8">
                {/* Simple icon */}
                <View 
                  className="w-20 h-20 rounded-full items-center justify-center mb-6"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Plus size={40} color="white" strokeWidth={2} />
                </View>
                
                <Text className="text-3xl font-bold text-white text-center mb-3">
                  Create & Sell
                </Text>
                <Text className="text-white/90 text-center text-lg leading-6">
                  Turn your items into cash with the UT community
                </Text>
              </View>

              {user ? (
                <TouchableOpacity
                  onPress={handleCreatePress}
                  className="w-full flex-row items-center justify-center py-4 rounded-2xl"
                  style={{ 
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Plus size={22} color={COLORS.utOrange} strokeWidth={2} />
                  <Text className="font-bold text-lg ml-2" style={{ color: COLORS.utOrange }}>
                    Start Selling Now
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="items-center">
                  <Text className="text-white/90 text-center mb-6 text-lg">
                    Sign in to start selling to fellow Longhorns
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/profile')}
                    className="w-full flex-row items-center justify-center py-4 rounded-2xl"
                    style={{ 
                      backgroundColor: 'white',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  >
                    <Users size={22} color={COLORS.utOrange} strokeWidth={2} />
                    <Text className="font-bold text-lg ml-2" style={{ color: COLORS.utOrange }}>
                      Sign In to Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* My Listings Section */}
          {user && (
            <View className="bg-white mx-4 mt-6 mb-6 rounded-3xl shadow-sm overflow-hidden pb-16">
              <View className="px-6 py-6 border-b border-gray-100">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
                      <Tag size={20} color={COLORS.utOrange} />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">My Listings</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      if (hapticFeedbackEnabled) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      router.push('/my-listings');
                    }}
                    className="flex-row items-center bg-orange-50 rounded-full px-4 py-2"
                  >
                    <View 
                      className="rounded-full w-6 h-6 items-center justify-center mr-2"
                      style={{ backgroundColor: COLORS.utOrange }}
                    >
                      <Text className="text-white font-bold text-xs">{listings.length}</Text>
                    </View>
                    <Text style={{ color: COLORS.utOrange }} className="font-semibold">View All</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {loading ? (
                <View className="px-6 py-16 items-center">
                  <View className="w-16 h-16 bg-orange-50 rounded-full items-center justify-center mb-4">
                    <ActivityIndicator size="large" color={COLORS.utOrange} />
                  </View>
                  <Text className="text-gray-500 mt-2 text-lg font-medium">Loading your listings...</Text>
                </View>
              ) : listings.length > 0 ? (
                <View className="px-6 py-4">
                  <FlatList
                    data={listings.slice(0, 5)}
                    renderItem={renderListingItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                  {listings.length > 5 && (
                    <TouchableOpacity 
                      onPress={() => {
                        if (hapticFeedbackEnabled) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        router.push('/my-listings');
                      }}
                      className="rounded-2xl p-4 mt-4 flex-row items-center justify-center"
                      style={{ backgroundColor: '#fff7ed' }}
                    >
                      <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                        <Plus size={16} color={COLORS.utOrange} />
                      </View>
                      <Text style={{ color: COLORS.utOrange }} className="font-bold text-base">
                        View {listings.length - 5} more listings
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="px-6 py-16 items-center">
                  <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                    <Plus size={32} color="#9CA3AF" strokeWidth={1.5} />
                  </View>
                  <Text className="text-gray-500 text-xl font-medium mb-2">Ready to sell?</Text>
                  <Text className="text-gray-400 text-center mb-6 leading-5">
                    Create your first listing and start earning
                  </Text>
                  <TouchableOpacity 
                    onPress={() => {
                      if (hapticFeedbackEnabled) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      router.push('/create/photos');
                    }}
                    className="flex-row items-center bg-orange-50 rounded-2xl px-6 py-3"
                  >
                    <Plus size={18} color={COLORS.utOrange} />
                    <Text style={{ color: COLORS.utOrange }} className="font-bold ml-2 text-base">
                      Create your first listing
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
    </View>
  );
}