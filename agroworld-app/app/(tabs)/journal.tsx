import {
  View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";
import { useParcelles } from "../../store/parcelles";
import dayjs from "dayjs";

const ACTION_TYPES = [
  { id: "semis",       emoji: "🌱", label: "Semis" },
  { id: "traitement",  emoji: "💊", label: "Traitement" },
  { id: "fertilisation", emoji: "🟢", label: "Fertilisation" },
  { id: "irrigation",  emoji: "💧", label: "Irrigation" },
  { id: "recolte",     emoji: "🌾", label: "Récolte" },
  { id: "observation", emoji: "👁️",  label: "Observation" },
  { id: "autre",       emoji: "📝", label: "Autre" },
];

export default function Journal() {
  const { activeParcelle } = useParcelles();
  const qc = useQueryClient();
  const [type, setType] = useState("observation");
  const [note, setNote] = useState("");
  const [dose, setDose] = useState("");
  const [produit, setProduit] = useState("");

  const { data: entries = [] } = useQuery({
    queryKey: ["journal", activeParcelle?._id],
    queryFn: () => api.getJournal(activeParcelle!._id),
    enabled: !!activeParcelle,
  });

  const addEntry = useMutation({
    mutationFn: () => api.addJournalEntry({
      parcelle_id: activeParcelle!._id,
      type, note, dose, produit,
      date: new Date().toISOString()
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      setNote(""); setDose(""); setProduit("");
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-[#0d2b33]">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-white text-2xl font-bold">📋 Carnet cultural</Text>
        <Text className="text-[#7ab5b0]">Saisie rapide · Export PDF</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">

          {/* Nouvelle entrée */}
          <View className="bg-[#162d35] rounded-xl p-4 mb-4 border border-[#264653]">
            <Text className="text-[#7ab5b0] text-xs uppercase tracking-widest mb-3">Nouvelle entrée</Text>

            {/* Type action */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {ACTION_TYPES.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setType(a.id)}
                  className={`mr-2 px-3 py-2 rounded-xl border ${
                    type === a.id ? "bg-[#1a6b5e] border-[#2a9d8f]" : "border-[#264653]"
                  }`}
                >
                  <Text className="text-white text-sm">{a.emoji} {a.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Champs conditionnels */}
            {(type === "traitement" || type === "fertilisation") && (
              <View className="flex-row gap-2 mb-2">
                <TextInput
                  value={produit}
                  onChangeText={setProduit}
                  placeholder="Produit (ex: Prosaro)"
                  placeholderTextColor="#6b8a8f"
                  className="flex-1 bg-[#0d2b33] text-white p-3 rounded-xl border border-[#264653]"
                />
                <TextInput
                  value={dose}
                  onChangeText={setDose}
                  placeholder="Dose"
                  placeholderTextColor="#6b8a8f"
                  className="w-28 bg-[#0d2b33] text-white p-3 rounded-xl border border-[#264653]"
                />
              </View>
            )}

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Note (optionnel)..."
              placeholderTextColor="#6b8a8f"
              multiline
              numberOfLines={2}
              className="bg-[#0d2b33] text-white p-3 rounded-xl border border-[#264653] mb-3"
            />

            <TouchableOpacity
              onPress={() => addEntry.mutate()}
              disabled={addEntry.isPending}
              className="bg-[#1a6b5e] p-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">
                {addEntry.isPending ? "Enregistrement..." : "✓ Enregistrer"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Historique */}
          <Text className="text-[#7ab5b0] text-xs uppercase tracking-widest mb-3">Historique</Text>
          {entries.map((e: any) => {
            const atype = ACTION_TYPES.find((a) => a.id === e.type) ?? ACTION_TYPES[6];
            return (
              <View key={e._id} className="bg-[#162d35] rounded-xl p-3 mb-2 border border-[#264653] flex-row">
                <Text className="text-2xl mr-3">{atype.emoji}</Text>
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <Text className="text-white font-semibold">{atype.label}</Text>
                    <Text className="text-[#6b8a8f] text-xs">{dayjs(e.date).format("DD/MM HH:mm")}</Text>
                  </View>
                  {e.produit && <Text className="text-[#2a9d8f] text-sm">💊 {e.produit} · {e.dose}</Text>}
                  {e.note && <Text className="text-[#aaa] text-sm mt-1">{e.note}</Text>}
                </View>
              </View>
            );
          })}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
