import '../global.css';
import 'expo-dev-client';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Icon } from '@roninoss/icons';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { Link, Stack, Tabs, useRouter, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View, ActivityIndicator, Text } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { cn } from '~/lib/cn';
import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';
import Header from '~/components/Header';
import TabBar from '~/components/TabBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { NotificationSyncProvider } from '../contexts/NotificationSyncContext';
import { UserNotificationProvider } from '../contexts/UserNotificationContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { MessageCountProvider } from '../contexts/MessageCountContext';
import { ListingsProvider } from '../contexts/ListingsContext';
import { useEffect } from 'react';
import WelcomeSlideshow from '../components/features/welcome/WelcomeScreen';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function InitialLayout() {
  const router = useRouter();

  useEffect(() => {
    // Start with the auth flow
    router.replace('/(auth)/login');
  }, []);

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="create" />
        </Stack>
      </SafeAreaView>
    </View>
  );
}

function AuthNavigator() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, check if they completed onboarding
        if (userProfile?.onboard_complete) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } else {
        router.replace('/welcome');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#C1501F" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(modals)"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <MessageCountProvider>
          <NotificationSyncProvider>
            <NotificationProvider>
              <UserNotificationProvider>
                <SettingsProvider>
                  <ListingsProvider>
                    <View className="flex-1">
                      <SafeAreaView className="flex-1" edges={['top']}>
                        <AuthNavigator />
                      </SafeAreaView>
                    </View>
                  </ListingsProvider>
                </SettingsProvider>
              </UserNotificationProvider>
            </NotificationProvider>
          </NotificationSyncProvider>
        </MessageCountProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;

const INDEX_OPTIONS = {
  headerLargeTitle: true,
  title: 'NativeWindUI',
  headerRight: () => <SettingsIcon />,
} as const;

function SettingsIcon() {
  const { colors } = useColorScheme();
  return (
    <Link href="/(modals)/settings" asChild>
      <Pressable className="opacity-80">
        {({ pressed }) => (
          <View className={cn(pressed ? 'opacity-50' : 'opacity-90')}>
            <Icon name="cog-outline" color={colors.foreground} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}
