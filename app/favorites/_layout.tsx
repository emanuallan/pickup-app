import { Stack } from 'expo-router';
import ModalHeader from '~/components/layout/ModalHeader';
export default function FavoritesLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ route }) => <ModalHeader title={route.name === 'favorites' ? 'Favorites' : 'Watchlist'} />,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="[type]" />
    </Stack>
  );
}