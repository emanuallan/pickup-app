import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withSpring, runOnJS } from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, UserPlus, CheckCircle } from 'lucide-react-native';
import WelcomeSlideshow from '../../components/WelcomeSlideshow';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3; // 30% of screen width

export default function RegisterScreen() {
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
      return { isValid: false, message: 'Password must contain both uppercase and lowercase letters' };
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
      <View className="flex-1 bg-white justify-center items-center p-6">
        <View className="bg-green-50 border border-green-200 rounded-xl p-8 items-center space-y-6 max-w-sm">
          <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center">
            <CheckCircle size={32} color="#16A34A" strokeWidth={2} />
          </View>
          <Text className="text-2xl font-bold text-green-800 text-center">Welcome to UT Marketplace!</Text>
          <Text className="text-green-700 text-center text-base leading-6 mt-2">
            Account created successfully! Please check your email to verify your account before signing in.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="bg-[#C1501F] rounded-xl px-8 py-4 mt-4"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-lg text-center">
              Go to Sign In
            </Text>
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
                <UserPlus size={40} color="#C1501F" strokeWidth={1.5} />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">Join UT Marketplace</Text>
              <Text className="text-gray-600 text-center text-base">Create your account to start buying and selling</Text>
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
                    editable={!loading}
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
                <Text className="text-gray-500 text-xs">
                  At least 8 characters with uppercase, lowercase, and a number
                </Text>
              </View>

              <View className="space-y-2">
                <Text className="text-gray-700 font-medium text-base">Confirm Password</Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <Lock size={20} color={confirmPasswordError ? '#EF4444' : '#9CA3AF'} />
                  </View>
                  <TextInput
                    className={`border rounded-xl pl-12 pr-12 py-4 bg-gray-50 text-base ${
                      confirmPasswordError ? 'border-red-400' : 'border-gray-300 focus:border-[#C1501F]'
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
                {confirmPasswordError && (
                  <Text className="text-red-500 text-sm font-medium">{confirmPasswordError}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              className={`rounded-xl p-4 mt-6 shadow-sm ${
                loading || emailError || passwordError || confirmPasswordError
                  ? 'bg-gray-400' 
                  : 'bg-[#C1501F] active:bg-[#A0421A]'
              }`}
              onPress={handleRegister}
              disabled={loading || !!emailError || !!passwordError || !!confirmPasswordError}
            >
              {loading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white text-center font-semibold text-lg ml-2">
                    Creating Account...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-center text-xs text-gray-500 mt-4 leading-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 text-base">Already have an account? </Text>
              <TouchableOpacity 
                onPress={() => router.replace('/(auth)/login')}
                disabled={loading}
              >
                <Text className="text-[#C1501F] font-semibold text-base">Sign In</Text>
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