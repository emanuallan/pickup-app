import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSettings } from '~/contexts/SettingsContext';
import { SearchSuggestions } from '~/components/search/SearchSuggestions';
import { useDebounce } from '~/hooks/useDebounce';
import { getSearchSuggestions } from '~/utils/search';

interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  created_at: string;
  user_name: string;
  [key: string]: any;
}

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
  listings?: Listing[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onFilterPress,
  placeholder = "What are you looking for?",
  listings = [],
}) => {
  const { hapticFeedbackEnabled } = useSettings();
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedValue = useDebounce(value, 300);
  
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

  // Generate search suggestions based on debounced input
  useEffect(() => {
    if (debouncedValue.trim() && focused && listings.length > 0) {
      const newSuggestions = getSearchSuggestions(debouncedValue, listings);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue, focused, listings]);

  const handleSuggestionPress = (suggestion: string) => {
    onChangeText(suggestion);
    onSubmit(suggestion);
    setSuggestions([]);
    setFocused(false);
  };

  const handleFocus = () => {
    setFocused(true);
    if (value.trim() && listings.length > 0) {
      const newSuggestions = getSearchSuggestions(value, listings);
      setSuggestions(newSuggestions);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for suggestion tap
    setTimeout(() => {
      setFocused(false);
      setSuggestions([]);
    }, 150);
  };

  return (
    <View className="mb-6" style={{ zIndex: 10 }}>
      <View className="flex-row items-center gap-3">
        <Reanimated.View style={[{ flex: 1, position: 'relative', zIndex: 10 }, animatedStyle]}>
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
              onFocus={handleFocus}
              onBlur={handleBlur}
              returnKeyType="search"
              blurOnSubmit={false}
            />
            {value.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  onChangeText('');
                  onSubmit('');
                }}
                className="ml-2 p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </Pressable>

          {/* Search Suggestions Dropdown */}
          <SearchSuggestions
            suggestions={suggestions}
            visible={focused && suggestions.length > 0}
            onSuggestionPress={handleSuggestionPress}
            onClose={() => setSuggestions([])}
          />
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