import { Stack } from 'expo-router';
import ModalHeader from '~/components/ModalHeader';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ route }) => <ModalHeader title={route.name === '[id]' ? 'Listing' : 'Create'} />,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
} 