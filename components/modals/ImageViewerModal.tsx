import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Text,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageViewerModalProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = useRef<ScrollView>(null);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      opacity.value = withSpring(1);
      // Scroll to initial image after modal opens
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * screenWidth,
          animated: false,
        });
      }, 100);
    } else {
      opacity.value = withSpring(0);
    }
  }, [visible, initialIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  const navigateToImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      scrollViewRef.current?.scrollTo({
        x: index * screenWidth,
        animated: true,
      });
    }
  };

  const handleClose = () => {
    opacity.value = withSpring(0, undefined, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <StatusBar hidden />
      <Reanimated.View style={[{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }, animatedStyle]}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity
              onPress={handleClose}
              className="bg-black/50 rounded-full p-2"
              activeOpacity={0.8}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            
            <View className="bg-black/50 rounded-full px-3 py-1">
              <Text className="text-white font-medium">
                {currentIndex + 1} of {images.length}
              </Text>
            </View>
          </View>

          {/* Image Gallery */}
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              bounces={false}
              style={{ flex: 1 }}
            >
              {images.map((image, index) => (
                <View
                  key={index}
                  style={{
                    width: screenWidth,
                    height: screenHeight - 150, // Account for header and footer
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={{ uri: image }}
                    style={{
                      width: screenWidth - 20,
                      height: screenHeight - 200,
                    }}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <TouchableOpacity
                    onPress={() => navigateToImage(currentIndex - 1)}
                    style={{
                      position: 'absolute',
                      left: 20,
                      top: '50%',
                      transform: [{ translateY: -25 }],
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 25,
                      width: 50,
                      height: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.8}
                  >
                    <ChevronLeft size={24} color="white" />
                  </TouchableOpacity>
                )}

                {currentIndex < images.length - 1 && (
                  <TouchableOpacity
                    onPress={() => navigateToImage(currentIndex + 1)}
                    style={{
                      position: 'absolute',
                      right: 20,
                      top: '50%',
                      transform: [{ translateY: -25 }],
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 25,
                      width: 50,
                      height: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.8}
                  >
                    <ChevronRight size={24} color="white" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Image Indicators */}
          {images.length > 1 && (
            <View 
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingVertical: 20,
                paddingHorizontal: 20,
              }}
            >
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigateToImage(index)}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          )}
        </SafeAreaView>
      </Reanimated.View>
    </Modal>
  );
};