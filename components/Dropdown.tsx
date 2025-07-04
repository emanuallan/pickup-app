import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DropdownProps {
  value: string;
  options: readonly string[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

export default function Dropdown({ value, options, onSelect, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50"
      >
        <Text className={value === options[0] ? "text-gray-500" : "text-gray-900"}>
          {value || placeholder}
        </Text>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color="#666"
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 justify-end">
            <View className="bg-white rounded-t-xl max-h-[70%]">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold">Select Option</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView className="py-2">
                {options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-3 flex-row items-center justify-between ${
                      option === value ? 'bg-gray-100' : ''
                    }`}
                  >
                    <Text className={`${
                      option === value ? 'text-[#C1501F] font-medium' : 'text-gray-700'
                    }`}>
                      {option}
                    </Text>
                    {option === value && (
                      <MaterialIcons name="check" size={20} color="#C1501F" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
} 