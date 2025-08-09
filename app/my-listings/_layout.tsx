import { Stack } from 'expo-router';
import ModalHeader from '~/components/ModalHeader';

export default function MyListingsLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ route }) => <ModalHeader title="My Listings" />,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}