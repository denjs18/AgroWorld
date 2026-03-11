import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParcelles } from "../../store/parcelles";
import { api } from "../../services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
dayjs.extend(relativeTime);
dayjs.locale("fr");

const SEVERITY_CONFIG: Record<string, { bg: string; border: string; dot: string }> = {
  critical: { bg: "bg-red-900/30",    border: "border-red-500",    dot: "bg-red-400"    },
  warning:  { bg: "bg-amber-900/30",  border: "border-amber-500",  dot: "bg-amber-400"  },
  info:     { bg: "bg-blue-900/30",   border: "border-blue-500",   dot: "bg-blue-400"   },
};

const TYPE_ICONS: Record<string, string> = {
  maladie: "🍄", irrigation: "💧", traitement: "💊", nutrition: "🌿", default: "ℹ️"
};

export default function Alertes() {
  const { activeParcelle } = useParcelles();
  const qc = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", activeParcelle?._id],
    queryFn: () => api.getAlerts(activeParcelle!._id),
    enabled: !!activeParcelle,
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: api.markAlertRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const unread = alerts.filter((a: any) => !a.read);
  const read   = alerts.filter((a: any) => a.read);

  return (
    <SafeAreaView className="flex-1 bg-[#0d2b33]">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-white text-2xl font-bold">🔔 Alertes</Text>
        <Text className="text-[#7ab5b0]">{unread.length} non lue{unread.length > 1 ? "s" : ""}</Text>
      </View>

      <ScrollView className="px-4">
        {alerts.length === 0 && (
          <View className="items-center mt-20">
            <Text className="text-5xl mb-4">✅</Text>
            <Text className="text-white text-lg">Aucune alerte active</Text>
            <Text className="text-[#7ab5b0] text-sm mt-2">Vos cultures sont en bonne santé</Text>
          </View>
        )}

        {unread.length > 0 && (
          <Text className="text-[#7ab5b0] text-xs uppercase tracking-widest mb-3">Non lues</Text>
        )}

        {[...unread, ...read].map((alert: any) => {
          const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
          const icon = TYPE_ICONS[alert.type] ?? TYPE_ICONS.default;
          return (
            <TouchableOpacity
              key={alert._id}
              onPress={() => !alert.read && markRead.mutate(alert._id)}
              className={`mb-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border} ${alert.read ? "opacity-50" : ""}`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-2 h-2 rounded-full mr-2 mt-1.5 ${cfg.dot}`} />
                  <View className="flex-1">
                    <Text className="text-white font-bold">
                      {icon} {alert.message}
                    </Text>
                    <Text className="text-[#aaa] text-sm mt-1">{alert.recommendation}</Text>
                    {alert.optimal_window && (
                      <View className="mt-2 flex-row items-center">
                        <Text className="text-[#2a9d8f] text-sm">⏰ </Text>
                        <Text className="text-[#2a9d8f] text-sm font-semibold">{alert.optimal_window}</Text>
                      </View>
                    )}
                    {alert.dose_recommandee && (
                      <View className="mt-1 flex-row items-center">
                        <Text className="text-green-400 text-sm">💊 </Text>
                        <Text className="text-green-400 text-sm font-semibold">{alert.dose_recommandee}</Text>
                      </View>
                    )}
                    <Text className="text-[#666] text-xs mt-2">
                      {dayjs(alert.created_at).fromNow()}
                      {!alert.read && <Text className="text-[#2a9d8f]">  · Toucher pour marquer comme lu</Text>}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
