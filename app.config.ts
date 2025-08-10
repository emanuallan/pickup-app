import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'UT Marketplace',
  slug: 'ut-marketplace',
  scheme: 'ut-marketplace',
  version: '1.0.0',
  owner: 'austin616',
  projectId: 'b88c6cfb-b498-4c87-94da-1be910d7b883',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.utmarketplace.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.utmarketplace.app'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    [
      'expo-dev-launcher',
      {
        launchMode: 'most-recent'
      }
    ],
    'expo-web-browser',
    [
      'expo-notifications',
      {
        icon: './assets/icons/ios-light.png',
        color: '#BF5700'
      }
    ]
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'b88c6cfb-b498-4c87-94da-1be910d7b883'
    }
  },
}); 