import { View, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { supabase } from '~/lib/supabase';
import { AnimatedButton } from '~/components/AnimatedButton';
import { LiveTicker } from '~/components/LiveTicker';
import { HeroSection } from '~/components/HeroSection';
import { CategoriesSection } from '~/components/CategoriesSection';
import { TrustBadge } from '~/components/TrustBadge';
import { RecentListingsSection } from '~/components/RecentListingsSection';
import { HomeSearchBar } from '~/components/HomeSearchBar';

interface Item {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
}

export default function HomeScreen() {
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
          location: item.location
        })));
      }
    } catch (error) {
      console.error('Error fetching recent listings:', error);
    } finally {
      setRecentLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#fafafa' }}>
      {/* Enhanced Search Bar */}
      <HomeSearchBar />

      {/* Live Ticker */}
      <LiveTicker />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Section */}
        <HeroSection />

        {/* Categories */}
        <CategoriesSection />

        {/* Recent Listings */}
        <RecentListingsSection 
          recentListings={recentListings}
          recentLoading={recentLoading}
        />

        {/* Trust Badge */}
        <TrustBadge />
      </ScrollView>
    </View>
  );
} 