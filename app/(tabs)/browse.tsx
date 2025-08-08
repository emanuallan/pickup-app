import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Dimensions, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '~/lib/supabase';
import { SearchBar } from '~/components/SearchBar';
import CategoryButtons from '~/components/CategoryButtons';
import ListingCard from '~/components/ListingCard';
import FilterModal from '~/components/FilterModal';
import { COLORS } from '~/theme/colors';
import { useSettings } from '~/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SearchX, Package, Lightbulb } from 'lucide-react-native';
import { searchAndRankListings, getFallbackSuggestions, getFallbackSectionTitle } from '~/utils/search';

interface Listing {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  location: string;
  category: string;
  condition: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_image: string | null;
}

interface UserSettings {
  email: string;
  display_name: string | null;
  profile_image_url: string | null;
}

interface UserMap {
  [key: string]: {
    name: string;
    image: string | null;
  };
}

interface Filters {
  sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'relevance';
  priceRange: 'all' | 'under_25' | 'under_50' | 'under_100' | 'under_500' | '500_plus' | 'free';
  timeRange: 'all' | 'today' | 'this_week' | 'this_month' | 'this_year';
  condition: 'all' | 'new' | 'like_new' | 'good' | 'fair';
}

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = (width - 32) / numColumns; // 32 = padding (16 * 2)

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

// Browse Content Component similar to HomeContent
const BrowseContent = ({ searchQuery, searchInputValue, onSearchInputChange, onSearchSubmit, onFilterPress, selectedCategory, onCategoryPress, listings, loading, hasActiveSearch }: {
  searchQuery: string;
  searchInputValue: string;
  onSearchInputChange: (text: string) => void;
  onSearchSubmit: (text: string) => void;
  onFilterPress: () => void;
  selectedCategory: string;
  onCategoryPress: (category: string) => void;
  listings: Listing[];
  loading: boolean;
  hasActiveSearch: boolean;
}) => {
  return (
    <View className="px-6 pb-6 pt-6">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-black text-gray-900 mb-1">
          {hasActiveSearch ? `Search Results` : 'Browse Marketplace'}
        </Text>
        <Text className="text-lg text-gray-600 font-medium">
          {hasActiveSearch 
            ? `Results for "${searchQuery}"` 
            : 'Find great deals from fellow Longhorns'}
        </Text>
      </View>

      {/* Enhanced Search Bar */}
      <SearchBar
        value={searchInputValue}
        onChangeText={onSearchInputChange}
        onSubmit={onSearchSubmit}
        onFilterPress={onFilterPress}
        placeholder="Search items, brands, categories..."
      />

      {/* Results Summary */}
      {!loading && (
        <View className="mt-4 mb-2">
          <Text className="text-base font-bold text-gray-900">
            {listings.length} {listings.length === 1 ? 'item' : 'items'} found
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {hasActiveSearch && ` for "${searchQuery}"`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default function BrowseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { hapticFeedbackEnabled } = useSettings();
  const [searchQuery, setSearchQuery] = useState(params.q?.toString() || ''); // Actual search query used for filtering
  const [searchInputValue, setSearchInputValue] = useState(params.q?.toString() || ''); // What user types in search bar
  const [selectedCategory, setSelectedCategory] = useState(params.category?.toString() || 'All');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'newest',
    priceRange: 'all',
    timeRange: 'all',
    condition: 'all',
  });
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [displayListings, setDisplayListings] = useState<Listing[]>([]);
  const [fallbackSuggestions, setFallbackSuggestions] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllListings();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [selectedCategory, filters, searchQuery, allListings]);

  const fetchAllListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_sold', false)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user settings for all unique user_ids
      const userIds = [...new Set((data || []).map(l => l.user_id))];
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('email, display_name, profile_image_url')
        .in('email', userIds);

      const userMap: UserMap = {};
      (userSettings || []).forEach((u: UserSettings) => {
        userMap[u.email] = {
          name: u.display_name || u.email,
          image: u.profile_image_url || null,
        };
      });

      const listingsWithUser = (data || []).map(listing => ({
        ...listing,
        user_name: userMap[listing.user_id]?.name || listing.user_id,
        user_image: userMap[listing.user_id]?.image || null,
      }));

      setAllListings(listingsWithUser);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filteredListings = [...allListings];

    // Apply category filter
    if (selectedCategory !== 'All') {
      filteredListings = filteredListings.filter(listing => 
        listing.category === selectedCategory
      );
    }

    // Apply price range filter
    switch (filters.priceRange) {
      case 'free':
        filteredListings = filteredListings.filter(l => l.price === 0);
        break;
      case 'under_25':
        filteredListings = filteredListings.filter(l => l.price < 25);
        break;
      case 'under_50':
        filteredListings = filteredListings.filter(l => l.price < 50);
        break;
      case 'under_100':
        filteredListings = filteredListings.filter(l => l.price < 100);
        break;
      case 'under_500':
        filteredListings = filteredListings.filter(l => l.price < 500);
        break;
      case '500_plus':
        filteredListings = filteredListings.filter(l => l.price >= 500);
        break;
    }

    // Apply time range filter
    const now = new Date();
    switch (filters.timeRange) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        filteredListings = filteredListings.filter(l => 
          l.created_at.startsWith(today)
        );
        break;
      case 'this_week':
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredListings = filteredListings.filter(l => 
          new Date(l.created_at) >= lastWeek
        );
        break;
      case 'this_month':
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredListings = filteredListings.filter(l => 
          new Date(l.created_at) >= lastMonth
        );
        break;
      case 'this_year':
        const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredListings = filteredListings.filter(l => 
          new Date(l.created_at) >= lastYear
        );
        break;
    }

    // Apply condition filter (assuming condition field exists in listings)
    if (filters.condition !== 'all' && filteredListings[0]?.condition) {
      filteredListings = filteredListings.filter(l => 
        l.condition?.toLowerCase() === filters.condition
      );
    }

    // Apply search with ranking if there's a search query
    if (searchQuery.trim()) {
      const searchResults = searchAndRankListings(filteredListings, searchQuery);
      filteredListings = searchResults;
      
      // Always get fallback suggestions when searching
      const fallbacks = getFallbackSuggestions(searchQuery, searchResults, allListings, 6);
      console.log('Fallback suggestions found:', fallbacks.length, 'for query:', searchQuery);
      console.log('All listings count:', allListings.length);
      console.log('Search results count:', searchResults.length);
      setFallbackSuggestions(fallbacks);
    } else {
      // Apply regular sort if no search query
      switch (filters.sortBy) {
        case 'relevance':
        case 'newest':
          filteredListings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'oldest':
          filteredListings.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'price_low':
          filteredListings.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          filteredListings.sort((a, b) => b.price - a.price);
          break;
      }
      setFallbackSuggestions([]); // Clear fallback suggestions when not searching
    }

    setDisplayListings(filteredListings);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllListings();
  };

  const handleSearchSubmit = (text: string) => {
    setSearchQuery(text.trim());
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleCategoryPress = (category: string) => {
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(category);
  };

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.utOrange}
          />
        }
      >
        {/* Browse Content Header */}
        <BrowseContent
          searchQuery={searchQuery}
          searchInputValue={searchInputValue}
          onSearchInputChange={setSearchInputValue}
          onSearchSubmit={handleSearchSubmit}
          onFilterPress={() => setShowFilters(true)}
          selectedCategory={selectedCategory}
          onCategoryPress={handleCategoryPress}
          listings={displayListings}
          loading={loading}
          hasActiveSearch={!!searchQuery.trim()}
        />

        {/* Categories Section */}
        <View className="mb-8">
          <View className="px-6 mb-4">
            <Text className="text-2xl font-black text-gray-900 mb-1">Categories</Text>
            <Text className="text-gray-500 font-medium">Browse by category</Text>
          </View>
          
          <CategoryButtons
            selectedCategory={selectedCategory}
            onCategoryPress={handleCategoryPress}
          />
        </View>

        {/* Listings Section */}
        <View className="px-6">
          <View className="mb-4">
            <Text className="text-2xl font-black text-gray-900 mb-1">All Listings</Text>
            <Text className="text-gray-500 font-medium">
              {loading ? 'Loading...' : `${displayListings.length} items available`}
            </Text>
          </View>

          {loading ? (
            <View className="py-16">
              <ActivityIndicator size="large" color={COLORS.utOrange} />
              <Text className="text-center text-gray-500 mt-4 font-medium">Loading listings...</Text>
            </View>
          ) : displayListings.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
              {displayListings.map((item) => (
                <View key={item.id} style={{ width: itemWidth, paddingHorizontal: 8, marginBottom: 16 }}>
                  <ListingCard
                    {...item}
                    timePosted={getTimeAgo(item.created_at)}
                    user={{
                      name: item.user_name,
                      image: item.user_image,
                    }}
                    onPress={() => router.push(`/listing/${item.id}`)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-lg p-8 items-center border border-gray-200"
              style={{
                shadowColor: '#BF5700',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
                {searchQuery.trim() || selectedCategory !== 'All' ? (
                  <SearchX size={32} color="#9CA3AF" />
                ) : (
                  <Package size={32} color="#9CA3AF" />
                )}
              </View>
              <Text className="text-gray-700 text-center font-bold text-lg mb-2">
                {searchQuery.trim() || selectedCategory !== 'All' ? 'No items found' : 'No listings yet'}
              </Text>
              <Text className="text-gray-500 text-center font-medium">
                {searchQuery.trim() || selectedCategory !== 'All' 
                  ? 'But check out these suggestions below!' 
                  : 'Be the first to list something!'}
              </Text>
            </View>
          )}
        </View>

        {/* Fallback Suggestions Section - Shows after main search results OR when no results found */}
        {searchQuery.trim() && fallbackSuggestions.length > 0 && (
          <View className="px-6 mt-8">
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
                  <Lightbulb size={16} color="#3B82F6" />
                </View>
                <Text className="text-xl font-black text-gray-900">
                  Couldn&apos;t find more?
                </Text>
              </View>
              <Text className="text-gray-500 font-medium ml-11">
                {getFallbackSectionTitle(searchQuery, fallbackSuggestions)}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
              {fallbackSuggestions.map((item) => (
                <View key={`fallback-${item.id}`} style={{ width: itemWidth, paddingHorizontal: 8, marginBottom: 16 }}>
                  <ListingCard
                    {...item}
                    timePosted={getTimeAgo(item.created_at)}
                    user={{
                      name: item.user_name,
                      image: item.user_image,
                    }}
                    onPress={() => router.push(`/listing/${item.id}`)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </View>
  );
} 