import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, Alert } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';
import { COLORS } from '~/theme/colors';
import { useRouter } from 'expo-router';
import { Star, CheckCircle2, Settings2, User, Calendar, MapPin, Plus, Edit3, Eye, BarChart3, MessageCircle, Heart, FileText } from 'lucide-react-native';
import { getTimeAgo } from '../../utils/timeago';
import { AnimatedButton } from '~/components/AnimatedButton';

interface UserSettings {
  display_name: string | null;
  profile_image_url: string | null;
  bio: string | null;
}

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

interface Rating {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  rater_id: string;
  rater_name: string;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserSettings | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user?.email) return;

    try {
      // 1. Fetch profile
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('display_name, profile_image_url, bio')
        .eq('email', user.email)
        .single();
      setProfile(userSettings);

      // 2. Fetch listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.email)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });
      setListings(listingsData || []);

      // 3. Fetch ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_id', user.email)
        .order('created_at', { ascending: false });
      
      // Get rater names for each rating
      const formattedRatings = [];
      if (ratingsData) {
        for (const rating of ratingsData) {
          const { data: raterData } = await supabase
            .from('user_settings')
            .select('display_name')
            .eq('email', rating.rater_id)
            .single();
          
          formattedRatings.push({
            ...rating,
            rater_name: raterData?.display_name || 'Anonymous User'
          });
        }
      }
      
      setRatings(formattedRatings);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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
            onPress={() => router.push('/login')}
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
        <ActivityIndicator size="large" color={COLORS.utOrange} />
        <Text className="text-gray-500 mt-4">Loading profile...</Text>
      </View>
    );
  }

  // Compute stats
  const soldListings = listings.filter(l => l.is_sold);
  const activeListings = listings.filter(l => !l.is_sold);
  const avgRating = ratings.length
    ? (ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length).toFixed(1)
    : 'N/A';

  const renderListingItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity 
      className="mr-4"
      onPress={() => router.push({
        pathname: '/listing/[id]',
        params: { id: item.id }
      })}
    >
      <View className="w-40 bg-white rounded-lg overflow-hidden shadow-sm">
        <Image
          source={{ uri: item.images?.[0] || 'https://picsum.photos/200' }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className="p-2">
          <Text className="font-medium text-gray-900" numberOfLines={2}>{item.title}</Text>
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
      </View>
    </TouchableOpacity>
  );

  const renderRatingItem = ({ item }: { item: Rating }) => (
    <View className="bg-gray-50 rounded-xl p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center">
            <User size={16} color="#6b7280" />
          </View>
          <Text className="font-medium text-gray-900 ml-2">{item.rater_name}</Text>
        </View>
        <View className="flex-row items-center">
          <Star size={16} color="#FFB800" fill="#FFB800" />
          <Text className="font-bold text-gray-900 ml-1">{item.rating}</Text>
        </View>
      </View>
      {item.comment && (
        <Text className="text-gray-700 mb-2">{item.comment}</Text>
      )}
      <View className="flex-row items-center">
        <Calendar size={12} color="#6b7280" />
        <Text className="text-gray-500 text-xs ml-1">{getTimeAgo(item.created_at)}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View className="mr-4">
              {profile?.profile_image_url ? (
                <Image
                  source={{ uri: profile.profile_image_url }}
                  className="w-24 h-24 rounded-full bg-gray-100"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-3xl text-gray-400">
                    {(profile?.display_name || user.email)?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold">{profile?.display_name || user.email}</Text>
              {profile?.bio && (
                <Text className="text-gray-600 mt-1">{profile.bio}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/settings')}
            className="p-2 rounded-full bg-gray-100"
          >
            <Settings2 size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-around py-4 bg-gray-50 rounded-xl mb-4">
          <View className="items-center">
            <Text className="font-bold text-lg">{activeListings.length}</Text>
            <Text className="text-gray-600">Active</Text>
          </View>
          <View className="items-center">
            <Text className="font-bold text-lg">{soldListings.length}</Text>
            <Text className="text-gray-600">Sold</Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <Star size={16} color="#FFB800" fill="#FFB800" />
              <Text className="font-bold text-lg ml-1">{avgRating}</Text>
            </View>
            <Text className="text-gray-600">Rating</Text>
          </View>
          <View className="items-center">
            <Text className="font-bold text-lg">{ratings.length}</Text>
            <Text className="text-gray-600">Reviews</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-6">
          <AnimatedButton
            onPress={() => router.push('/create')}
            hapticType="light"
            scaleValue={0.97}
            style={{
              backgroundColor: COLORS.utOrange,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              flex: 1,
            }}
          >
            <Plus size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Create Listing</Text>
          </AnimatedButton>
          
          <AnimatedButton
            onPress={() => router.push('/(tabs)/my-listings')}
            hapticType="light"
            scaleValue={0.97}
            style={{
              borderColor: COLORS.utOrange,
              borderWidth: 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: 'white',
              flex: 1,
            }}
          >
            <FileText size={18} color={COLORS.utOrange} />
            <Text className="font-semibold ml-2" style={{ color: COLORS.utOrange }}>My Listings</Text>
          </AnimatedButton>
        </View>

        {/* Favorites & Watchlist */}
        <View className="flex-row gap-3 mb-6">
          <AnimatedButton
            onPress={() => router.push('/favorites/favorite')}
            hapticType="light"
            scaleValue={0.97}
            style={{
              borderColor: '#ef4444',
              borderWidth: 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: 'white',
              flex: 1,
            }}
          >
            <Heart size={18} color="#ef4444" />
            <Text className="font-semibold ml-2" style={{ color: '#ef4444' }}>Favorites</Text>
          </AnimatedButton>
          
          <AnimatedButton
            onPress={() => router.push('/favorites/watchlist')}
            hapticType="light"
            scaleValue={0.97}
            style={{
              borderColor: '#3b82f6',
              borderWidth: 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: 'white',
              flex: 1,
            }}
          >
            <Eye size={18} color="#3b82f6" />
            <Text className="font-semibold ml-2" style={{ color: '#3b82f6' }}>Watchlist</Text>
          </AnimatedButton>
        </View>

        {/* Management Tools */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Account Tools</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity 
              onPress={() => router.push('/(modals)/settings')}
              className="items-center flex-1"
            >
              <View className="bg-white rounded-full p-3 mb-2">
                <Edit3 size={20} color={COLORS.utOrange} />
              </View>
              <Text className="text-sm text-gray-600">Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/my-listings')}
              className="items-center flex-1"
            >
              <View className="bg-white rounded-full p-3 mb-2">
                <BarChart3 size={20} color={COLORS.utOrange} />
              </View>
              <Text className="text-sm text-gray-600">Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/messages')}
              className="items-center flex-1"
            >
              <View className="bg-white rounded-full p-3 mb-2">
                <MessageCircle size={20} color={COLORS.utOrange} />
              </View>
              <Text className="text-sm text-gray-600">Messages</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Active Listings */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center px-6 mb-4">
          <Text className="text-lg font-bold text-gray-900">Active Listings</Text>
          <Text className="text-gray-500">{activeListings.length} items</Text>
        </View>

        {activeListings.length > 0 ? (
          <FlatList
            data={activeListings}
            renderItem={renderListingItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        ) : (
          <View className="px-6">
            <Text className="text-gray-500 text-center">No active listings</Text>
            <TouchableOpacity 
              onPress={() => router.push('/create')}
              className="mt-2"
            >
              <Text style={{ color: COLORS.utOrange }} className="text-center">Create your first listing →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sold Listings */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center px-6 mb-4">
          <Text className="text-lg font-bold text-gray-900">Sold Listings</Text>
          <Text className="text-gray-500">{soldListings.length} items</Text>
        </View>

        {soldListings.length > 0 ? (
          <FlatList
            data={soldListings}
            renderItem={renderListingItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        ) : (
          <View className="px-6">
            <Text className="text-gray-500 text-center">No sold listings</Text>
          </View>
        )}
      </View>

      {/* Reviews */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center px-6 mb-4">
          <Text className="text-lg font-bold text-gray-900">Reviews</Text>
          <Text className="text-gray-500">{ratings.length} reviews</Text>
        </View>

        <View className="px-6 pb-20">
          {ratings.length > 0 ? (
            <FlatList
              data={ratings}
              renderItem={renderRatingItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text className="text-gray-500 text-center">No reviews yet</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}