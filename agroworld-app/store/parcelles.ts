import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV();

interface Parcelle {
  _id: string;
  device_id: string;
  name: string;
  culture: string;
  surface_ha: number;
  mode_agri: string;
}

interface ParcellesStore {
  parcelles: Parcelle[];
  activeParcelle: Parcelle | null;
  setActive: (p: Parcelle) => void;
  addParcelle: (p: Parcelle) => void;
  loadFromStorage: () => void;
}

export const useParcelles = create<ParcellesStore>((set, get) => ({
  parcelles: [],
  activeParcelle: null,

  loadFromStorage: () => {
    const raw = storage.getString("parcelles");
    if (raw) {
      const parcelles = JSON.parse(raw);
      set({ parcelles, activeParcelle: parcelles[0] ?? null });
    }
  },

  setActive: (p) => set({ activeParcelle: p }),

  addParcelle: (p) => {
    const parcelles = [...get().parcelles, p];
    storage.set("parcelles", JSON.stringify(parcelles));
    set({ parcelles, activeParcelle: get().activeParcelle ?? p });
  },
}));
