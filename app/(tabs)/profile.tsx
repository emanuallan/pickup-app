import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';
import { COLORS } from '~/theme/colors';
import { useRouter } from 'expo-router';
import { Star, CheckCircle2, Settings2 } from 'lucide-react-native';
import { getTimeAgo } from '../../utils/timeago';

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
        .order('created_at', { ascending: false })
        .limit(5);
      setListings(listingsData || []);

      // 3. Fetch ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_id', user.email);
      setRatings(ratingsData || []);
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
          <Text className="font-medium text-gray-900">{item.title}</Text>
          <Text style={{ color: COLORS.utOrange, fontWeight: 'bold' }}>${item.price}</Text>
          <Text className="text-gray-500 text-sm">{getTimeAgo(item.created_at)}</Text>
          {item.is_sold && (
            <View className="flex-row items-center mt-1">
              <CheckCircle2 size={14} color={COLORS.utOrange} />
              <Text className="text-utOrange text-sm ml-1">Sold</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center flex-1">
            <View className="mr-4">
              {profile?.profile_image_url ? (
                <Image
                  source={{ uri: profile.profile_image_url }}
                  className="w-20 h-20 rounded-full bg-gray-100"
                />
              ) : (
                <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-2xl text-gray-400">
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
        </View>
      </View>

      {/* Active Listings */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center px-4 mb-4">
          <Text className="text-lg font-bold text-gray-900">Active Listings</Text>
          {activeListings.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/my-listings')}>
              <Text style={{ color: COLORS.utOrange }}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeListings.length > 0 ? (
          <FlatList
            data={activeListings}
            renderItem={renderListingItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        ) : (
          <View className="px-4">
            <Text className="text-gray-500">No active listings</Text>
            <TouchableOpacity 
              onPress={() => router.push('/create')}
              className="mt-2"
            >
              <Text style={{ color: COLORS.utOrange }}>Create your first listing →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sold Listings */}
      {soldListings.length > 0 && (
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-4 mb-4">
            <Text className="text-lg font-bold text-gray-900">Sold Listings</Text>
            <TouchableOpacity onPress={() => router.push('/my-listings')}>
              <Text style={{ color: COLORS.utOrange }}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={soldListings}
            renderItem={renderListingItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>
      )}
    </ScrollView>
  );
} 