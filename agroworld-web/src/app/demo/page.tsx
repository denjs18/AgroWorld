"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SensorData = {
  timestamp: string;
  temp_air: number; humidity_air: number; pressure: number; lux: number;
  temp_sol: number; humidity_sol: number; ph: number;
  n: number; p: number; k: number;
  wind_speed: number; wind_dir: number; rain_mm: number;
  ndvi: number; rssi: number; snr: number; lora_ok: boolean;
  risk_mildiou: number; risk_rouille: number; battery_pct: number;
};

type HistPoint = { t: string; v: number };

function Gauge({ value, max, label, unit, color }: { value: number; max: number; label: string; unit: string; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-[#9acfd3]">
        <span>{label}</span>
        <span className="text-white font-bold">{value} <span className="font-normal text-[#9acfd3]">{unit}</span></span>
      </div>
      <div className="h-2 bg-[#0d2b33] rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
    </div>
  );
}

function MiniChart({ history, color }: { history: HistPoint[]; color: string }) {
  if (history.length < 2) return null;
  const vals = history.map(h => h.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const W = 160, H = 36;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RiskBadge({ label, value }: { label: string; value: number }) {
  const color = value > 65 ? "#ef4444" : value > 35 ? "#f59e0b" : "#22c55e";
  const bg = value > 65 ? "bg-red-900/20 border-red-500/40" : value > 35 ? "bg-amber-900/20 border-amber-500/40" : "bg-green-900/20 border-green-500/40";
  const status = value > 65 ? "ALERTE" : value > 35 ? "SURVEILLER" : "OK";
  return (
    <div className={`border rounded-xl p-4 ${bg}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-semibold text-sm">{label}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}22` }}>{status}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold" style={{ color }}>{value}%</span>
        <span className="text-[#9acfd3] text-xs mb-1">de risque</span>
      </div>
      <div className="h-1.5 bg-[#0d2b33] rounded-full mt-2 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          animate={{ width: `${value}%` }} transition={{ duration: 1 }} />
      </div>
    </div>
  );
}

function NDVIView({ ndvi }: { ndvi: number }) {
  const color = ndvi > 0.6 ? "#22c55e" : ndvi > 0.4 ? "#84cc16" : ndvi > 0.2 ? "#f59e0b" : "#ef4444";
  const label = ndvi > 0.6 ? "Vegetation dense - bonne sante" : ndvi > 0.4 ? "Vegetation moderee" : ndvi > 0.2 ? "Stress hydrique possible" : "Stress severe detecte";
  const cells = Array.from({ length: 192 }, (_, i) => {
    const row = Math.floor(i / 16), col = i % 16;
    const base = 0.3 + 0.5 * Math.sin(row * 0.8) * Math.cos(col * 0.7);
    const v = Math.min(1, Math.max(0, ndvi * base + (Math.random() - 0.5) * 0.1));
    const g = Math.round(80 + v * 120), r = Math.round(20 + (1 - v) * 60);
    return `rgb(${r},${g},40)`;
  });
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#9acfd3] text-xs uppercase tracking-widest">Camera NIR — Analyse NDVI</span>
        <span className="text-xs px-2 py-1 rounded-full border" style={{ color, borderColor: color, backgroundColor: `${color}15` }}>NDVI {ndvi.toFixed(3)}</span>
      </div>
      <div className="grid rounded-xl overflow-hidden" style={{ gridTemplateColumns: "repeat(16, 1fr)", gap: "1px", backgroundColor: "#050f12" }}>
        {cells.map((c, i) => (
          <div key={i} className="aspect-square rounded-sm transition-colors duration-1000" style={{ backgroundColor: c }} />
        ))}
      </div>
      <p className="text-[#9acfd3] text-xs mt-2 text-center">{label}</p>
    </div>
  );
}

export default function DemoPage() {
  const [data, setData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<{ temp: HistPoint[]; hum: HistPoint[]; ndvi: HistPoint[] }>({ temp: [], hum: [], ndvi: [] });
  const [alerts, setAlerts] = useState<string[]>([]);
  const [lastSent, setLastSent] = useState<string>("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/simulate");
    const d: SensorData = await res.json();
    setData(d);
    const t = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setHistory(h => ({
      temp: [...h.temp.slice(-30), { t, v: d.temp_air }],
      hum: [...h.hum.slice(-30), { t, v: d.humidity_sol }],
      ndvi: [...h.ndvi.slice(-30), { t, v: d.ndvi }],
    }));
    if (d.risk_mildiou > 65 && !alerts.includes("mildiou")) {
      setAlerts(a => [`${t} — Risque mildiou ${d.risk_mildiou}% : traiter jeudi 7h-10h, dose 0.75 L/ha`, ...a.slice(0, 4)]);
    }
    setLastSent(t);
  }, [alerts]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 3000);
    return () => clearInterval(id);
  }, [fetchData]);

  if (!data) return (
    <div className="min-h-screen bg-[#050f12] flex items-center justify-center">
      <div className="text-[#2a9d8f] text-lg animate-pulse">Initialisation du boitier...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050f12] text-white">
      {/* Header */}
      <div className="border-b border-[#2a9d8f]/20 bg-[#0d2b33]/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#2a9d8f] rounded-full animate-pulse" />
          <span className="font-bold text-[#2a9d8f]">AgroWorld</span>
          <span className="text-[#9acfd3] text-sm">Parcelle Demo — Ble tendre</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#9acfd3]">
          <span>Batterie {data.battery_pct}%</span>
          <span className={`px-2 py-1 rounded-full border ${data.lora_ok ? "border-green-500/40 text-green-400" : "border-red-500/40 text-red-400"}`}>
            LoRa {data.rssi} dBm
          </span>
          <span>Dernier envoi {lastSent}</span>
          <span className="px-2 py-1 rounded-full bg-amber-900/20 border border-amber-500/30 text-amber-400 font-semibold">SIMULATION</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Colonne 1 - Capteurs air + sol */}
        <div className="space-y-4">
          {/* Air */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#2a9d8f] text-xs uppercase tracking-widest">BME280 — Air</span>
              <span className="text-xs text-[#9acfd3]">I2C pin 8/9</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { l: "Temperature", v: `${data.temp_air}°C`, sub: "air" },
                { l: "Humidite", v: `${data.humidity_air}%`, sub: "relative" },
                { l: "Pression", v: `${data.pressure}`, sub: "hPa" },
              ].map(m => (
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-white">{m.v}</div>
                  <div className="text-[#9acfd3] text-xs mt-1">{m.sub}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9acfd3] text-xs">Evolution temperature air</span>
              <MiniChart history={history.temp} color="#2a9d8f" />
            </div>
          </div>

          {/* Sol NPK */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#2a9d8f] text-xs uppercase tracking-widest">Sonde NPK — Sol</span>
              <span className="text-xs text-[#9acfd3]">RS485 Modbus</span>
            </div>
            <div className="space-y-3">
              <Gauge value={data.humidity_sol} max={100} label="Humidite sol" unit="%" color="#2a9d8f" />
              <Gauge value={data.temp_sol} max={40} label="Temperature sol" unit="°C" color="#4a9d6f" />
              <Gauge value={data.ph} max={14} label="pH" unit="" color="#9d7a2a" />
              <Gauge value={data.n} max={300} label="Azote N" unit="mg/kg" color="#2a6b9d" />
              <Gauge value={data.p} max={150} label="Phosphore P" unit="mg/kg" color="#9d2a6b" />
              <Gauge value={data.k} max={400} label="Potassium K" unit="mg/kg" color="#6b2a9d" />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[#9acfd3] text-xs">Evolution humidite sol</span>
              <MiniChart history={history.hum} color="#4a9d6f" />
            </div>
          </div>
        </div>

        {/* Colonne 2 - NDVI + Meteo */}
        <div className="space-y-4">
          {/* Camera NIR NDVI */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <NDVIView ndvi={data.ndvi} />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[#9acfd3] text-xs">Evolution NDVI</span>
              <MiniChart history={history.ndvi} color="#22c55e" />
            </div>
          </div>

          {/* Meteo */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#2a9d8f] text-xs uppercase tracking-widest">BH1750 + Meteo</span>
              <span className="text-xs text-[#9acfd3]">GPIO + I2C</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Luminosite", v: `${data.lux}`, u: "lux" },
                { l: "Vent", v: `${data.wind_speed}`, u: "m/s" },
                { l: "Direction", v: `${data.wind_dir}`, u: "deg" },
                { l: "Pluie", v: `${data.rain_mm}`, u: "mm/h" },
              ].map(m => (
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-3">
                  <div className="text-[#9acfd3] text-xs mb-1">{m.l}</div>
                  <div className="text-lg font-bold text-white">{m.v} <span className="text-xs font-normal text-[#9acfd3]">{m.u}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne 3 - World Model + Alertes */}
        <div className="space-y-4">
          {/* World Model risques */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#2a9d8f] text-xs uppercase tracking-widest">World Model — Risques 48h</span>
              <span className="text-xs text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded-full">SIMULE</span>
            </div>
            <div className="space-y-3">
              <RiskBadge label="Mildiou" value={Number(data.risk_mildiou)} />
              <RiskBadge label="Rouille" value={Number(data.risk_rouille)} />
            </div>
          </div>

          {/* Alertes */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#2a9d8f] text-xs uppercase tracking-widest">Alertes recentes</span>
              <span className="text-xs text-[#9acfd3]">{alerts.length} alerte{alerts.length > 1 ? "s" : ""}</span>
            </div>
            <AnimatePresence>
              {alerts.length === 0 ? (
                <p className="text-[#9acfd3] text-sm text-center py-4">Aucune alerte active</p>
              ) : alerts.map((a, i) => (
                <motion.div key={a} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-red-900/15 border border-red-500/30 rounded-xl p-3 mb-2 text-sm text-[#fca5a5]">
                  {a}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* LoRa status */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#2a9d8f] text-xs uppercase tracking-widest">LoRa — TTN</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "RSSI", v: `${data.rssi} dBm` },
                { l: "SNR", v: `${data.snr} dB` },
                { l: "Frequence", v: "868 MHz" },
                { l: "Spread. Factor", v: "SF9" },
              ].map(m => (
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-3">
                  <div className="text-[#9acfd3] text-xs mb-1">{m.l}</div>
                  <div className="text-sm font-bold text-white">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
