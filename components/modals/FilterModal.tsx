import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '~/theme/colors';
import { X, DollarSign, Clock, TrendingUp, Filter, RotateCw, Package2 } from 'lucide-react-native';
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

// Filter Chip Component (UT Dining style)
const FilterChip = ({ title, value, selectedValue, onSelect, icon }: {
  title: string;
  value: string;
  selectedValue: string;
  onSelect: (value: any) => void;
  icon?: React.ReactNode;
}) => {
  const { hapticFeedbackEnabled } = useSettings();
  const isSelected = selectedValue === value;

  const handlePress = () => {
    if (hapticFeedbackEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect(value);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center gap-x-2 rounded-lg border px-3 py-2`}
      style={{
        borderColor: isSelected ? COLORS.utOrange : '#D1D5DB',
        backgroundColor: isSelected ? COLORS.utOrange : 'white',
      }}
    >
      {icon && (
        <View className="w-4 h-4 items-center justify-center">
          {icon}
        </View>
      )}
      <Text className={`font-medium text-sm ${
        isSelected ? 'text-white' : 'text-gray-700'
      }`}>
        {title}
      </Text>
    </TouchableOpacity>
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


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-6">
              {/* Header with Close Button */}
              <View className="mb-6 flex-row items-center justify-between">
                <View className="flex-row items-center gap-x-2">
                  <Filter color={COLORS.utOrange} size={20} />
                  <Text className="font-bold text-3xl text-black">Filters</Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  className="p-2"
                >
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Reset Button */}
              <View className="mb-4 flex-row justify-end">
                <TouchableOpacity
                  onPress={() => {
                    handleReset();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="flex-row items-center gap-x-1 rounded-full border border-gray-300 px-3 py-1"
                >
                  <RotateCw size={16} color="#6B7280" />
                  <Text className="font-medium text-sm text-gray-600">Reset</Text>
                </TouchableOpacity>
              </View>

              {/* Sort By */}
              <Text className="mb-2 font-semibold text-xl">Sort By</Text>
              <View className="mb-6 flex-row flex-wrap gap-2">
                <FilterChip title="Newest" value="newest" selectedValue={sortBy} onSelect={setSortBy} 
                  icon={<Clock size={14} color={sortBy === 'newest' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Oldest" value="oldest" selectedValue={sortBy} onSelect={setSortBy} 
                  icon={<Clock size={14} color={sortBy === 'oldest' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Price: Low-High" value="price_low" selectedValue={sortBy} onSelect={setSortBy} 
                  icon={<DollarSign size={14} color={sortBy === 'price_low' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Price: High-Low" value="price_high" selectedValue={sortBy} onSelect={setSortBy} 
                  icon={<DollarSign size={14} color={sortBy === 'price_high' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Most Relevant" value="relevance" selectedValue={sortBy} onSelect={setSortBy} 
                  icon={<TrendingUp size={14} color={sortBy === 'relevance' ? '#fff' : COLORS.utOrange} />} />
              </View>

              {/* Price Range */}
              <Text className="mb-2 font-semibold text-xl">Price Range</Text>
              <View className="mb-6 flex-row flex-wrap gap-2">
                <FilterChip title="All Prices" value="all" selectedValue={priceRange} onSelect={setPriceRange} />
                <FilterChip title="Free" value="free" selectedValue={priceRange} onSelect={setPriceRange} 
                  icon={<DollarSign size={14} color={priceRange === 'free' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Under $25" value="under_25" selectedValue={priceRange} onSelect={setPriceRange} 
                  icon={<DollarSign size={14} color={priceRange === 'under_25' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Under $50" value="under_50" selectedValue={priceRange} onSelect={setPriceRange} 
                  icon={<DollarSign size={14} color={priceRange === 'under_50' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Under $100" value="under_100" selectedValue={priceRange} onSelect={setPriceRange} 
                  icon={<DollarSign size={14} color={priceRange === 'under_100' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Under $500" value="under_500" selectedValue={priceRange} onSelect={setPriceRange} 
                  icon={<DollarSign size={14} color={priceRange === 'under_500' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="$500+" value="500_plus" selectedValue={priceRange} onSelect={setPriceRange} 
                  icon={<DollarSign size={14} color={priceRange === '500_plus' ? '#fff' : COLORS.utOrange} />} />
              </View>

              {/* Time Posted */}
              <Text className="mb-2 font-semibold text-xl">Posted</Text>
              <Text className="mb-2 text-sm text-gray-600">Filter by when items were posted</Text>
              <View className="mb-6 flex-row flex-wrap gap-2">
                <FilterChip title="Any Time" value="all" selectedValue={timeRange} onSelect={setTimeRange} />
                <FilterChip title="Today" value="today" selectedValue={timeRange} onSelect={setTimeRange} 
                  icon={<Clock size={14} color={timeRange === 'today' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="This Week" value="this_week" selectedValue={timeRange} onSelect={setTimeRange} 
                  icon={<Clock size={14} color={timeRange === 'this_week' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="This Month" value="this_month" selectedValue={timeRange} onSelect={setTimeRange} 
                  icon={<Clock size={14} color={timeRange === 'this_month' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="This Year" value="this_year" selectedValue={timeRange} onSelect={setTimeRange} 
                  icon={<Clock size={14} color={timeRange === 'this_year' ? '#fff' : COLORS.utOrange} />} />
              </View>

              {/* Item Condition */}
              <Text className="mb-2 font-semibold text-xl">Item Condition</Text>
              <Text className="mb-2 text-sm text-gray-600">Filter by the condition of items</Text>
              <View className="mb-6 flex-row flex-wrap gap-2">
                <FilterChip title="Any Condition" value="all" selectedValue={condition} onSelect={setCondition} />
                <FilterChip title="New" value="new" selectedValue={condition} onSelect={setCondition} 
                  icon={<Package2 size={14} color={condition === 'new' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Like New" value="like_new" selectedValue={condition} onSelect={setCondition} 
                  icon={<Package2 size={14} color={condition === 'like_new' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Good" value="good" selectedValue={condition} onSelect={setCondition} 
                  icon={<Package2 size={14} color={condition === 'good' ? '#fff' : COLORS.utOrange} />} />
                <FilterChip title="Fair" value="fair" selectedValue={condition} onSelect={setCondition} 
                  icon={<Package2 size={14} color={condition === 'fair' ? '#fff' : COLORS.utOrange} />} />
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                onPress={handleApply}
                className="mb-6 mt-4 py-4 rounded-lg items-center"
                style={{ backgroundColor: COLORS.utOrange }}
              >
                <Text className="text-white font-semibold text-lg">Apply Filters</Text>
              </TouchableOpacity>

              <Text className="text-xs text-gray-500 text-center">
                Filters help you find exactly what you're looking for in the UT Marketplace
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal; 