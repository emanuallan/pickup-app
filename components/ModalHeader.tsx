import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ModalHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export default function ModalHeader({ 
  title, 
  showBackButton = true 
}: ModalHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
      {showBackButton && (
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#C1501F" />
        </TouchableOpacity>
      )}
      {title && (
        <Text className="flex-1 text-lg font-semibold text-center">
          {title}
        </Text>
      )}
      {/* Add empty View to maintain center alignment when back button is shown */}
      {showBackButton && <View className="w-8" />}
    </View>
  );
} 