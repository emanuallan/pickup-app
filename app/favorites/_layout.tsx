import { Stack } from 'expo-router';
import ModalHeader from '~/components/ModalHeader';

export default function FavoritesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ route }) => {
          // Determine title based on route param
          const type = route.params?.type || route.name || 'favorite';
          const title = type === 'watchlist' ? 'Watchlist' : 'Favorites';
          return <ModalHeader title={title} />;
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="[type]" />
    </Stack>
  );
}