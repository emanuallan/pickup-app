import { Stack } from 'expo-router';
import ModalHeader from '~/components/layout/ModalHeader';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ options }) => (
          <ModalHeader
          />
        ),
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
