import { Tabs } from "expo-router";
import TabBar from "~/components/TabBar";
import Header from "~/components/Header";
import { View, ScrollView } from "react-native";

export default function TabsLayout() {
  return (
    <View className="flex-1">
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="browse"
          options={{
            title: 'Browse',
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            }}
          />
      </Tabs>
    </View>
  );
} 