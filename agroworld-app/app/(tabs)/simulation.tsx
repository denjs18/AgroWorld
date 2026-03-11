import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useParcelles } from "../../store/parcelles";

const SCENARIOS = [
  { id: "no_treatment", label: "🚫 Je ne traite pas cette semaine", color: "#e76f51" },
  { id: "half_dose",    label: "💊 Je traite à demi-dose (0.5x)", color: "#f4a261" },
  { id: "full_dose",    label: "✅ Je traite à dose recommandée",  color: "#2a9d8f" },
  { id: "double_dose",  label: "⚠️ Je traite à double dose (2x)",  color: "#e9c46a" },
  { id: "irrigation",   label: "💧 J'irrigue 20mm cette semaine",  color: "#457b9d" },
];

export default function Simulation() {
  const { activeParcelle } = useParcelles();
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const simulate = useMutation({
    mutationFn: (scenario: string) =>
      api.simulate(activeParcelle!.device_id, scenario),
    onSuccess: (data) => setResult(data),
  });

  return (
    <SafeAreaView className="flex-1 bg-[#0d2b33]">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-white text-2xl font-bold">🔬 Simulation</Text>
        <Text className="text-[#7ab5b0]">Que se passe-t-il si...</Text>
      </View>

      <ScrollView className="px-4">
        <Text className="text-[#7ab5b0] text-xs uppercase tracking-widest mb-3">
          Choisissez un scénario
        </Text>

        {SCENARIOS.map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setSelected(s.id)}
            className={`mb-3 p-4 rounded-xl border ${
              selected === s.id ? "border-[#2a9d8f] bg-[#1a6b5e]/30" : "border-[#264653] bg-[#162d35]"
            }`}
          >
            <Text className="text-white text-base">{s.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={() => selected && simulate.mutate(selected)}
          disabled={!selected || simulate.isPending}
          className={`mt-2 mb-6 p-4 rounded-xl items-center ${
            selected ? "bg-[#1a6b5e]" : "bg-[#162d35] opacity-50"
          }`}
        >
          <Text className="text-white font-bold text-base">
            {simulate.isPending ? "⏳ Simulation en cours..." : "🚀 Simuler sur 7 jours"}
          </Text>
        </TouchableOpacity>

        {/* Résultats */}
        {result && (
          <View className="mb-8">
            <Text className="text-[#7ab5b0] text-xs uppercase tracking-widest mb-3">Résultats simulés</Text>
            <View className="bg-[#162d35] rounded-xl p-4 border border-[#264653]">
              <ResultRow label="🍄 Risque maladie J+7"
                value={`${Math.round(result.disease_risk_7d * 100)}%`}
                alert={result.disease_risk_7d > 0.6} />
              <ResultRow label="💧 Déficit hydrique"
                value={`${result.irrigation_def_mm?.toFixed(1)} mm`}
                alert={result.irrigation_def_mm > 15} />
              <ResultRow label="🌾 Rendement estimé"
                value={`${result.yield_forecast_tha?.toFixed(1)} t/ha`}
                good={result.yield_forecast_tha > 7} />
              <ResultRow label="🌱 Stade BBCH estimé"
                value={Math.round(result.bbch_stage_est).toString()} />
              <View className="mt-3 pt-3 border-t border-[#264653]">
                <Text className="text-[#7ab5b0] text-sm">💡 {result.recommendation ?? "Aucune recommandation supplémentaire."}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultRow({ label, value, alert, good }: any) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-[#264653]">
      <Text className="text-[#aaa] text-sm">{label}</Text>
      <Text className={`font-bold text-base ${alert ? "text-red-400" : good ? "text-green-400" : "text-white"}`}>
        {value}
      </Text>
    </View>
  );
}
