import { memo } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { MessageCircle, Search, Bell, Settings } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';
import Logo from '../assets/utmplogo.png'

function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const renderLeftSide = () => {
    if (pathname === '/profile') {
      return (
        <View className="flex-row items-center">
          <Text className="text-xl font-bold">My Profile</Text>
        </View>
      );
    }

    return (
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => router.push('/')}>
          <Image source={Logo} className="w-14 h-14" />
        </TouchableOpacity>
      </View>
    );
  };

  const getHeaderIcons = () => {
    switch (pathname) {
      case '/':
        return (
          <>
            <TouchableOpacity onPress={() => router.push('/browse')} className="p-1">
              <Search size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/messages')} className="p-1">
              <MessageCircle size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')} className="p-1">
              <Bell size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
          </>
        );
      
      case '/profile':
        return (
          <>
            <TouchableOpacity onPress={() => router.push('/messages')}>
              <MessageCircle size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(modals)/settings')}>
              <Settings size={24} color="black" strokeWidth={1.5} />
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  // Don't show header on modal screens
  if (pathname.startsWith('/(modals)')) {
    return null;
  }

  return (
    <View className="border-b border-gray-100 bg-white">
      <View className="flex-row items-center justify-between px-4 h-12">
        {renderLeftSide()}
        <View className="flex-row items-center gap-5">
          {getHeaderIcons()}
        </View>
      </View>
    </View>
  );
}
// Memoize the header to prevent unnecessary re-renders
export default memo(Header);
