import { View, Text } from "react-native";

interface Props {
  icon: string;
  label: string;
  value: number | undefined;
  unit: string;
  min?: number;
  max?: number;
  alert?: boolean;
}

export function SensorCard({ icon, label, value, unit, min, max, alert }: Props) {
  const pct = (min !== undefined && max !== undefined && value !== undefined)
    ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
    : null;

  return (
    <View className="w-1/2 px-1 mb-2">
      <View className={`p-3 rounded-xl border ${alert ? "bg-red-900/20 border-red-500/50" : "bg-[#162d35] border-[#264653]"}`}>
        <Text className="text-sm mb-1">{icon} {label}</Text>
        <Text className={`text-xl font-bold ${alert ? "text-red-400" : "text-white"}`}>
          {value !== undefined ? `${typeof value === "number" ? Number(value.toFixed(1)) : value}${unit}` : "—"}
        </Text>
        {pct !== null && (
          <View className="mt-2 h-1.5 bg-[#264653] rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: alert ? "#e76f51" : pct < 30 ? "#f4a261" : "#2a9d8f"
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
