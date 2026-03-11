import { View, Text, ScrollView } from "react-native";

interface Props {
  temp?: number; humid?: number; wind?: number; rain?: number; lux?: number;
}

export function WeatherStrip({ temp, humid, wind, rain, lux }: Props) {
  const items = [
    { icon: "🌡️", label: "Air",  value: temp !== undefined ? `${temp?.toFixed(1)}°C` : "—" },
    { icon: "💧", label: "RH",   value: humid !== undefined ? `${humid}%` : "—" },
    { icon: "🌬️", label: "Vent", value: wind !== undefined ? `${wind?.toFixed(1)} m/s` : "—" },
    { icon: "🌧️", label: "Pluie",value: rain !== undefined ? `${rain?.toFixed(1)} mm` : "—" },
    { icon: "☀️", label: "PAR",  value: lux !== undefined ? `${lux} lx` : "—" },
  ];

  return (
    <View className="bg-[#162d35] rounded-xl p-3 border border-[#264653]">
      <Text className="text-[#7ab5b0] text-xs uppercase tracking-widest mb-2">Conditions actuelles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.label} className="items-center mr-5">
            <Text className="text-xl">{item.icon}</Text>
            <Text className="text-white font-bold text-sm">{item.value}</Text>
            <Text className="text-[#6b8a8f] text-xs">{item.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
