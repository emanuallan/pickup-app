import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';
import StatusBadge, { StatusDescription } from '~/components/StatusBadge';

interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  created_at: string;
  is_sold: boolean;
  status: 'pending' | 'approved' | 'denied';
  denial_reason?: string;
}

export default function MyListingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, description, images, location, created_at, is_sold, status, denial_reason')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchListings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Listing }) => (
    <View className="bg-white p-4 mb-2 rounded-xl">
      <TouchableOpacity 
        className="flex-row"
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
          <Text className="text-lg font-medium text-gray-900">{item.title}</Text>
          <Text style={{ color: COLORS.utOrange, fontWeight: 'bold' }}>${item.price}</Text>
          <Text className="text-gray-500">{item.location}</Text>
          {item.is_sold && (
            <View className="bg-gray-100 self-start px-2 py-1 rounded-full mt-1">
              <Text className="text-xs text-gray-600">Sold</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Status Badge */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <StatusBadge status={item.status || 'pending'} size="small" />
        {item.status === 'denied' && item.denial_reason && (
          <Text className="text-xs text-gray-500 flex-1 ml-2" numberOfLines={1}>
            {item.denial_reason}
          </Text>
        )}
      </View>
      
      {/* Status Description for denied items */}
      {item.status === 'denied' && (
        <StatusDescription status={item.status} denialReason={item.denial_reason} />
      )}
    </View>
  );

  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-lg text-gray-600 text-center mb-4">
          Sign in to view your listings
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: COLORS.utOrange }}
        >
          <Text className="text-white font-medium">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.utOrange} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
        <Text className="text-2xl font-bold text-gray-900">My Listings</Text>
        <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-500">Total Listings: {listings.length}</Text>
            <TouchableOpacity onPress={() => router.push('/create')} className="px-6 py-3 rounded-xl flex-row items-center" style={{ backgroundColor: COLORS.utOrange }}>
                <Plus size={20} color="white" />
                <Text className="text-white font-medium ml-2">Create Listing</Text>
            </TouchableOpacity>
        </View>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.utOrange}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-gray-500 mb-4">You haven&apos;t created any listings yet</Text>
            <TouchableOpacity
              onPress={() => router.push('/create')}
              className="px-6 py-3 rounded-xl flex-row items-center"
              style={{ backgroundColor: COLORS.utOrange }}
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-medium ml-2">Create Listing</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
} 