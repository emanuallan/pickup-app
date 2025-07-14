import { Stack } from 'expo-router';
import ModalHeader from '~/components/ModalHeader';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ route }) => (
          <ModalHeader
            title={route.name === '[id]' ? 'You are viewing your own listing' : 'Edit Listing'}
          />
        ),
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
