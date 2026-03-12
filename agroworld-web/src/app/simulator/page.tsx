"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  REGIONS, SOILS, CROPS, runSimulation,
  type Region, type SoilType, type Crop,
  type WeatherEvent, type ActionTaken, type DayState, type SimConfig,
} from "@/lib/sim-engine";

// ─── Mini SVG Chart ──────────────────────────────────────────────────────────
function Spark({ vals, color, h = 48 }: { vals: number[]; color: string; h?: number }) {
  if (vals.length < 2) return null;
  const min = Math.min(...vals), max = Math.max(...vals), range = (max - min) || 1;
  const W = 300;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${h - 4 - ((v - min) / range) * (h - 8)}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" className="w-full">
      <defs><linearGradient id={`g${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${W},${h}`} fill={`url(#g${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Timeline Bar ────────────────────────────────────────────────────────────
function TimelineBar({ total, current, events, onSeek, crop }: {
  total: number; current: number; events: WeatherEvent[]; onSeek: (d: number) => void; crop: Crop;
}) {
  const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  const pct = (d: number) => (d / (total - 1)) * 100;
  return (
    <div className="relative h-12 bg-[#0d2b33] rounded-xl overflow-hidden cursor-pointer select-none"
      onClick={e => { const r = e.currentTarget.getBoundingClientRect(); onSeek(Math.round(((e.clientX - r.left) / r.width) * (total - 1))); }}>
      {/* Events */}
      {events.map(evt => {
        const colors: Record<string,string> = { drought:"#f59e0b", heavy_rain:"#60a5fa", frost:"#c4b5fd", heatwave:"#f87171", hail:"#94a3b8", disease_pressure:"#f472b6" };
        return (
          <div key={evt.id} className="absolute top-0 h-full opacity-40 rounded"
            style={{ left:`${pct(evt.dayStart)}%`, width:`${pct(evt.duration)}%`, backgroundColor: colors[evt.type] ?? "#999" }}
            title={evt.label}
          />
        );
      })}
      {/* Harvest line */}
      <div className="absolute top-0 h-full w-0.5 bg-yellow-400/60" style={{ left:`${pct(crop.harvestDays)}%` }} title="Récolte possible" />
      {/* Month ticks */}
      {MONTHS.map((m, i) => (
        <div key={m} className="absolute top-0 h-full flex flex-col items-center" style={{ left:`${(i / 12) * 100}%` }}>
          <div className="w-px h-3 bg-[#2a9d8f]/40" />
          <span className="text-[9px] text-[#9acfd3]/60 mt-0.5">{m}</span>
        </div>
      ))}
      {/* Progress */}
      <div className="absolute top-0 h-full bg-[#2a9d8f]/20 pointer-events-none" style={{ width:`${pct(current)}%` }} />
      {/* Cursor */}
      <div className="absolute top-0 h-full w-0.5 bg-[#2a9d8f] pointer-events-none transition-all duration-100"
        style={{ left:`${pct(current)}%` }} />
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetCard({ label, value, unit, color, sparkData }: {
  label: string; value: string; unit: string; color: string; sparkData?: number[];
}) {
  return (
    <div className="bg-[#050f12]/60 border border-[#2a9d8f]/15 rounded-xl p-3">
      <div className="flex justify-between text-xs text-[#9acfd3] mb-1">
        <span>{label}</span><span className="text-white font-semibold">{value}<span className="font-normal text-[#9acfd3] ml-1">{unit}</span></span>
      </div>
      {sparkData && <Spark vals={sparkData} color={color} h={32} />}
    </div>
  );
}

// ─── Risk Badge ──────────────────────────────────────────────────────────────
function Risk({ label, value }: { label: string; value: number }) {
  const c = value > 65 ? "#ef4444" : value > 35 ? "#f59e0b" : "#22c55e";
  const s = value > 65 ? "ALERTE" : value > 35 ? "VIGILANCE" : "OK";
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#2a9d8f]/10 last:border-0">
      <span className="text-[#9acfd3] text-xs">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-[#0d2b33] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width:`${value}%`, backgroundColor:c }} />
        </div>
        <span className="text-xs font-bold w-14 text-right" style={{ color:c }}>{Math.round(value)}% {s}</span>
      </div>
    </div>
  );
}

// ─── Setup Step ──────────────────────────────────────────────────────────────
function SetupPanel({ onStart }: { onStart: (cfg: SimConfig, events: WeatherEvent[]) => void }) {
  const [region, setRegion] = useState(REGIONS[0]);
  const [soil, setSoil] = useState(SOILS[0]);
  const [crop, setCrop] = useState(CROPS[0]);
  const [sowMonth, setSowMonth] = useState(crop.sowMonths[0]);
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [evtType, setEvtType] = useState<WeatherEvent["type"]>("drought");
  const [evtDay, setEvtDay] = useState(120);
  const [evtDur, setEvtDur] = useState(14);
  const [evtInt, setEvtInt] = useState(0.8);
  const MONTH_NAMES = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  const EVT_LABELS: Record<string,string> = { drought:"Sécheresse", heavy_rain:"Pluies intenses", frost:"Gel tardif", heatwave:"Canicule", hail:"Grêle", disease_pressure:"Pression maladie" };
  const EVT_COLORS: Record<string,string> = { drought:"text-amber-400", heavy_rain:"text-blue-400", frost:"text-purple-300", heatwave:"text-red-400", hail:"text-slate-400", disease_pressure:"text-pink-400" };

  const addEvent = () => {
    const id = Math.random().toString(36).slice(2);
    setEvents(ev => [...ev, { id, dayStart:evtDay, duration:evtDur, type:evtType, intensity:evtInt, label:`${EVT_LABELS[evtType]} (J${evtDay})` }]);
  };

  return (
    <div className="min-h-screen bg-[#050f12] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AgroWorld <span className="text-[#2a9d8f]">Simulateur</span></h1>
          <p className="text-[#9acfd3]">Configurez votre parcelle et simulez une saison complète</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Region */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Région</h3>
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map(r => (
                <button key={r.id} onClick={() => setRegion(r)}
                  className={`text-left px-3 py-2 rounded-xl text-sm border transition-all ${region.id === r.id ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white" : "border-[#2a9d8f]/15 text-[#9acfd3] hover:border-[#2a9d8f]/30"}`}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          {/* Crop + Soil */}
          <div className="space-y-4">
            <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
              <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Culture</h3>
              <div className="grid grid-cols-1 gap-2">
                {CROPS.map(c => (
                  <button key={c.id} onClick={() => { setCrop(c); setSowMonth(c.sowMonths[0]); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${crop.id === c.id ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white" : "border-[#2a9d8f]/15 text-[#9acfd3] hover:border-[#2a9d8f]/30"}`}>
                    <span className="text-base">{c.icon}</span>{c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Soil */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Type de sol</h3>
            <div className="space-y-2">
              {SOILS.map(s => (
                <button key={s.id} onClick={() => setSoil(s)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition-all ${soil.id === s.id ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white" : "border-[#2a9d8f]/15 text-[#9acfd3] hover:border-[#2a9d8f]/30"}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          {/* Sow month + Events */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5">
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Semis</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {crop.sowMonths.map(m => (
                <button key={m} onClick={() => setSowMonth(m)}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${sowMonth === m ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white" : "border-[#2a9d8f]/15 text-[#9acfd3]"}`}>
                  {MONTH_NAMES[m - 1]}
                </button>
              ))}
            </div>
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Événements météo</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <select value={evtType} onChange={e => setEvtType(e.target.value as WeatherEvent["type"])}
                className="bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-xl px-2 py-2 col-span-2">
                {Object.entries(EVT_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <div>
                <label className="text-[9px] text-[#9acfd3] uppercase">Jour de début</label>
                <input type="number" value={evtDay} onChange={e => setEvtDay(Number(e.target.value))} min={1} max={300}
                  className="w-full bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-xl px-2 py-1.5 mt-0.5" />
              </div>
              <div>
                <label className="text-[9px] text-[#9acfd3] uppercase">Durée (jours)</label>
                <input type="number" value={evtDur} onChange={e => setEvtDur(Number(e.target.value))} min={1} max={60}
                  className="w-full bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-xl px-2 py-1.5 mt-0.5" />
              </div>
            </div>
            <button onClick={addEvent} className="w-full text-xs py-2 rounded-xl bg-[#2a9d8f]/15 border border-[#2a9d8f]/30 text-[#2a9d8f] hover:bg-[#2a9d8f]/25 transition-all mb-3">
              + Ajouter cet événement
            </button>
            {events.map(e => (
              <div key={e.id} className={`flex items-center justify-between text-xs py-1 ${EVT_COLORS[e.type]}`}>
                <span>{e.label}</span>
                <button onClick={() => setEvents(ev => ev.filter(x => x.id !== e.id))} className="text-[#9acfd3] hover:text-white ml-2">✕</button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => onStart({ region, soil, crop, sowDay: sowMonth * 30 - 25, startYear: 2025, seed: 42 }, events)}
          className="w-full py-4 bg-[#2a9d8f] hover:bg-[#1a6b5e] text-white font-bold rounded-2xl text-lg transition-all hover:scale-[1.01]">
          Lancer la simulation →
        </button>
      </div>
    </div>
  );
}

// ─── Main Simulator Dashboard ─────────────────────────────────────────────────
function SimDashboard({ config, events, onReset }: {
  config: SimConfig; events: WeatherEvent[]; onReset: () => void;
}) {
  const [days, setDays] = useState<DayState[]>([]);
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(7); // days per tick
  const [chartKey, setChartKey] = useState<keyof DayState>("tempMean");
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [irrigAmt, setIrrigAmt] = useState(20);
  const [nAmt, setNAmt] = useState(50);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDays(runSimulation(config, events, actions));
  }, [config, events, actions]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrent(c => {
          if (c >= (days.length - 1)) { setPlaying(false); return c; }
          return Math.min(c + speed, days.length - 1);
        });
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, days.length]);

  const d = days[current];
  if (!d || days.length === 0) return <div className="min-h-screen bg-[#050f12] flex items-center justify-center text-[#2a9d8f] animate-pulse">Calcul en cours...</div>;

  const sparkFor = (key: keyof DayState, n = 60) =>
    days.slice(Math.max(0, current - n), current + 1).map(dd => Number(dd[key]) || 0);

  const doAction = (type: ActionTaken["type"], value: number, label: string) => {
    const act: ActionTaken = { day: current, type, value, label };
    setActions(prev => [...prev.filter(a => !(a.day === current && a.type === type)), act]);
    setShowActionPanel(false);
  };

  const CHART_OPTIONS: { key: keyof DayState; label: string; color: string; unit: string }[] = [
    { key:"tempMean", label:"Température", color:"#f87171", unit:"°C" },
    { key:"humiditySol", label:"Humidité sol", color:"#2a9d8f", unit:"%" },
    { key:"ndvi", label:"NDVI", color:"#22c55e", unit:"" },
    { key:"riskMildiou", label:"Risque mildiou", color:"#f472b6", unit:"%" },
    { key:"n", label:"Azote N", color:"#60a5fa", unit:"mg/kg" },
    { key:"yieldPotential", label:"Potentiel récolte", color:"#fbbf24", unit:"%" },
  ];
  const selected = CHART_OPTIONS.find(o => o.key === chartKey) ?? CHART_OPTIONS[0];
  const chartData = days.map(dd => Number(dd[chartKey]) || 0);

  return (
    <div className="min-h-screen bg-[#050f12] text-white flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[#2a9d8f]/20 bg-[#0d2b33]/80 backdrop-blur px-4 py-3 flex items-center gap-4 flex-wrap sticky top-0 z-20">
        <button onClick={onReset} className="text-[#9acfd3] hover:text-white text-xs transition-colors">← Reconfigurer</button>
        <div className="flex items-center gap-2">
          <span className="text-[#2a9d8f] font-bold">{config.crop.icon} {config.crop.name}</span>
          <span className="text-[#9acfd3] text-sm">·</span>
          <span className="text-[#9acfd3] text-sm">{config.region.name}</span>
          <span className="text-[#9acfd3] text-sm">·</span>
          <span className="text-[#9acfd3] text-sm">{config.soil.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-white font-semibold text-sm">J{current+1} — {d.date}</span>
          <span className="text-[#9acfd3] text-xs">{Math.round(d.growthStage)}% croissance</span>
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
            className="bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-lg px-2 py-1">
            <option value={1}>1x</option><option value={3}>3x</option><option value={7}>7x</option>
            <option value={14}>14x</option><option value={30}>30x</option>
          </select>
          <button onClick={() => setPlaying(p => !p)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${playing ? "bg-red-900/30 border-red-500/50 text-red-400" : "bg-[#2a9d8f]/20 border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f]/30"}`}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={() => { setPlaying(false); setCurrent(0); }} className="text-[#9acfd3] hover:text-white text-xs transition-colors">⏮ Reset</button>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 pt-3 pb-2">
        <TimelineBar total={days.length} current={current} events={events} onSeek={setCurrent} crop={config.crop} />
      </div>

      {/* Alerts bar */}
      {d.alerts.length > 0 && (
        <div className="mx-4 mb-2 flex gap-2 flex-wrap">
          {d.alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-xl px-3 py-1.5 text-xs text-red-300">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shrink-0" />{a}
            </div>
          ))}
        </div>
      )}

      {/* Main grid */}
      <div className="flex-1 grid lg:grid-cols-3 gap-3 px-4 pb-4">

        {/* Left - sensors */}
        <div className="space-y-3">
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Météo & Air</div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[{ l:"T° min", v:`${d.tempMin}°` },{ l:"T° moy", v:`${d.tempMean}°` },{ l:"T° max", v:`${d.tempMax}°` }].map(m => (
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                  <div className="text-white font-bold text-sm">{m.v}</div>
                  <div className="text-[#9acfd3] text-xs">{m.l}</div>
                </div>
              ))}
            </div>
            <MetCard label="Humidité air" value={`${d.humidityAir}`} unit="%" color="#60a5fa" sparkData={sparkFor("humidityAir")} />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[{ l:"Pluie", v:`${d.rainMm}mm` },{ l:"Vent", v:`${d.windSpeed}m/s` },{ l:"Lux", v:`${d.lux}` }].map(m => (
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                  <div className="text-white font-bold text-xs">{m.v}</div>
                  <div className="text-[#9acfd3] text-[10px]">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Sol — Sonde NPK</div>
            <MetCard label="Humidité sol" value={`${d.humiditySol}`} unit="%" color="#2a9d8f" sparkData={sparkFor("humiditySol")} />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[{ l:"N", v:d.n, c:"#60a5fa" },{ l:"P", v:d.p, c:"#f472b6" },{ l:"K", v:d.k, c:"#a78bfa" }].map(m => (
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                  <div className="font-bold text-xs" style={{ color:m.c }}>{m.v}</div>
                  <div className="text-[#9acfd3] text-[10px]">{m.l} mg/kg</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                <div className="text-white font-bold text-sm">{d.ph}</div>
                <div className="text-[#9acfd3] text-xs">pH</div>
              </div>
              <div className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                <div className={`font-bold text-sm ${d.waterStress > 0.5 ? "text-red-400" : "text-green-400"}`}>{Math.round(d.waterStress * 100)}%</div>
                <div className="text-[#9acfd3] text-xs">Stress hydrique</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - chart */}
        <div className="space-y-3">
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[#2a9d8f] text-xs uppercase tracking-widest">Evolution saison</div>
              <select value={chartKey as string} onChange={e => setChartKey(e.target.value as keyof DayState)}
                className="bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-lg px-2 py-1">
                {CHART_OPTIONS.map(o => <option key={o.key as string} value={o.key as string}>{o.label}</option>)}
              </select>
            </div>
            <div className="relative">
              <Spark vals={chartData.slice(0, current + 1)} color={selected.color} h={120} />
              <div className="absolute right-2 bottom-2 text-lg font-bold" style={{ color:selected.color }}>
                {Number(d[chartKey]).toFixed(selected.unit === "" ? 3 : 1)} <span className="text-sm font-normal">{selected.unit}</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex gap-1 flex-wrap mt-2">
              {CHART_OPTIONS.map(o => (
                <button key={o.key as string} onClick={() => setChartKey(o.key)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${chartKey === o.key ? "text-white border-opacity-60" : "text-[#9acfd3] border-[#2a9d8f]/20 hover:border-[#2a9d8f]/40"}`}
                  style={{ borderColor: chartKey === o.key ? o.color : undefined, backgroundColor: chartKey === o.key ? `${o.color}20` : undefined }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {/* NDVI visual */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#2a9d8f] text-xs uppercase tracking-widest">NDVI — Caméra NIR</span>
              <span className="text-xs font-bold" style={{ color: d.ndvi > 0.6 ? "#22c55e" : d.ndvi > 0.35 ? "#f59e0b" : "#ef4444" }}>
                {d.ndvi.toFixed(3)} — {d.ndvi > 0.6 ? "Bonne santé" : d.ndvi > 0.35 ? "Végétation modérée" : "Stress détecté"}
              </span>
            </div>
            <div className="grid rounded-lg overflow-hidden" style={{ gridTemplateColumns:"repeat(20,1fr)", gap:"1px", backgroundColor:"#050f12" }}>
              {Array.from({ length: 120 }, (_, i) => {
                const row = Math.floor(i / 20), col = i % 20;
                const base = 0.3 + 0.5 * Math.sin(row * 0.9 + d.day * 0.02) * Math.cos(col * 0.7);
                const v = Math.min(1, Math.max(0, d.ndvi * base));
                const g = Math.round(60 + v * 140), r = Math.round(10 + (1 - v) * 50);
                return <div key={i} className="aspect-square" style={{ backgroundColor:`rgb(${r},${g},30)` }} />;
              })}
            </div>
          </div>
        </div>

        {/* Right - World Model + Actions */}
        <div className="space-y-3">
          {/* Growth + yield */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Culture {config.crop.icon}</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(d.growthStage)}%</div>
                <div className="text-[#9acfd3] text-xs">Stade de croissance</div>
                <div className="h-1.5 bg-[#0d2b33] rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-[#2a9d8f] rounded-full transition-all" style={{ width:`${d.growthStage}%` }} />
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${d.yieldPotential > 70 ? "text-green-400" : d.yieldPotential > 40 ? "text-amber-400" : "text-red-400"}`}>
                  {Math.round(d.yieldPotential)}%
                </div>
                <div className="text-[#9acfd3] text-xs">Potentiel récolte</div>
                <div className="h-1.5 bg-[#0d2b33] rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${d.yieldPotential > 70 ? "bg-green-400" : d.yieldPotential > 40 ? "bg-amber-400" : "bg-red-500"}`}
                    style={{ width:`${d.yieldPotential}%` }} />
                </div>
              </div>
            </div>
            {d.weatherEvent && (
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-300 text-xs mb-2">
                {d.weatherEvent}
              </div>
            )}
          </div>

          {/* World Model risks */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">World Model — Risques 48h</div>
            <Risk label={config.crop.diseases[0] || "Mildiou"} value={d.riskMildiou} />
            <Risk label={config.crop.diseases[1] || "Rouille"} value={d.riskRouille} />
            <Risk label={config.crop.diseases[2] || "Botrytis"} value={d.riskBotrytis} />
          </div>

          {/* Actions */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[#2a9d8f] text-xs uppercase tracking-widest">Actions — J{current + 1}</div>
            </div>
            {!showActionPanel ? (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { t:"irrigate" as const, l:"Irriguer", c:"#60a5fa", show: d.waterStress > 0.3 || true },
                  { t:"fungicide" as const, l:"Fongicide", c:"#f472b6", show: d.riskMildiou > 30 || true },
                  { t:"fertilize_n" as const, l:"Apport N", c:"#a78bfa", show: d.n < 80 || true },
                  { t:"harvest" as const, l:"Récolter", c:"#fbbf24", show: d.growthStage > 90 },
                ].map(a => a.show ? (
                  <button key={a.t} onClick={() => { setShowActionPanel(true); }}
                    className="py-2 px-3 rounded-xl border text-xs font-semibold transition-all hover:opacity-80"
                    style={{ borderColor:`${a.c}40`, backgroundColor:`${a.c}10`, color:a.c }}>
                    {a.l}
                  </button>
                ) : null)}
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={() => doAction("irrigate", irrigAmt, `Irrigation ${irrigAmt}mm`)}
                  className="w-full py-2 rounded-xl bg-blue-900/20 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-blue-900/30 transition-all">
                  Irriguer {irrigAmt}mm
                </button>
                <input type="range" min={5} max={50} value={irrigAmt} onChange={e => setIrrigAmt(Number(e.target.value))}
                  className="w-full accent-blue-400" />
                <button onClick={() => doAction("fungicide", 0.75, "Fongicide dose 0.75L/ha")}
                  className="w-full py-2 rounded-xl bg-pink-900/20 border border-pink-500/30 text-pink-300 text-xs font-semibold hover:bg-pink-900/30 transition-all">
                  Fongicide 0.75 L/ha
                </button>
                <button onClick={() => doAction("fertilize_n", nAmt, `Apport N ${nAmt} UN`)}
                  className="w-full py-2 rounded-xl bg-purple-900/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-900/30 transition-all">
                  Apport N {nAmt} UN
                </button>
                <input type="range" min={20} max={150} value={nAmt} onChange={e => setNAmt(Number(e.target.value))}
                  className="w-full accent-purple-400" />
                {d.growthStage > 90 && (
                  <button onClick={() => doAction("harvest", 1, "Récolte")}
                    className="w-full py-2 rounded-xl bg-amber-900/20 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-900/30 transition-all">
                    Récolter — Potentiel {Math.round(d.yieldPotential)}%
                  </button>
                )}
                <button onClick={() => setShowActionPanel(false)} className="w-full text-xs text-[#9acfd3] hover:text-white transition-colors">Annuler</button>
              </div>
            )}
            {/* Action log */}
            <div className="mt-3 space-y-1 max-h-28 overflow-y-auto">
              {actions.map((a, i) => (
                <div key={i} className="text-xs text-[#9acfd3] flex justify-between">
                  <span>J{a.day + 1}</span><span>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const [config, setConfig] = useState<SimConfig | null>(null);
  const [events, setEvents] = useState<WeatherEvent[]>([]);

  if (!config) return <SetupPanel onStart={(cfg, evts) => { setConfig(cfg); setEvents(evts); }} />;
  return <SimDashboard config={config} events={events} onReset={() => setConfig(null)} />;
}
