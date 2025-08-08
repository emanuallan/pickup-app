import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { COLORS } from '~/theme/colors';
import { X, Check, DollarSign, Clock, TrendingUp, Filter } from 'lucide-react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSettings } from '~/contexts/SettingsContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'relevance';
    priceRange: 'all' | 'under_25' | 'under_50' | 'under_100' | 'under_500' | '500_plus' | 'free';
    timeRange: 'all' | 'today' | 'this_week' | 'this_month' | 'this_year';
    condition: 'all' | 'new' | 'like_new' | 'good' | 'fair';
  }) => void;
  currentFilters: {
    sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'relevance';
    priceRange: 'all' | 'under_25' | 'under_50' | 'under_100' | 'under_500' | '500_plus' | 'free';
    timeRange: 'all' | 'today' | 'this_week' | 'this_month' | 'this_year';
    condition: 'all' | 'new' | 'like_new' | 'good' | 'fair';
  };
}

// Enhanced Filter Option Component
const FilterOption = ({ title, value, selectedValue, onSelect, icon, description }: {
  title: string;
  value: string;
  selectedValue: string;
  onSelect: (value: any) => void;
  icon?: React.ReactNode;
  description?: string;
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

  const isSelected = selectedValue === value;

  return (
    <Reanimated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onSelect(value)}
        className={`mx-4 mb-3 p-4 rounded-lg border ${
          isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
        }`}
        style={{
          shadowColor: '#BF5700',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isSelected ? 0.15 : 0.05,
          shadowRadius: 3,
          elevation: isSelected ? 3 : 1,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            {icon && (
              <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                isSelected ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                {icon}
              </View>
            )}
            <View className="flex-1">
              <Text className={`font-semibold text-base ${
                isSelected ? 'text-orange-700' : 'text-gray-900'
              }`}>
                {title}
              </Text>
              {description && (
                <Text className={`text-sm mt-1 ${
                  isSelected ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {description}
                </Text>
              )}
            </View>
          </View>
          {isSelected && (
            <View className="w-6 h-6 bg-orange-500 rounded-full items-center justify-center">
              <Check size={14} color="white" />
            </View>
          )}
        </View>
      </Pressable>
    </Reanimated.View>
  );
};

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [sortBy, setSortBy] = useState(currentFilters.sortBy);
  const [priceRange, setPriceRange] = useState(currentFilters.priceRange);
  const [timeRange, setTimeRange] = useState(currentFilters.timeRange);
  const [condition, setCondition] = useState(currentFilters.condition);

  const handleApply = () => {
    onApply({
      sortBy,
      priceRange,
      timeRange,
      condition,
    });
    onClose();
  };

  const handleReset = () => {
    setSortBy('newest');
    setPriceRange('all');
    setTimeRange('all');
    setCondition('all');
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

          <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            {/* Sort Options */}
            <View className="py-6">
              <Text className="px-6 pb-4 text-lg font-black text-gray-900">Sort By</Text>
              <FilterOption title="Most Relevant" value="relevance" selectedValue={sortBy} onSelect={setSortBy} 
                icon={<TrendingUp size={16} color="#BF5700" />} description="Best matches for your search" />
              <FilterOption title="Newest First" value="newest" selectedValue={sortBy} onSelect={setSortBy} 
                icon={<Clock size={16} color="#BF5700" />} description="Recently posted items" />
              <FilterOption title="Oldest First" value="oldest" selectedValue={sortBy} onSelect={setSortBy} 
                icon={<Clock size={16} color="#BF5700" />} description="Older listings first" />
              <FilterOption title="Price: Low to High" value="price_low" selectedValue={sortBy} onSelect={setSortBy} 
                icon={<DollarSign size={16} color="#BF5700" />} description="Cheapest items first" />
              <FilterOption title="Price: High to Low" value="price_high" selectedValue={sortBy} onSelect={setSortBy} 
                icon={<DollarSign size={16} color="#BF5700" />} description="Most expensive first" />
            </View>

            {/* Price Range */}
            <View className="py-6">
              <Text className="px-6 pb-4 text-lg font-black text-gray-900">Price Range</Text>
              <FilterOption title="All Prices" value="all" selectedValue={priceRange} onSelect={setPriceRange} 
                icon={<DollarSign size={16} color="#BF5700" />} description="No price limit" />
              <FilterOption title="Free Items" value="free" selectedValue={priceRange} onSelect={setPriceRange} 
                icon={<DollarSign size={16} color="#BF5700" />} description="$0 items only" />
              <FilterOption title="Under $25" value="under_25" selectedValue={priceRange} onSelect={setPriceRange} 
                icon={<DollarSign size={16} color="#BF5700" />} description="Budget-friendly finds" />
              <FilterOption title="Under $50" value="under_50" selectedValue={priceRange} onSelect={setPriceRange} 
                icon={<DollarSign size={16} color="#BF5700" />} description="Affordable options" />
              <FilterOption title="Under $100" value="under_100" selectedValue={priceRange} onSelect={setPriceRange} 
                icon={<DollarSign size={16} color="#BF5700" />} description="Mid-range items" />
              <FilterOption title="Under $500" value="under_500" selectedValue={priceRange} onSelect={setPriceRange} 
                icon={<DollarSign size={16} color="#BF5700" />} description="Higher-end products" />
              <FilterOption title="$500 and up" value="500_plus" selectedValue={priceRange} onSelect={setPriceRange} 
                icon={<DollarSign size={16} color="#BF5700" />} description="Premium items" />
            </View>

            {/* Time Range */}
            <View className="py-6">
              <Text className="px-6 pb-4 text-lg font-black text-gray-900">Posted</Text>
              <FilterOption title="Any Time" value="all" selectedValue={timeRange} onSelect={setTimeRange} 
                icon={<Clock size={16} color="#BF5700" />} description="All listings" />
              <FilterOption title="Today" value="today" selectedValue={timeRange} onSelect={setTimeRange} 
                icon={<Clock size={16} color="#BF5700" />} description="Posted in the last 24 hours" />
              <FilterOption title="This Week" value="this_week" selectedValue={timeRange} onSelect={setTimeRange} 
                icon={<Clock size={16} color="#BF5700" />} description="Posted in the last 7 days" />
              <FilterOption title="This Month" value="this_month" selectedValue={timeRange} onSelect={setTimeRange} 
                icon={<Clock size={16} color="#BF5700" />} description="Posted in the last 30 days" />
              <FilterOption title="This Year" value="this_year" selectedValue={timeRange} onSelect={setTimeRange} 
                icon={<Clock size={16} color="#BF5700" />} description="Posted in the last 12 months" />
            </View>

            {/* Condition */}
            <View className="py-6 pb-20">
              <Text className="px-6 pb-4 text-lg font-black text-gray-900">Condition</Text>
              <FilterOption title="Any Condition" value="all" selectedValue={condition} onSelect={setCondition} 
                icon={<Filter size={16} color="#BF5700" />} description="All item conditions" />
              <FilterOption title="New" value="new" selectedValue={condition} onSelect={setCondition} 
                icon={<Filter size={16} color="#BF5700" />} description="Brand new, unused items" />
              <FilterOption title="Like New" value="like_new" selectedValue={condition} onSelect={setCondition} 
                icon={<Filter size={16} color="#BF5700" />} description="Barely used, excellent condition" />
              <FilterOption title="Good" value="good" selectedValue={condition} onSelect={setCondition} 
                icon={<Filter size={16} color="#BF5700" />} description="Used but in good working order" />
              <FilterOption title="Fair" value="fair" selectedValue={condition} onSelect={setCondition} 
                icon={<Filter size={16} color="#BF5700" />} description="Shows wear, still functional" />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="p-4 border-t border-gray-200 bg-white">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 py-3 rounded-lg items-center border border-gray-300"
              >
                <Text className="text-gray-700 font-semibold text-base">Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                className="flex-2 py-3 rounded-lg items-center"
                style={{ backgroundColor: COLORS.utOrange, flex: 2 }}
              >
                <Text className="text-white font-semibold text-base">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal; 