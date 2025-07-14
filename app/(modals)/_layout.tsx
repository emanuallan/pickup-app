import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="settings" />
      <Stack.Screen name="notifications" />
      {/* <Stack.Screen name="chat/[id]" /> */}
    </Stack>
  );
} 