import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Animated, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, LogIn, BookOpen, Smartphone, Armchair, Shirt, Home, Wrench, Flame, MessageCircle, Users, Star, CheckCircle, ShieldCheck, Zap, TrendingUp, Eye, Heart, Sparkles, ArrowRight, MapPin, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '~/lib/supabase';
import { COLORS } from '~/theme/colors';
import * as Haptics from 'expo-haptics';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSettings } from '~/contexts/SettingsContext';
import { SearchBar } from '~/components/forms/SearchBar';
import ListingCard from '~/components/listing/ListingCard';
import HomeHeader from '~/components/layout/HomeHeader';

const { width } = Dimensions.get('window');

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface Item {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
  description?: string;
  category?: string;
  created_at?: string;
}

const categories: Category[] = [
  { id: 1, name: 'Textbooks', icon: <BookOpen size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 2, name: 'Electronics', icon: <Smartphone size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 3, name: 'Furniture', icon: <Armchair size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 4, name: 'Clothing', icon: <Shirt size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 5, name: 'Housing', icon: <Home size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 6, name: 'Services', icon: <Wrench size={18} color="#BF5700" />, color: COLORS.iconBg },
];


// Search Section Component
const SearchSection = ({ recentListings }: { recentListings: Item[] }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (text: string) => {
    if (text.trim()) {
      router.push({
        pathname: '/browse',
        params: { q: text.trim() }
      });
    } else {
      router.push('/browse');
    }
  };

  return (
    <View className="px-6 pb-4">
      <SearchBar
        value={searchValue}
        onChangeText={setSearchValue}
        onSubmit={(text) => handleSearchSubmit(text)}
        onFilterPress={() => router.push('/browse')}
        placeholder="Search items, brands, categories..."
        listings={recentListings.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          category: item.category || '',
          price: item.price,
          location: item.location,
          created_at: item.created_at || '',
          user_name: ''
        }))}
      />
    </View>
  );
};


// Category Item Component
const CategoryItem = ({ item }: { item: Category }) => {
  const router = useRouter();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(0.8, { damping: 15, stiffness: 400 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Reanimated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push({
          pathname: '/browse',
          params: { category: item.name }
        })}
        className="mb-3 flex-row items-center justify-between rounded-lg p-4 border border-gray-200 bg-white mx-6"
        style={{
          shadowColor: '#BF5700',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-4">
          <View className="w-12 h-12 bg-orange-50 rounded-full items-center justify-center">
            {item.icon}
          </View>
          <View>
            <Text className="font-bold text-lg text-gray-900">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500 font-medium">
              Browse {item.name.toLowerCase()}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#BF5700" />
      </Pressable>
    </Reanimated.View>
  );
};

// Categories Section with UT Dining-style cards
const CategoriesSection = () => {
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoryItem item={item} />
  );

  return (
    <View className="mb-8">
      <View className="px-6 mb-4">
        <Text className="text-2xl font-black text-gray-900 mb-1">Browse Categories</Text>
        <Text className="text-gray-500 font-medium">Find exactly what you need</Text>
      </View>
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 0 }}
      />
    </View>
  );
};

// Enhanced Trust Section
const TrustSection = () => {
  return (
    <View className="px-6 mb-8">
      <LinearGradient
        colors={['#f0fdf4', '#ecfdf5']}
        style={{
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: '#bbf7d0',
        }}
      >
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
            <ShieldCheck size={32} color="#059669" />
          </View>
          <Text className="text-xl font-black text-green-900 text-center mb-2">
            Safe & Secure Trading
          </Text>
          <Text className="text-green-700 text-center font-medium">
            Every user is a verified UT student
          </Text>
        </View>
        
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mb-2">
              <Users size={18} color="#059669" />
            </View>
            <Text className="text-green-900 font-bold text-lg">500+</Text>
            <Text className="text-green-600 text-xs font-medium">Students</Text>
          </View>
          <View className="items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mb-2">
              <Star size={18} color="#059669" />
            </View>
            <Text className="text-green-900 font-bold text-lg">4.9★</Text>
            <Text className="text-green-600 text-xs font-medium">Rating</Text>
          </View>
          <View className="items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mb-2">
              <CheckCircle size={18} color="#059669" />
            </View>
            <Text className="text-green-900 font-bold text-lg">100%</Text>
            <Text className="text-green-600 text-xs font-medium">Verified</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

function getTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();

  if (isNaN(date.getTime())) return '';

  const seconds = Math.floor(diff / 1000);
  if (seconds < 600) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentListings, setRecentListings] = useState<Item[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    fetchRecentListings();
  }, []);

  const fetchRecentListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_sold', false)
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data) {
        setRecentListings(data.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.images?.[0] || 'https://picsum.photos/200',
          location: item.location,
          description: item.description || '',
          category: item.category || '',
          created_at: item.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching recent listings:', error);
    } finally {
      setRecentLoading(false);
    }
  };

  const renderListingItem = ({ item }: { item: Item }) => (
    <View style={{ marginRight: 16 }}>
      <ListingCard
        id={item.id}
        title={item.title}
        price={item.price}
        location={item.location}
        category={item.category || 'Uncategorized'}
        timePosted={getTimeAgo(item.created_at || '')}
        images={[item.image]}
        user={{
          name: '',
          image: null,
        }}
        condition=""
        onPress={() => router.push(`/listing/${item.id}`)}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Home Header */}
        <HomeHeader />
        
        {/* Search Section */}
        <SearchSection recentListings={recentListings} />

        {/* Categories */}
        <CategoriesSection />

        {/* Recent Listings */}
        <View className="mb-8">
          <View className="px-6 mb-4">
            <Text className="text-2xl font-black text-gray-900 mb-1">Recent Listings</Text>
            <Text className="text-gray-500 font-medium">Fresh deals from your fellow Horns</Text>
          </View>
          
          {recentLoading ? (
            <View className="py-16">
              <ActivityIndicator size="large" color={COLORS.utOrange} />
              <Text className="text-center text-gray-500 mt-4 font-medium">Loading listings...</Text>
            </View>
          ) : recentListings.length > 0 ? (
            <FlatList
              data={recentListings}
              renderItem={renderListingItem}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
            />
          ) : (
            <View className="px-6">
              <View className="bg-white rounded-lg p-8 items-center border border-gray-200">
                <Text className="text-6xl mb-4">📦</Text>
                <Text className="text-gray-700 text-center font-bold text-lg mb-2">No listings yet</Text>
                <Text className="text-gray-500 text-center font-medium">Be the first to create a listing!</Text>
              </View>
            </View>
          )}
        </View>

        {/* Trust Section */}
        <TrustSection />
      </ScrollView>
    </View>
  );
} 