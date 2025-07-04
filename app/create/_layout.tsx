import { Stack } from 'expo-router';
import ModalHeader from '~/components/ModalHeader';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ route }) => <ModalHeader title={route.name === 'photos' ? 'Add Photos' : 
          route.name === 'details' ? 'Item Details' : 
          route.name === 'confirm' ? 'Review Listing' : 'Create'} />,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="photos" 
        options={{
          title: 'Add Photos'
        }}
      />
      <Stack.Screen 
        name="details" 
        options={{
          title: 'Item Details'
        }}
      />
      <Stack.Screen 
        name="confirm" 
        options={{
          title: 'Review Listing'
        }}
      />
    </Stack>
  );
} 