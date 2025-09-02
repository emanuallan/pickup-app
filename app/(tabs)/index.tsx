import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, LogIn, BookOpen, Smartphone, Armchair, Shirt, Home, Wrench, Flame, MessageCircle, Users, Star, CheckCircle, ShieldCheck, Zap, TrendingUp, Eye, Heart, Sparkles, ArrowRight, MapPin, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';
import { useHomeRefresh } from './_layout';
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
  id: string;
  title: string;
  price: number;
  image: string;
  location: string;
  description?: string;
  category?: string;
  created_at?: string;
}

const categories: Category[] = [
  { id: 1, name: 'Furniture', icon: <Armchair size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 2, name: 'Housing', icon: <Home size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 3, name: 'Tech', icon: <Smartphone size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 4, name: 'Books', icon: <BookOpen size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 5, name: 'Clothing', icon: <Shirt size={18} color="#BF5700" />, color: COLORS.iconBg },
  { id: 6, name: 'Other', icon: <Wrench size={18} color="#BF5700" />, color: COLORS.iconBg },
];


// Search Section Component
const SearchSection = ({ recentListings }: { recentListings: Item[] }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (text: string) => {
    // Force refresh by adding a timestamp to clear any cached state
    if (text.trim()) {
      router.push({
        pathname: '/browse',
        params: { q: text.trim(), refresh: Date.now().toString() }
      });
    } else {
      router.push({
        pathname: '/browse',
        params: { refresh: Date.now().toString() }
      });
    }
  };

  return (
    <View className="px-6 pb-4 pt-2">
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
          params: { category: item.name, refresh: Date.now().toString() }
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

// Tips & Safety Section
const TipsSection = () => {
  const tips = [
    {
      icon: <Eye size={18} color="#BF5700" />,
      title: "Meet in Public",
      description: "Always meet buyers/sellers in safe public places on campus"
    },
    {
      icon: <MessageCircle size={18} color="#BF5700" />,
      title: "Stay in App",
      description: "Keep all communications within the app for your safety"
    },
    {
      icon: <Heart size={18} color="#BF5700" />,
      title: "Be Honest",
      description: "Describe items accurately and use real photos"
    }
  ];

  return (
    <View className="px-6 mb-8">
      <View className="mb-4">
        <Text className="text-2xl font-black text-gray-900 mb-1">Safety Tips</Text>
        <Text className="text-gray-500 font-medium">Stay safe while trading</Text>
      </View>
      
      <View className="bg-white rounded-lg border border-gray-200 p-4" 
        style={{
          shadowColor: '#BF5700',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {tips.map((tip, index) => (
          <View key={index} className={`flex-row items-start gap-3 ${index < tips.length - 1 ? 'mb-4 pb-4 border-b border-gray-100' : ''}`}>
            <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center">
              {tip.icon}
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-base mb-1">{tip.title}</Text>
              <Text className="text-gray-600 text-sm font-medium">{tip.description}</Text>
            </View>
          </View>
        ))}
      </View>
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

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, onPress }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
}) => {
  const { hapticFeedbackEnabled } = useSettings();
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
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Reanimated.View style={[{ flex: 1 }, animatedStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        className="bg-white rounded-lg p-4 border border-gray-200 flex-1"
        activeOpacity={1}
        style={{
          shadowColor: '#BF5700',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mb-3">
          {icon}
        </View>
        <Text className="text-gray-900 font-bold text-base mb-1">{title}</Text>
        <Text className="text-gray-500 text-sm font-medium">{description}</Text>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

// Quick Actions Section Component
const QuickActionsSection = () => {
  const router = useRouter();

  return (
    <View className="px-6 mb-8">
      <View className="mb-4">
        <Text className="text-2xl font-black text-gray-900 mb-1">Quick Actions</Text>
        <Text className="text-gray-500 font-medium">Get started with buying or selling</Text>
      </View>
      
      <View className="flex-row gap-3">
        <QuickActionCard 
          title="Sell Item"
          description="List something"
          icon={<Plus size={18} color="#BF5700" />}
          onPress={() => router.push('/create')}
        />
        <QuickActionCard 
          title="Browse All"
          description="Find deals"
          icon={<Search size={18} color="#BF5700" />}
          onPress={() => router.push('/browse')}
        />
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshKey } = useHomeRefresh();
  const [recentListings, setRecentListings] = useState<Item[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    fetchRecentListings();
  }, []);

  // Listen for refresh triggers from tab press
  useEffect(() => {
    if (refreshKey > 0) {
      fetchRecentListings(false); // Don't show loading spinner for tab refresh
    }
  }, [refreshKey]);

  const fetchRecentListings = async (showLoading = true) => {
    try {
      if (showLoading) {
        setRecentLoading(true);
      }
      
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
    <View style={{ marginRight: 16, width: 180 }}>
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
        
        {/* Quick Actions */}
        <QuickActionsSection />

        {/* Categories */}
        <CategoriesSection />

        {/* Search Section */}
        <SearchSection recentListings={recentListings} />

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
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
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

        {/* Tips Section */}
        <TipsSection />
      </ScrollView>
    </View>
  );
} 