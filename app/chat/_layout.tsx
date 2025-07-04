import { Stack } from 'expo-router';
import ModalHeader from '~/components/ModalHeader';
export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true, header: () => <ModalHeader title="Chat" />
        }}
      />
    </Stack>
  );
} 