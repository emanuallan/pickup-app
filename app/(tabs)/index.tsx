import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Item {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
}

// Temporary data for demonstration
const categories: Category[] = [
  { id: 1, name: 'Textbooks', icon: '📚' },
  { id: 2, name: 'Electronics', icon: '📱' },
  { id: 3, name: 'Furniture', icon: '🪑' },
  { id: 4, name: 'Clothing', icon: '👕' },
  { id: 5, name: 'Housing', icon: '🏠' },
  { id: 6, name: 'Services', icon: '🔧' },
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

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      className="items-center mr-4"
      onPress={() => router.push({
        pathname: '/browse',
        params: { category: item.name }
      })}
    >
      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-2">
        <Text className="text-2xl">{item.icon}</Text>
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
          <Text className="text-[#C1501F] font-bold">${item.price}</Text>
          <Text className="text-gray-500 text-sm">{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {/* Search Bar */}
      <TouchableOpacity 
        className="mx-4 mt-2 mb-4 flex-row items-center bg-gray-100 rounded-full px-4 py-2"
        onPress={() => router.push('/browse')}
      >
        <Search size={20} color="#666" />
        <Text className="ml-2 text-gray-500">Search items...</Text>
      </TouchableOpacity>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center px-4 mb-4">
            <Text className="text-lg font-bold text-gray-900">Categories</Text>
            <TouchableOpacity onPress={() => router.push('/browse')}>
              <Text className="text-[#C1501F]">See All</Text>
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
              <Text className="text-[#C1501F]">See All</Text>
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
              <Text className="text-[#C1501F]">See All</Text>
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
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-20 right-4 w-14 h-14 bg-[#C1501F] rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/browse')}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
} 