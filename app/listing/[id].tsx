import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ListingScreen() {
    const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Listing</Text>
      <Text>{id}</Text>
    </View>
  );
}