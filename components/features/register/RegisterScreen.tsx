import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useAuth } from '~/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, UserPlus, CheckCircle } from 'lucide-react-native';
import { WelcomeScreen as WelcomeSlideshow } from '~/components/features/welcome/WelcomeScreen';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3; // 30% of screen width

export const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  // Animation values
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain both uppercase and lowercase letters',
      };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
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
    if (text) {
      const validation = validatePassword(text);
      if (!validation.isValid) {
        setPasswordError(validation.message!);
      }
    }
    // Re-validate confirm password if it exists
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword && text === confirmPassword) {
      setConfirmPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError(null);
    setError(null);
    if (text && password && text !== password) {
      setConfirmPasswordError('Passwords do not match');
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

  const handleRegister = async () => {
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

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
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.message!);
        hasErrors = true;
      }
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasErrors = true;
    }

    if (hasErrors) return;

    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email.trim(), password);
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setShowSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <View className="max-w-sm items-center space-y-6 rounded-xl border border-green-200 bg-green-50 p-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={32} color="#16A34A" strokeWidth={2} />
          </View>
          <Text className="text-center text-2xl font-bold text-green-800">
            Welcome to UT Marketplace!
          </Text>
          <Text className="mt-2 text-center text-base leading-6 text-green-700">
            Account created successfully! Please check your email to verify your account before
            signing in.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="mt-4 rounded-xl bg-[#C1501F] px-8 py-4"
            activeOpacity={0.8}>
            <Text className="text-center text-lg font-semibold text-white">Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        }}>
        <WelcomeSlideshow />
      </View>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <KeyboardAvoidingView
            className="flex-1 bg-white"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled">
              <View className="min-h-screen flex-1 justify-center p-6">
                {/* Back Button */}
                <TouchableOpacity
                  onPress={() => router.replace('/welcome')}
                  className="absolute left-6 top-12 z-10 flex-row items-center">
                  <ChevronLeft size={24} color="#C1501F" />
                  <Text className="ml-1 text-lg font-semibold" style={{ color: '#C1501F' }}>
                    Back
                  </Text>
                </TouchableOpacity>

                <View className="space-y-6">
                  {/* Header with Icon */}
                  <View className="mb-8 items-center">
                    <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                      <UserPlus size={40} color="#C1501F" strokeWidth={1.5} />
                    </View>
                    <Text className="mb-2 text-3xl font-bold text-gray-900">
                      Join UT Marketplace
                    </Text>
                    <Text className="text-center text-base text-gray-600">
                      Create your account to start buying and selling
                    </Text>
                  </View>

                  {error && (
                    <View className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                      <Text className="text-center font-medium text-red-700">{error}</Text>
                    </View>
                  )}

                  <View className="space-y-4">
                    <View className="space-y-2">
                      <Text className="text-base font-medium text-gray-700">Email Address</Text>
                      <View className="relative">
                        <View className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
                          <Mail size={20} color={emailError ? '#EF4444' : '#9CA3AF'} />
                        </View>
                        <TextInput
                          className={`rounded-xl border bg-gray-50 py-4 pl-12 pr-4 text-base ${
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
                          editable={!loading}
                        />
                      </View>
                      {emailError && (
                        <Text className="text-sm font-medium text-red-500">{emailError}</Text>
                      )}
                    </View>

                    <View className="space-y-2">
                      <Text className="text-base font-medium text-gray-700">Password</Text>
                      <View className="relative">
                        <View className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
                          <Lock size={20} color={passwordError ? '#EF4444' : '#9CA3AF'} />
                        </View>
                        <TextInput
                          className={`rounded-xl border bg-gray-50 py-4 pl-12 pr-12 text-base ${
                            passwordError
                              ? 'border-red-400'
                              : 'border-gray-300 focus:border-[#C1501F]'
                          }`}
                          placeholder="Create a strong password"
                          placeholderTextColor="#9CA3AF"
                          value={password}
                          onChangeText={handlePasswordChange}
                          secureTextEntry={!showPassword}
                          returnKeyType="next"
                          editable={!loading}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                          {showPassword ? (
                            <EyeOff size={20} color="#9CA3AF" />
                          ) : (
                            <Eye size={20} color="#9CA3AF" />
                          )}
                        </TouchableOpacity>
                      </View>
                      {passwordError && (
                        <Text className="text-sm font-medium text-red-500">{passwordError}</Text>
                      )}
                      <Text className="text-xs text-gray-500">
                        At least 8 characters with uppercase, lowercase, and a number
                      </Text>
                    </View>

                    <View className="space-y-2">
                      <Text className="text-base font-medium text-gray-700">Confirm Password</Text>
                      <View className="relative">
                        <View className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
                          <Lock size={20} color={confirmPasswordError ? '#EF4444' : '#9CA3AF'} />
                        </View>
                        <TextInput
                          className={`rounded-xl border bg-gray-50 py-4 pl-12 pr-12 text-base ${
                            confirmPasswordError
                              ? 'border-red-400'
                              : 'border-gray-300 focus:border-[#C1501F]'
                          }`}
                          placeholder="Confirm your password"
                          placeholderTextColor="#9CA3AF"
                          value={confirmPassword}
                          onChangeText={handleConfirmPasswordChange}
                          secureTextEntry={!showConfirmPassword}
                          returnKeyType="go"
                          onSubmitEditing={handleRegister}
                          editable={!loading}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                          {showConfirmPassword ? (
                            <EyeOff size={20} color="#9CA3AF" />
                          ) : (
                            <Eye size={20} color="#9CA3AF" />
                          )}
                        </TouchableOpacity>
                      </View>
                      {confirmPasswordError && (
                        <Text className="text-sm font-medium text-red-500">
                          {confirmPasswordError}
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    className={`mt-6 rounded-xl p-4 shadow-sm ${
                      loading || emailError || passwordError || confirmPasswordError
                        ? 'bg-gray-400'
                        : 'bg-[#C1501F] active:bg-[#A0421A]'
                    }`}
                    onPress={handleRegister}
                    disabled={loading || !!emailError || !!passwordError || !!confirmPasswordError}>
                    {loading ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator color="white" size="small" />
                        <Text className="ml-2 text-center text-lg font-semibold text-white">
                          Creating Account...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-center text-lg font-semibold text-white">
                        Create Account
                      </Text>
                    )}
                  </TouchableOpacity>

                  <Text className="mt-4 text-center text-xs leading-4 text-gray-500">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                  </Text>

                  <View className="mt-6 flex-row justify-center">
                    <Text className="text-base text-gray-600">Already have an account? </Text>
                    <TouchableOpacity
                      onPress={() => router.replace('/(auth)/login')}
                      disabled={loading}>
                      <Text className="text-base font-semibold text-[#C1501F]">Sign In</Text>
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
};
