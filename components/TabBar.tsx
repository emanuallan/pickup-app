import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, MessageCircle, User, Plus } from "lucide-react-native";

const tabRoutes = [
  { name: "index", icon: Home },
  { name: "browse", icon: Search },
  { name: "create", icon: Plus },
  { name: "messages", icon: MessageCircle },
  { name: "profile", icon: User },
] as const;

export default function TabBar({
  state,
  navigation,
}: {
  state: any;
  navigation: any;
}) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row justify-around items-center h-16">
        {tabRoutes.map((tab) => {
          const isFocused = state.routes[state.index].name === tab.name;
          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              className="flex-1 items-center justify-center"
            >
              <Icon 
                size={24} 
                color={isFocused ? "#C1501F" : "#8E8E93"} 
                strokeWidth={2}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}