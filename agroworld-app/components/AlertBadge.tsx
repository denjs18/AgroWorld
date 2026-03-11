import { TouchableOpacity, View, Text } from "react-native";

export function AlertBadge({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="relative p-2">
      <Text className="text-2xl">🔔</Text>
      {count > 0 && (
        <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
          <Text className="text-white text-xs font-bold">{count > 9 ? "9+" : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
