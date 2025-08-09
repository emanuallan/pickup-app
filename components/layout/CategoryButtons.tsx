import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Search, Sofa, Home, Laptop, Car, Book, Shirt, Utensils, ShoppingBag } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSettings } from '~/contexts/SettingsContext';

interface Category {
  name: string;
  icon: React.ComponentType<any>;
}

interface CategoryButtonsProps {
  selectedCategory: string;
  onCategoryPress: (category: string) => void;
}

const categories: Category[] = [
  { name: 'All', icon: Search },
  { name: 'Furniture', icon: Sofa },
  { name: 'Housing', icon: Home },
  { name: 'Tech', icon: Laptop },
  { name: 'Vehicles', icon: Car },
  { name: 'Books', icon: Book },
  { name: 'Clothing', icon: Shirt },
  { name: 'Kitchen', icon: Utensils },
  { name: 'Other', icon: ShoppingBag },
];

// Category Item Component with animations
const CategoryItem = ({ name, icon: Icon, isSelected, onPress }: {
  name: string;
  icon: React.ComponentType<any>;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const { hapticFeedbackEnabled } = useSettings();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
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
    <Reanimated.View style={[{ marginRight: 12 }, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        className="items-center px-4 py-3 bg-white rounded-lg border border-gray-200"
        style={{
          shadowColor: '#BF5700',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isSelected ? 0.15 : 0.05,
          shadowRadius: 3,
          elevation: isSelected ? 3 : 1,
          borderColor: isSelected ? '#BF5700' : '#E5E7EB',
          borderWidth: isSelected ? 2 : 1,
        }}
      >
        <View className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${
          isSelected ? 'bg-orange-50' : 'bg-gray-50'
        }`}>
          <Icon
            size={18}
            color={isSelected ? '#BF5700' : '#6B7280'}
          />
        </View>
        <Text className={`text-sm font-medium ${
          isSelected ? 'text-orange-700' : 'text-gray-600'
        }`}>
          {name}
        </Text>
      </Pressable>
    </Reanimated.View>
  );
};

const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  selectedCategory,
  onCategoryPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
    >
      {categories.map(({ name, icon }) => (
        <CategoryItem
          key={name}
          name={name}
          icon={icon}
          isSelected={selectedCategory === name}
          onPress={() => onCategoryPress(name)}
        />
      ))}
    </ScrollView>
  );
};

export default CategoryButtons; 