import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Search, Sofa, Home, Laptop, Car, Book, Shirt, Utensils, ShoppingBag } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';

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

const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  selectedCategory,
  onCategoryPress,
}) => {
  return (
    <View className="bg-white border-b border-gray-200">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-2"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {categories.map(({ name, icon: Icon }) => (
          <TouchableOpacity
            key={name}
            onPress={() => onCategoryPress(name)}
            className={`items-center mx-2 ${
              selectedCategory === name ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <View
              className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${
                selectedCategory === name
                  ? 'bg-[#bf5700]'
                  : 'bg-gray-100'
              }`}
            >
              <Icon
                size={20}
                color={selectedCategory === name ? COLORS.white : COLORS.light.grey}
              />
            </View>
            <Text
              className={`text-xs ${
                selectedCategory === name
                  ? 'text-[#bf5700] font-medium'
                  : 'text-gray-600'
              }`}
            >
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoryButtons; 