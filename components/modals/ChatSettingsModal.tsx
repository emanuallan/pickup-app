import { View, Text, TouchableOpacity, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ChatSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onBlock: () => void;
  onReport: () => void;
  onDelete: () => void;
}

export default function ChatSettingsModal({
  visible,
  onClose,
  onBlock,
  onReport,
  onDelete
}: ChatSettingsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="mt-auto bg-white rounded-t-3xl">
          <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3" />
          
          <TouchableOpacity
            onPress={onBlock}
            className="flex-row items-center px-6 py-4"
          >
            <MaterialIcons name="block" size={24} color="#FF3B30" className="mr-3" />
            <Text className="text-[#FF3B30] text-lg">Block User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onReport}
            className="flex-row items-center px-6 py-4"
          >
            <MaterialIcons name="flag" size={24} color="#FF3B30" className="mr-3" />
            <Text className="text-[#FF3B30] text-lg">Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            className="flex-row items-center px-6 py-4"
          >
            <MaterialIcons name="delete" size={24} color="#FF3B30" className="mr-3" />
            <Text className="text-[#FF3B30] text-lg">Delete Conversation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="flex-row items-center px-6 py-4 mb-6"
          >
            <Text className="text-lg font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
} 