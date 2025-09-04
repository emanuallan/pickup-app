import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '~/theme/colors';
import { useAuth } from '~/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '~/lib/supabase';
import { 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Camera, 
  DollarSign, 
  Tag, 
  Users, 
  TrendingUp,
  Eye,
  Heart,
  Star,
  Sparkles,
  Zap
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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

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
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle rotation
    Animated.loop(
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
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

  const spin = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View 
              className="mx-4 mt-4 rounded-3xl overflow-hidden"
              style={{
                backgroundColor: 'linear-gradient(135deg, #C1501F 0%, #E67E22 100%)',
              }}
            >
              {/* Gradient Background */}
              <View 
                className="p-8"
                style={{
                  background: 'linear-gradient(135deg, #C1501F 0%, #E67E22 100%)',
                  backgroundColor: COLORS.utOrange,
                }}
              >
                <View className="items-center mb-8">
                  {/* Animated Sparkle Icon */}
                  <View className="relative">
                    <Animated.View
                      style={{
                        transform: [{ rotate: spin }, { scale: pulseAnim }],
                      }}
                    >
                      <View 
                        className="w-20 h-20 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        <Sparkles size={40} color="white" strokeWidth={2} />
                      </View>
                    </Animated.View>
                    
                    {/* Floating icons around main icon */}
                    <Animated.View 
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full items-center justify-center"
                      style={{
                        transform: [{ scale: pulseAnim }],
                        shadowColor: COLORS.utOrange,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <Camera size={14} color={COLORS.utOrange} />
                    </Animated.View>
                    
                    <Animated.View 
                      className="absolute -bottom-1 -left-3 w-8 h-8 bg-white rounded-full items-center justify-center"
                      style={{
                        transform: [{ scale: pulseAnim }],
                        shadowColor: COLORS.utOrange,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <DollarSign size={14} color={COLORS.utOrange} />
                    </Animated.View>
                  </View>
                  
                  <Text className="text-3xl font-bold mt-6 text-white text-center">
                    Create & Sell
                  </Text>
                  <Text className="text-white/90 text-center mt-3 text-lg leading-6">
                    Turn your items into cash with the UT community
                  </Text>
                </View>

                {user ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
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
                      <Zap size={22} color={COLORS.utOrange} strokeWidth={2} />
                      <Text className="font-bold text-lg ml-2" style={{ color: COLORS.utOrange }}>
                        Start Selling Now
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
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
          </Animated.View>

          {/* Features Section */}
          {user && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <View className="mx-4 mt-6 bg-white rounded-3xl p-6 shadow-sm">
                <Text className="text-xl font-bold text-center mb-6 text-gray-900">
                  Why sell with us?
                </Text>
                <View className="flex-row justify-around">
                  <View className="items-center flex-1">
                    <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-3">
                      <Eye size={20} color="#10B981" />
                    </View>
                    <Text className="font-semibold text-gray-900 text-center">High Visibility</Text>
                    <Text className="text-gray-500 text-xs text-center mt-1">Reach thousands</Text>
                  </View>
                  <View className="items-center flex-1">
                    <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-3">
                      <Heart size={20} color="#3B82F6" />
                    </View>
                    <Text className="font-semibold text-gray-900 text-center">Trusted Community</Text>
                    <Text className="text-gray-500 text-xs text-center mt-1">UT students only</Text>
                  </View>
                  <View className="items-center flex-1">
                    <View className="w-12 h-12 bg-purple-50 rounded-full items-center justify-center mb-3">
                      <TrendingUp size={20} color="#8B5CF6" />
                    </View>
                    <Text className="font-semibold text-gray-900 text-center">Quick Sales</Text>
                    <Text className="text-gray-500 text-xs text-center mt-1">Sell faster</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* My Listings Section */}
          {user && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
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
                        router.push('/(tabs)/my-listings');
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
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <View className="w-16 h-16 bg-orange-50 rounded-full items-center justify-center mb-4">
                        <ActivityIndicator size="large" color={COLORS.utOrange} />
                      </View>
                    </Animated.View>
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
                          router.push('/(tabs)/my-listings');
                        }}
                        className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 mt-4 flex-row items-center justify-center"
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
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                        <Plus size={32} color="#9CA3AF" strokeWidth={1.5} />
                      </View>
                    </Animated.View>
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
                      <Sparkles size={18} color={COLORS.utOrange} />
                      <Text style={{ color: COLORS.utOrange }} className="font-bold ml-2 text-base">
                        Create your first listing
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </ScrollView>
    </View>
  );
}