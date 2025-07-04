import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, LogIn, BookOpen, Smartphone, Armchair, Shirt, Home, Wrench } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';
import { COLORS } from '~/theme/colors';

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
}

interface Item {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
}

const categories: Category[] = [
  { id: 1, name: 'Textbooks', icon: <BookOpen size={24} color={COLORS.utOrange} /> },
  { id: 2, name: 'Electronics', icon: <Smartphone size={24} color={COLORS.utOrange} /> },
  { id: 3, name: 'Furniture', icon: <Armchair size={24} color={COLORS.utOrange} /> },
  { id: 4, name: 'Clothing', icon: <Shirt size={24} color={COLORS.utOrange} /> },
  { id: 5, name: 'Housing', icon: <Home size={24} color={COLORS.utOrange} /> },
  { id: 6, name: 'Services', icon: <Wrench size={24} color={COLORS.utOrange} /> },
];

const featuredItems: Item[] = [
  {
    id: 1,
    title: 'MacBook Pro 2021',
    price: 899,
    image: 'https://picsum.photos/200',
    location: 'West Campus'
  },
  {
    id: 2,
    title: 'Calculus Textbook',
    price: 45,
    image: 'https://picsum.photos/201',
    location: 'North Campus'
  },
  {
    id: 3,
    title: 'Desk Chair',
    price: 50,
    image: 'https://picsum.photos/202',
    location: 'Riverside'
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [myListings, setMyListings] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (user) {
      fetchMyListings();
    }
  }, [user]);

  const fetchMyListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user?.email)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setMyListings(data.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.images?.[0] || 'https://picsum.photos/200',
          location: item.location
        })));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching my listings:', error);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      className="items-center mr-4"
      onPress={() => router.push({
        pathname: '/browse',
        params: { category: item.name }
      })}
    >
      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-2">
        {item.icon}
      </View>
      <Text className="text-sm text-gray-600">{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      className="mr-4"
      onPress={() => router.push({
        pathname: '/browse',
        params: { itemId: item.id }
      })}
    >
      <View className="w-40 bg-white rounded-lg overflow-hidden shadow-sm">
        <Image
          source={{ uri: item.image }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className="p-2">
          <Text className="font-medium text-gray-900">{item.title}</Text>
          <Text style={{ color: COLORS.utOrange, fontWeight: 'bold' }}>${item.price}</Text>
          <Text className="text-gray-500 text-sm">{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <TouchableOpacity 
        className="mx-4 mt-4 mb-4 flex-row items-center bg-gray-100 rounded-full px-4 py-2"
        onPress={() => router.push('/browse')}
      >
        <Search size={20} color={COLORS.light.grey} />
        <Text className="ml-2 text-gray-500">Search items...</Text>
      </TouchableOpacity>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* My Listings Section */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-8">
            <ActivityIndicator size="large" color={COLORS.utOrange} />
          </View>
        ) : (
          <>
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-4 mb-4">
                <Text className="text-lg font-bold text-gray-900">My Listings</Text>
                {user && (
                  <TouchableOpacity onPress={() => router.push('/my-listings')}>
                    <Text style={{ color: COLORS.utOrange }}>See All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {user ? (
                myListings.length > 0 ? (
                  <FlatList
                    data={myListings}
                    renderItem={renderFeaturedItem}
                    keyExtractor={item => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                  />
                ) : (
                  <View className="px-4">
                    <Text className="text-gray-500">You haven&apos;t created any listings yet.</Text>
                    <TouchableOpacity 
                      onPress={() => router.push('/create')}
                      className="mt-2"
                    >
                      <Text style={{ color: COLORS.utOrange }}>Create your first listing →</Text>
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/login')}
                  className="flex-row items-center px-4 py-3 bg-gray-100 mx-4 rounded-xl"
                >
                  <LogIn size={20} color={COLORS.light.grey} />
                  <Text className="ml-2 text-gray-600">Sign in to view your listings</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Categories */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-4 mb-4">
                <Text className="text-lg font-bold text-gray-900">Categories</Text>
                <TouchableOpacity onPress={() => router.push('/browse')}>
                  <Text style={{ color: COLORS.utOrange }}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>

            {/* Featured Items */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-4 mb-4">
                <Text className="text-lg font-bold text-gray-900">Featured Items</Text>
                <TouchableOpacity onPress={() => router.push('/browse')}>
                  <Text style={{ color: COLORS.utOrange }}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={featuredItems}
                renderItem={renderFeaturedItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>

            {/* Recent Listings */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-4 mb-4">
                <Text className="text-lg font-bold text-gray-900">Recent Listings</Text>
                <TouchableOpacity onPress={() => router.push('/browse')}>
                  <Text style={{ color: COLORS.utOrange }}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={featuredItems}
                renderItem={renderFeaturedItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
} 