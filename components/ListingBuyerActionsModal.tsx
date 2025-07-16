import React from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { X, MessageCircle, Heart, Share2, Shield, AlertTriangle, Eye, Flag, Bookmark } from 'lucide-react-native';
import { COLORS } from '~/theme/colors';
import { AnimatedButton } from './AnimatedButton';

const { height: screenHeight } = Dimensions.get('window');

interface ListingBuyerActionsModalProps {
  visible: boolean;
  onClose: () => void;
  listing: {
    title: string;
    user_name: string;
    is_sold: boolean;
  };
  onMessage: () => void;
  onSave: () => void;
  onShare: () => void;
  onReport: () => void;
  onWatchlist?: () => void;
  isSaved: boolean;
  isWatchlisted?: boolean;
}

export const ListingBuyerActionsModal: React.FC<ListingBuyerActionsModalProps> = ({
  visible,
  onClose,
  listing,
  onMessage,
  onSave,
  onShare,
  onReport,
  onWatchlist,
  isSaved,
  isWatchlisted = false
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      {/* Background Blur/Overlay */}
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Modal Content */}
        <View 
          className="bg-white rounded-t-3xl"
          style={{ 
            paddingTop: 8,
            paddingBottom: 40,
            maxHeight: screenHeight * 0.8
          }}
        >
          {/* Handle Bar */}
          <View className="items-center py-2">
            <View 
              className="bg-gray-300 rounded-full"
              style={{ width: 40, height: 4 }}
            />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Actions & Tips</Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-gray-100"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Listing Context */}
          <View className="px-6 py-3 bg-gray-50">
            <Text className="text-sm text-gray-600 font-medium">Item:</Text>
            <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
              {listing.title}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Sold by: <Text className="font-medium text-gray-900">{listing.user_name}</Text>
            </Text>
          </View>

          <View className="px-6 py-6">
            {/* Primary Actions */}
            <View className="gap-3 mb-6">
              {!listing.is_sold && (
                <AnimatedButton
                  onPress={() => {
                    onMessage();
                    onClose();
                  }}
                  hapticType="medium"
                  scaleValue={0.97}
                  style={{
                    backgroundColor: COLORS.utOrange,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 18,
                    paddingHorizontal: 24,
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <MessageCircle size={22} color="white" />
                  <Text className="text-white font-bold text-lg ml-3 flex-1">Message Seller</Text>
                </AnimatedButton>
              )}

              <View className="gap-3">
                <View className="flex-row gap-3">
                  <AnimatedButton
                    onPress={() => {
                      onSave();
                      onClose();
                    }}
                    hapticType="light"
                    scaleValue={0.97}
                    style={{
                      borderColor: COLORS.utOrange,
                      borderWidth: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 18,
                      borderRadius: 14,
                      backgroundColor: 'white',
                      flex: 1,
                    }}
                  >
                    <Heart size={20} color={isSaved ? '#ef4444' : COLORS.utOrange} fill={isSaved ? '#ef4444' : 'transparent'} />
                    <Text 
                      className="font-semibold text-base ml-2 flex-1" 
                      style={{ color: isSaved ? '#ef4444' : COLORS.utOrange }}
                    >
                      {isSaved ? 'Favorited' : 'Favorite'}
                    </Text>
                  </AnimatedButton>

                  {onWatchlist && (
                    <AnimatedButton
                      onPress={() => {
                        onWatchlist();
                        onClose();
                      }}
                      hapticType="light"
                      scaleValue={0.97}
                      style={{
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 16,
                        paddingHorizontal: 18,
                        borderRadius: 14,
                        backgroundColor: 'white',
                        flex: 1,
                      }}
                    >
                      <Eye size={20} color={isWatchlisted ? '#3b82f6' : '#6b7280'} fill={isWatchlisted ? '#3b82f6' : 'transparent'} />
                      <Text 
                        className="font-semibold text-base ml-2 flex-1" 
                        style={{ color: isWatchlisted ? '#3b82f6' : '#6b7280' }}
                      >
                        {isWatchlisted ? 'Watching' : 'Watch'}
                      </Text>
                    </AnimatedButton>
                  )}
                </View>

                <AnimatedButton
                  onPress={() => {
                    onShare();
                    onClose();
                  }}
                  hapticType="light"
                  scaleValue={0.97}
                  style={{
                    borderColor: '#6b7280',
                    borderWidth: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 18,
                    borderRadius: 14,
                    backgroundColor: 'white',
                  }}
                >
                  <Share2 size={20} color="#6b7280" />
                  <Text 
                    className="font-semibold text-base ml-2 flex-1" 
                    style={{ color: '#6b7280' }}
                  >
                    Share
                  </Text>
                </AnimatedButton>
              </View>
            </View>

            {/* Safety Tips Section */}
            <View className="bg-blue-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Shield size={20} color="#1e40af" />
                <Text 
                  className="font-bold text-lg ml-2" 
                  style={{ color: '#1e3a8a' }}
                >
                  Safety Tips
                </Text>
              </View>
              
              <View className="gap-3">
                <View className="flex-row items-start">
                  <View className="w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3" />
                  <Text 
                    className="flex-1 text-base" 
                    style={{ color: '#1e40af' }}
                  >
                    Meet in public places on campus
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View className="w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3" />
                  <Text 
                    className="flex-1 text-base" 
                    style={{ color: '#1e40af' }}
                  >
                    Verify the item&apos;s condition before paying
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View className="w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3" />
                  <Text 
                    className="flex-1 text-base" 
                    style={{ color: '#1e40af' }}
                  >
                    Trust your instincts - if something feels off, walk away
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <View className="w-2 h-2 rounded-full bg-blue-600 mt-2 mr-3" />
                  <Text 
                    className="flex-1 text-base" 
                    style={{ color: '#1e40af' }}
                  >
                    Use cash or secure payment methods
                  </Text>
                </View>
              </View>
            </View>

            {/* Warning for Sold Items */}
            {listing.is_sold && (
              <View className="bg-red-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center">
                  <AlertTriangle size={20} color="#dc2626" />
                  <Text 
                    className="font-bold text-base ml-2" 
                    style={{ color: '#dc2626' }}
                  >
                    Item Sold
                  </Text>
                </View>
                <Text 
                  className="mt-2 text-base" 
                  style={{ color: '#dc2626' }}
                >
                  This item has been marked as sold by the seller. You can still message them to check if it&apos;s still available.
                </Text>
              </View>
            )}

            {/* Report Section */}
            <View className="border-t border-gray-200 pt-4">
              <Text className="text-gray-600 text-sm mb-3 font-medium">Need help?</Text>
              <AnimatedButton
                onPress={() => {
                  onReport();
                  onClose();
                }}
                hapticType="light"
                scaleValue={0.97}
                style={{
                  borderColor: '#dc2626',
                  borderWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor: 'white',
                }}
              >
                <Flag size={16} color="#dc2626" />
                <Text className="text-red-600 font-medium text-sm ml-2">Report this listing</Text>
              </AnimatedButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}; 