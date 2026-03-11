import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useParcelles } from "../../store/parcelles";
import { api } from "../../services/api";
import { SensorCard } from "../../components/SensorCard";
import { AlertBadge } from "../../components/AlertBadge";
import { WeatherStrip } from "../../components/WeatherStrip";
import dayjs from "dayjs";

export default function Dashboard() {
  const { activeParcelle, parcelles, setActive } = useParcelles();

  const { data: dashboard, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard", activeParcelle?.device_id],
    queryFn: () => api.getDashboard(activeParcelle!.device_id),
    enabled: !!activeParcelle,
    refetchInterval: 60_000, // Refresh auto toutes les minutes
  });

  const r = dashboard?.latest_reading;
  const alerts = dashboard?.active_alerts ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#0d2b33]">
      {/* Header */}
      <View className="px-4 pt-2 pb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-2xl font-bold">🌾 AgroWorld</Text>
          <Text className="text-[#7ab5b0] text-sm">
            {r ? `Dernière mesure: ${dayjs(r.timestamp).format("HH:mm")}` : "En attente..."}
          </Text>
        </View>
        <AlertBadge count={alerts.length} onPress={() => router.push("/alertes")} />
      </View>

      {/* Sélecteur parcelles */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3">
        {parcelles.map((p) => (
          <TouchableOpacity
            key={p.device_id}
            onPress={() => setActive(p)}
            className={`mr-3 px-4 py-2 rounded-full border ${
              activeParcelle?.device_id === p.device_id
                ? "bg-[#1a6b5e] border-[#2a9d8f]"
                : "bg-[#162d35] border-[#264653]"
            }`}
          >
            <Text className="text-white font-semibold">{p.name}</Text>
            <Text className="text-[#7ab5b0] text-xs">{p.culture} · {p.surface_ha}ha</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => router.push("/add-parcelle")}
          className="mr-3 px-4 py-2 rounded-full border border-dashed border-[#2a9d8f] justify-center"
        >
          <Text className="text-[#2a9d8f]">+ Parcelle</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2a9d8f" />}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color="#2a9d8f" size="large" className="mt-20" />
        ) : !r ? (
          <View className="items-center mt-20">
            <Text className="text-4xl mb-4">📡</Text>
            <Text className="text-white text-lg">Boîtier non connecté</Text>
            <Text className="text-[#7ab5b0] text-sm mt-2">Vérifiez l'alimentation et la couverture LoRa</Text>
          </View>
        ) : (
          <View className="px-4">

            {/* Alertes actives */}
            {alerts.length > 0 && (
              <View className="mb-4">
                {alerts.slice(0, 2).map((alert: any) => (
                  <TouchableOpacity
                    key={alert._id}
                    onPress={() => router.push("/alertes")}
                    className={`p-4 rounded-xl mb-2 border ${
                      alert.severity === "critical"
                        ? "bg-red-900/40 border-red-500"
                        : "bg-amber-900/40 border-amber-500"
                    }`}
                  >
                    <Text className="text-white font-bold">{alert.message}</Text>
                    <Text className="text-[#ccc] text-sm mt-1">{alert.recommendation}</Text>
                    {alert.optimal_window && (
                      <Text className="text-[#2a9d8f] text-sm mt-1">⏰ {alert.optimal_window}</Text>
                    )}
                    {alert.dose_recommandee && (
                      <Text className="text-green-400 text-sm">💊 {alert.dose_recommandee}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Météo strip */}
            <WeatherStrip
              temp={r.air?.temperature_c}
              humid={r.air?.humidity_pct}
              wind={r.weather?.wind_speed_ms}
              rain={r.weather?.rain_mm}
              lux={r.weather?.light_lux}
            />

            {/* Capteurs sol */}
            <Text className="text-[#7ab5b0] text-xs uppercase tracking-widest mb-2 mt-4">Sol</Text>
            <View className="flex-row flex-wrap -mx-1">
              <SensorCard icon="💧" label="Humidité sol" value={r.soil?.moisture_pct} unit="%" min={0} max={100} alert={r.soil?.moisture_pct < 20} />
              <SensorCard icon="🌡️" label="T° sol" value={r.soil?.temperature_c} unit="°C" />
              <SensorCard icon="⚗️" label="pH" value={r.soil?.ph} unit="" min={4} max={9} alert={r.soil?.ph < 5.5 || r.soil?.ph > 7.5} />
              <SensorCard icon="🟢" label="Azote N" value={r.soil?.nitrogen_mgkg} unit="mg/kg" alert={r.soil?.nitrogen_mgkg < 50} />
              <SensorCard icon="🟡" label="Phosphore P" value={r.soil?.phosphorus_mgkg} unit="mg/kg" />
              <SensorCard icon="🔴" label="Potassium K" value={r.soil?.potassium_mgkg} unit="mg/kg" />
            </View>

            {/* Batterie boîtier */}
            <View className="mt-4 mb-6 p-3 bg-[#162d35] rounded-xl flex-row items-center justify-between">
              <Text className="text-[#7ab5b0] text-sm">🔋 Boîtier</Text>
              <View className="flex-row items-center gap-2">
                <View className="w-24 h-2 bg-[#264653] rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(((r.battery_v - 3.0) / 1.2) * 100)}%`,
                      backgroundColor: r.battery_v > 3.5 ? "#2a9d8f" : r.battery_v > 3.2 ? "#f4a261" : "#e76f51"
                    }}
                  />
                </View>
                <Text className="text-white text-sm">{r.battery_v?.toFixed(2)}V</Text>
              </View>
            </View>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
