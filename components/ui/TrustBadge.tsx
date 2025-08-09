import { View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

export const TrustBadge = () => {
  return (
    <View className="px-6 mb-8">
      <View
        style={{
          backgroundColor: '#ecfdf5',
          borderRadius: 16,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#a7f3d0',
        }}
      >
        <ShieldCheck size={24} color="#059669" />
        <Text style={{ color: '#065f46', fontWeight: '700', fontSize: 16, marginLeft: 12 }}>
          Verified UT Students Only
        </Text>
      </View>
    </View>
  );
}; 