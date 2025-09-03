import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

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
          <View className="space-y-6">
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
              <Text className="text-gray-600 text-center">Sign in to your account to continue</Text>
            </View>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <Text className="text-red-700 text-center font-medium">{error}</Text>
              </View>
            )}

            <View className="space-y-4">
              <View className="space-y-2">
                <Text className="text-gray-700 font-medium text-base">Email Address</Text>
                <TextInput
                  className={`border rounded-lg p-4 bg-gray-50 text-base ${
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
                {emailError && (
                  <Text className="text-red-500 text-sm font-medium">{emailError}</Text>
                )}
              </View>

              <View className="space-y-2">
                <Text className="text-gray-700 font-medium text-base">Password</Text>
                <TextInput
                  className={`border rounded-lg p-4 bg-gray-50 text-base ${
                    passwordError ? 'border-red-400' : 'border-gray-300 focus:border-[#C1501F]'
                  }`}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  editable={!isLoading}
                />
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
              className={`rounded-lg p-4 mt-6 ${
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
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text className="text-[#C1501F] font-semibold text-base">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}