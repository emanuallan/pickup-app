import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';
import { COLORS } from '~/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '~/contexts/AuthContext';
import { Star, CheckCircle2, MessageCircle, Calendar, MapPin, User } from 'lucide-react-native';
import { getTimeAgo } from '../../utils/timeago';
import { AnimatedButton } from '~/components/AnimatedButton';
import ModalHeader from '~/components/ModalHeader';
import { RatingSubmissionModal } from '~/components/RatingSubmissionModal';
import UserRatingDisplay from '~/components/UserRatingDisplay';

interface UserSettings {
  email: string;
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

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserSettings | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const fetchData = async () => {
    if (!userId) return;

    try {
      // 1. Fetch profile
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('email, display_name, profile_image_url, bio')
        .eq('email', userId)
        .single();
      
      if (!userSettings) {
        Alert.alert('Error', 'User not found');
        router.back();
        return;
      }
      
      setProfile(userSettings);

      // 2. Fetch listings (only non-draft, active listings)
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });
      setListings(listingsData || []);

      // 3. Fetch ratings
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*')
        .eq('rated_id', userId)
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
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleMessageUser = () => {
    if (!user?.email) {
      router.push('/(auth)/login');
      return;
    }
    
    if (user.email === profile?.email) {
      Alert.alert('Cannot Message', 'You cannot message yourself.');
      return;
    }

    // Navigate to chat with this user
    router.push({
      pathname: '/chat/[id]',
      params: { 
        id: `${profile?.email}:general`,
        otherUserName: profile?.display_name || profile?.email || 'User',
        otherUserId: profile?.email || '',
        listingId: 'general',
        listingTitle: 'General Chat'
      }
    });
  };

  const handleRateUser = () => {
    if (!user?.email) {
      router.push('/(auth)/login');
      return;
    }
    
    if (user.email === profile?.email) {
      Alert.alert('Cannot Rate', 'You cannot rate yourself.');
      return;
    }

    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    // Refresh the ratings after submission
    fetchData();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.utOrange} />
          <Text className="text-gray-500 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-center">Profile not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-6 py-3 rounded-xl"
            style={{ backgroundColor: COLORS.utOrange }}
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
          <UserRatingDisplay 
            userId={item.rater_id} 
            rating={item.rating} 
          />
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
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      {/* Header */}
      <ModalHeader title={profile.display_name || profile.email} />

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="p-6">
          <View className="flex-row items-center mb-4">
            <View className="mr-4">
              {profile.profile_image_url ? (
                <Image
                  source={{ uri: profile.profile_image_url }}
                  className="w-24 h-24 rounded-full bg-gray-100"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-3xl text-gray-400">
                    {(profile.display_name || profile.email)?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold">{profile.display_name || profile.email}</Text>
              {profile.bio && (
                <Text className="text-gray-600 mt-1">{profile.bio}</Text>
              )}
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
                <UserRatingDisplay 
                  userId={userId as string} 
                  rating={ratings.length > 0 ? parseFloat(avgRating) : null} 
                />
              </View>
              <Text className="text-gray-600">Rating</Text>
            </View>
            <View className="items-center">
              <Text className="font-bold text-lg">{ratings.length}</Text>
              <Text className="text-gray-600">Reviews</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {user?.email !== profile.email && (
            <View className="flex-row gap-3 mb-6">
              <AnimatedButton
                onPress={handleMessageUser}
                hapticType="medium"
                scaleValue={0.97}
                style={{
                  backgroundColor: COLORS.utOrange,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  borderRadius: 16,
                  flex: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <MessageCircle size={22} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Message</Text>
              </AnimatedButton>
              
              <AnimatedButton
                onPress={handleRateUser}
                hapticType="medium"
                scaleValue={0.97}
                style={{
                  borderColor: COLORS.utOrange,
                  borderWidth: 2,
                  backgroundColor: 'white',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  borderRadius: 16,
                  flex: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Star size={22} color={COLORS.utOrange} />
                <Text className="font-bold text-lg ml-2" style={{ color: COLORS.utOrange }}>Rate</Text>
              </AnimatedButton>
            </View>
          )}
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

          <View className="px-6">
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

      {/* Rating Modal */}
      <RatingSubmissionModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        ratedUserId={profile?.email || ''}
        ratedUserName={profile?.display_name || profile?.email || ''}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </SafeAreaView>
  );
}