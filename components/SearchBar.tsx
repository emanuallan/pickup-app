import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
}) => {
  return (
    <View className="flex-row items-center px-4 py-2 bg-white border-b border-gray-200">
      <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-3">
        <Search size={20} color={COLORS.light.grey} />
        <TextInput
          className="flex-1 ml-2 text-base"
          placeholder="Search items..."
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity onPress={onFilterPress}>
        <SlidersHorizontal size={24} color={COLORS.utOrange} />
      </TouchableOpacity>
    </View>
  );
}; 