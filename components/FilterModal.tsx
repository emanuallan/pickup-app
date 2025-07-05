import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '~/theme/colors';
import { X, Check } from 'lucide-react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high';
    priceRange: 'all' | 'under_50' | 'under_100' | 'under_500' | '500_plus';
    timeRange: 'all' | 'today' | 'this_week' | 'this_month';
  }) => void;
  currentFilters: {
    sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high';
    priceRange: 'all' | 'under_50' | 'under_100' | 'under_500' | '500_plus';
    timeRange: 'all' | 'today' | 'this_week' | 'this_month';
  };
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [sortBy, setSortBy] = useState(currentFilters.sortBy);
  const [priceRange, setPriceRange] = useState(currentFilters.priceRange);
  const [timeRange, setTimeRange] = useState(currentFilters.timeRange);

  const handleApply = () => {
    onApply({
      sortBy,
      priceRange,
      timeRange,
    });
    onClose();
  };

  const renderOption = (
    title: string,
    value: string,
    selectedValue: string,
    onSelect: (value: any) => void
  ) => (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      className="flex-row items-center justify-between py-3 px-4 border-b border-gray-100"
    >
      <Text className={`text-base ${selectedValue === value ? 'text-[#bf5700] font-medium' : 'text-gray-700'}`}>
        {title}
      </Text>
      {selectedValue === value && (
        <Check size={20} color={COLORS.utOrange} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold">Filters & Sort</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.light.grey} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {/* Sort Options */}
            <View className="py-2">
              <Text className="px-4 py-2 text-sm font-medium text-gray-500">SORT BY</Text>
              {renderOption('Newest First', 'newest', sortBy, setSortBy)}
              {renderOption('Oldest First', 'oldest', sortBy, setSortBy)}
              {renderOption('Price: Low to High', 'price_low', sortBy, setSortBy)}
              {renderOption('Price: High to Low', 'price_high', sortBy, setSortBy)}
            </View>

            {/* Price Range */}
            <View className="py-2">
              <Text className="px-4 py-2 text-sm font-medium text-gray-500">PRICE RANGE</Text>
              {renderOption('All Prices', 'all', priceRange, setPriceRange)}
              {renderOption('Under $50', 'under_50', priceRange, setPriceRange)}
              {renderOption('Under $100', 'under_100', priceRange, setPriceRange)}
              {renderOption('Under $500', 'under_500', priceRange, setPriceRange)}
              {renderOption('$500+', '500_plus', priceRange, setPriceRange)}
            </View>

            {/* Time Range */}
            <View className="py-2">
              <Text className="px-4 py-2 text-sm font-medium text-gray-500">POSTED</Text>
              {renderOption('Any Time', 'all', timeRange, setTimeRange)}
              {renderOption('Today', 'today', timeRange, setTimeRange)}
              {renderOption('This Week', 'this_week', timeRange, setTimeRange)}
              {renderOption('This Month', 'this_month', timeRange, setTimeRange)}
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleApply}
              className="w-full py-3 rounded-lg items-center"
              style={{ backgroundColor: COLORS.utOrange }}
            >
              <Text className="text-white font-medium text-base">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal; 