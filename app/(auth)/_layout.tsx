import { Stack } from 'expo-router';
import { View } from 'react-native';
import ModalHeader from '~/components/layout/ModalHeader';

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-white">
      <Stack screenOptions={{ headerShown: true, header: () => <ModalHeader /> }} />
    </View>
  );
} 