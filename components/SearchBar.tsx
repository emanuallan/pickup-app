import React from 'react';
import { View, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSettings } from '~/contexts/SettingsContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onFilterPress,
  placeholder = "What are you looking for?",
}) => {
  const { hapticFeedbackEnabled } = useSettings();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const filterScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const filterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterScale.value }],
  }));

  const handleSearchPressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSearchPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleFilterPressIn = () => {
    filterScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleFilterPressOut = () => {
    filterScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-3">
        <Reanimated.View style={[{ flex: 1 }, animatedStyle]}>
          <Pressable
            onPressIn={handleSearchPressIn}
            onPressOut={handleSearchPressOut}
            className="bg-white rounded-lg p-4 flex-row items-center border border-gray-200"
            style={{
              shadowColor: '#BF5700',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base font-medium"
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={onChangeText}
              onSubmitEditing={() => onSubmit(value)}
              returnKeyType="search"
              blurOnSubmit={false}
            />
          </Pressable>
        </Reanimated.View>
        
        <Reanimated.View style={filterAnimatedStyle}>
          <Pressable
            onPressIn={handleFilterPressIn}
            onPressOut={handleFilterPressOut}
            onPress={onFilterPress}
            className="bg-white rounded-lg p-4 border border-gray-200"
            style={{
              shadowColor: '#BF5700',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <SlidersHorizontal size={20} color="#BF5700" />
          </Pressable>
        </Reanimated.View>
      </View>
    </View>
  );
}; 