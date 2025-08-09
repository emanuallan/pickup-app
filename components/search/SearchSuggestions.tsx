import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Search, TrendingUp } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSettings } from '~/contexts/SettingsContext';

interface SearchSuggestionsProps {
  suggestions: string[];
  visible: boolean;
  onSuggestionPress: (suggestion: string) => void;
  onClose: () => void;
}

const SuggestionItem = ({ suggestion, onPress }: {
  suggestion: string;
  onPress: (suggestion: string) => void;
}) => {
  const { hapticFeedbackEnabled } = useSettings();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(0.8, { damping: 15, stiffness: 400 });
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Reanimated.View style={animatedStyle}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(suggestion)}
        className="flex-row items-center px-4 py-3 border-b border-gray-100"
      >
        <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center mr-3">
          <Search size={14} color="#9CA3AF" />
        </View>
        <Text className="flex-1 text-gray-700 font-medium text-base">
          {suggestion}
        </Text>
        <TrendingUp size={14} color="#BF5700" />
      </TouchableOpacity>
    </Reanimated.View>
  );
};

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  visible,
  onSuggestionPress,
  onClose,
}) => {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <View 
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200"
      style={{
        shadowColor: '#BF5700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 1000,
        zIndex: 1000,
        maxHeight: 250,
      }}
    >
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-gray-600 text-sm font-semibold">
          Search Suggestions
        </Text>
      </View>

      {/* Suggestions List - Using ScrollView instead of FlatList to avoid nesting issues */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        style={{ maxHeight: 200 }}
      >
        {suggestions.map((suggestion, index) => (
          <SuggestionItem 
            key={`suggestion-${index}`}
            suggestion={suggestion} 
            onPress={onSuggestionPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};