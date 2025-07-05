import { Icon } from '@roninoss/icons';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform, View, Text } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';

export default function ModalScreen() {
  const { colors, colorScheme } = useColorScheme();
  return (
    <>
      <StatusBar
        style={Platform.OS === 'ios' ? 'light' : colorScheme === 'dark' ? 'light' : 'dark'}
      />
      <View className="flex-1 items-center justify-center gap-1 px-12">
        <Icon name="file-plus-outline" size={42} color={colors.grey} />
        <Text className="pb-1 text-center font-semibold">
          NativeWindUI
        </Text>
        <Text className="pb-4 text-center">
          You can install any of the free components from the{' '}
          <Text
            onPress={() => Linking.openURL('https://nativewindui.com')}
            className="text-primary">
            NativeWindUI
          </Text>
          {' website.'}
        </Text>
      </View>
    </>
  );
}
