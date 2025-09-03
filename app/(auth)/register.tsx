import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

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
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 3000);
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
        <View className="bg-green-50 border border-green-200 rounded-lg p-6 items-center space-y-4">
          <Text className="text-2xl font-bold text-green-800">Success!</Text>
          <Text className="text-green-700 text-center text-base leading-6">
            Account created successfully! Please check your email to verify your account before signing in.
          </Text>
          <Text className="text-gray-600 text-center text-sm">
            Redirecting to login in a moment...
          </Text>
        </View>
      </View>
    );
  }

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
              <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
              <Text className="text-gray-600 text-center">Join our marketplace community</Text>
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
                  editable={!loading}
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
                  placeholder="Create a strong password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  returnKeyType="next"
                  editable={!loading}
                />
                {passwordError && (
                  <Text className="text-red-500 text-sm font-medium">{passwordError}</Text>
                )}
                <Text className="text-gray-500 text-xs">
                  At least 8 characters with uppercase, lowercase, and a number
                </Text>
              </View>

              <View className="space-y-2">
                <Text className="text-gray-700 font-medium text-base">Confirm Password</Text>
                <TextInput
                  className={`border rounded-lg p-4 bg-gray-50 text-base ${
                    confirmPasswordError ? 'border-red-400' : 'border-gray-300 focus:border-[#C1501F]'
                  }`}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleRegister}
                  editable={!loading}
                />
                {confirmPasswordError && (
                  <Text className="text-red-500 text-sm font-medium">{confirmPasswordError}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              className={`rounded-lg p-4 mt-6 ${
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
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text className="text-[#C1501F] font-semibold text-base">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 