import { Tabs } from "expo-router";
import { View, Text } from "react-native";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: "🌾", alertes: "🔔", journal: "📋", communaute: "👥", simulation: "🔬",
  };
  return (
    <View className="items-center">
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name]}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0d2b33",
          borderTopColor: "#1a6b5e",
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: "#2a9d8f",
        tabBarInactiveTintColor: "#6b8a8f",
      }}
    >
      <Tabs.Screen name="index"
        options={{ title: "Parcelles", tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} /> }} />
      <Tabs.Screen name="alertes"
        options={{ title: "Alertes", tabBarIcon: ({ focused }) => <TabIcon name="alertes" focused={focused} /> }} />
      <Tabs.Screen name="journal"
        options={{ title: "Journal", tabBarIcon: ({ focused }) => <TabIcon name="journal" focused={focused} /> }} />
      <Tabs.Screen name="communaute"
        options={{ title: "Communauté", tabBarIcon: ({ focused }) => <TabIcon name="communaute" focused={focused} /> }} />
      <Tabs.Screen name="simulation"
        options={{ title: "Simulation", tabBarIcon: ({ focused }) => <TabIcon name="simulation" focused={focused} /> }} />
    </Tabs>
  );
}
