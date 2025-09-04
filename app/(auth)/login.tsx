import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withSpring, runOnJS } from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import WelcomeSlideshow from '../../components/WelcomeSlideshow';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3; // 30% of screen width

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  // Animation values
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(null);
    setError(null);
    if (text && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(null);
    setError(null);
    if (text && text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    }
  };

  const goBack = () => {
    // Use router.back() instead of replace to avoid the slide-in animation
    router.back();
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      // Reset any ongoing animations
      translateX.value = 0;
      opacity.value = 1;
    },
    onActive: (event) => {
      // Only allow rightward swipes (positive translationX)
      if (event.translationX > 0) {
        translateX.value = event.translationX;
        // Fade out slightly as user swipes
        opacity.value = Math.max(0.7, 1 - (event.translationX / screenWidth) * 0.3);
      }
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      
      // Check if swipe meets threshold
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        // Animate off screen and navigate
        translateX.value = withSpring(screenWidth, { damping: 20, stiffness: 300 }, () => {
          runOnJS(goBack)();
        });
        opacity.value = withSpring(0, { damping: 20, stiffness: 300 });
      } else {
        // Spring back to original position
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  const handleLogin = async () => {
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validation
    let hasErrors = false;
    
    if (!email.trim()) {
      setEmailError('Email is required');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }

    if (hasErrors) return;

    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Background slideshow that shows during swipe */}
      <View 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
        }}
      >
        <WelcomeSlideshow />
      </View>
      
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <KeyboardAvoidingView 
            className="flex-1 bg-white" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              className="flex-1" 
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
        <View className="flex-1 p-6 justify-center min-h-screen">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.replace('/welcome')}
            className="absolute top-12 left-6 z-10 flex-row items-center"
          >
            <ChevronLeft size={24} color="#C1501F" />
            <Text className="font-semibold text-lg ml-1" style={{ color: '#C1501F' }}>
              Back
            </Text>
          </TouchableOpacity>

          <View className="space-y-6">
            {/* Header with Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-orange-50 rounded-full items-center justify-center mb-6">
                <ShieldCheck size={40} color="#C1501F" strokeWidth={1.5} />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
              <Text className="text-gray-600 text-center text-base">Sign in to your UT Marketplace account</Text>
            </View>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <Text className="text-red-700 text-center font-medium">{error}</Text>
              </View>
            )}

            <View className="space-y-4">
              <View className="space-y-2">
                <Text className="text-gray-700 font-medium text-base">Email Address</Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <Mail size={20} color={emailError ? '#EF4444' : '#9CA3AF'} />
                  </View>
                  <TextInput
                    className={`border rounded-xl pl-12 pr-4 py-4 bg-gray-50 text-base ${
                      emailError ? 'border-red-400' : 'border-gray-300 focus:border-[#C1501F]'
                    }`}
                    placeholder="Enter your email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleEmailChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    editable={!isLoading}
                  />
                </View>
                {emailError && (
                  <Text className="text-red-500 text-sm font-medium">{emailError}</Text>
                )}
              </View>

              <View className="space-y-2">
                <Text className="text-gray-700 font-medium text-base">Password</Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <Lock size={20} color={passwordError ? '#EF4444' : '#9CA3AF'} />
                  </View>
                  <TextInput
                    className={`border rounded-xl pl-12 pr-12 py-4 bg-gray-50 text-base ${
                      passwordError ? 'border-red-400' : 'border-gray-300 focus:border-[#C1501F]'
                    }`}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordError && (
                  <Text className="text-red-500 text-sm font-medium">{passwordError}</Text>
                )}
              </View>

              <TouchableOpacity
                className="self-end mt-2"
                onPress={() => Alert.alert('Forgot Password', 'This feature will be implemented soon.')}
                disabled={isLoading}
              >
                <Text className="text-[#C1501F] font-medium">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`rounded-xl p-4 mt-6 shadow-sm ${
                isLoading || emailError || passwordError 
                  ? 'bg-gray-400' 
                  : 'bg-[#C1501F] active:bg-[#A0421A]'
              }`}
              onPress={handleLogin}
              disabled={isLoading || !!emailError || !!passwordError}
            >
              {isLoading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white text-center font-semibold text-lg ml-2">
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 text-base">Don&apos;t have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.replace('/(auth)/register')}
                disabled={isLoading}
              >
                <Text className="text-[#C1501F] font-semibold text-base">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
            </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}