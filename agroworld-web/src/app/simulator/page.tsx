"use client";
import { useState, useEffect, useRef } from "react";
import {
  REGIONS, SOILS, CROPS, runSimulation,
  type Region, type SoilType, type Crop,
  type WeatherEvent, type ActionTaken, type DayState, type SimConfig,
} from "@/lib/sim-engine";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

function Spark({ vals, color, h = 48 }: { vals: number[]; color: string; h?: number }) {
  if (vals.length < 2) return null;
  const min = Math.min(...vals), max = Math.max(...vals), range = (max - min) || 1;
  const W = 300;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${h - 4 - ((v - min) / range) * (h - 8)}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" className="w-full">
      <defs><linearGradient id={`g${color.replace(/#/g,"")}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${W},${h}`} fill={`url(#g${color.replace(/#/g,"")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Guided Recommendation Engine ────────────────────────────────────────────
type Recommendation = {
  type: ActionTaken["type"];
  title: string;
  why: string;
  dose: number;
  doseLabel: string;
  justification: string;
  source: string;
  costBenefit: string;
  urgency: "high" | "medium" | "low";
};

function getRecommendations(d: DayState, crop: Crop, soil: SoilType): Recommendation[] {
  const recs: Recommendation[] = [];

  // Irrigation
  if (d.waterStress > 0.35) {
    const deficit = soil.fieldCapacity - d.humiditySol;
    const dose = Math.round(clamp(deficit * 3.5, 10, 45));
    const urgency = d.waterStress > 0.65 ? "high" : "medium";
    recs.push({
      type: "irrigate", urgency,
      title: "Irrigation nécessaire",
      why: `Humidité sol : ${d.humiditySol}% — seuil critique : ${(soil.wiltingPoint * 1.5).toFixed(0)}% (point de flétrissement ${soil.wiltingPoint}%). Stress hydrique mesuré : ${Math.round(d.waterStress * 100)}%.`,
      dose, doseLabel: `${dose} mm`,
      justification: `Apport calculé sur déficit sol : (${soil.fieldCapacity}% - ${d.humiditySol}%) × profondeur enracinement = ${dose} mm. Equivalent ${dose * 10} m³/ha. Au-delà de ${soil.fieldCapacity}% le drainage devient excessif.`,
      source: "Méthode bilan hydrique FAO-56 — Chambre d'Agriculture",
      costBenefit: `Coût irrigation : ${Math.round(dose * 10 * 0.08)} €/ha. Perte de rendement évitée estimée : ${Math.round(d.waterStress * 15)} % × rendement potentiel.`,
    });
  }

  // Fongicide
  const mainDisease = crop.diseases[0];
  if (d.riskMildiou > 55) {
    const dose = d.riskMildiou > 75 ? 1.0 : 0.75;
    recs.push({
      type: "fungicide", urgency: d.riskMildiou > 75 ? "high" : "medium",
      title: `Traitement ${mainDisease} recommandé`,
      why: `Risque ${mainDisease} : ${Math.round(d.riskMildiou)}% — T° ${d.tempMean}°C (optimum sporulation 15-22°C) + Humidité air ${d.humidityAir}% (seuil : >75%). Conditions réunies depuis 2-3 jours.`,
      dose, doseLabel: `${dose} L/ha`,
      justification: `Dose ${dose} L/ha (pleine dose = 1.0 L/ha). Réduction dose possible car interception précoce. Fenêtre d'application : matin avant 10h ou après 18h (éviter rosée et chaleur). Ne pas traiter si pluie <6h.`,
      source: "ARVALIS — guide fongicides céréales 2024, modèle Septo-LNR",
      costBenefit: `Coût traitement : ${Math.round(dose * 24)} €/ha. Sans traitement à ce stade : risque perte ${Math.round(d.riskMildiou * 0.3)} % rendement soit ${Math.round(d.riskMildiou * 0.3 * 1.8)} €/ha sur blé 200€/t.`,
    });
  }

  // Azote
  if (d.n < 40 && d.growthStage > 15 && d.growthStage < 85) {
    const stageCoeff = d.growthStage < 50 ? 0.4 : 0.25;
    const dose = Math.round(clamp((40 - d.n) * 1.2 + crop.nUptakeTotal * stageCoeff, 20, 120));
    recs.push({
      type: "fertilize_n", urgency: d.n < 20 ? "high" : "medium",
      title: "Apport azoté nécessaire",
      why: `Azote sol mesuré : ${d.n} mg/kg — seuil carence : 35 mg/kg. Stade cultural : ${Math.round(d.growthStage)}% (${d.growthStage < 40 ? "tallage/montaison" : d.growthStage < 70 ? "montaison/épiaison" : "grain/maturation"}). Besoin maximal de la culture à ce stade.`,
      dose, doseLabel: `${dose} UN/ha`,
      justification: `Calcul : (objectif N = 35 mg/kg - mesuré ${d.n} mg/kg) × facteur sol + besoin stade. Méthode bilan : ${dose} UN correspond à ${Math.round(dose / 0.46)} kg urée/ha (460g N/kg). Fractionnement recommandé si dose > 80 UN.`,
      source: "Méthode bilan azote — COMIFER / Terres Inovia 2023",
      costBenefit: `Coût : ${Math.round(dose * 0.46 * 0.55)} €/ha (urée à 550€/t). Rendement supplémentaire attendu : +${(dose * 0.012).toFixed(1)} t/ha soit +${Math.round(dose * 0.012 * 200)} €/ha.`,
    });
  }

  // Récolte
  if (d.growthStage >= 97) {
    recs.push({
      type: "harvest", urgency: "medium",
      title: "Parcelle prête à la récolte",
      why: `Stade : ${Math.round(d.growthStage)}% — maturité physiologique atteinte. NDVI : ${d.ndvi.toFixed(3)} (valeur basse = sénescence avancée). Potentiel rendement actuel : ${Math.round(d.yieldPotential)}%.`,
      dose: 1, doseLabel: "Récolter",
      justification: `Attendre conditions optimales : humidité grain < 15%, 3 jours sans pluie. Chaque jour supplémentaire = risque météo sans gain de rendement. Potentiel actuel : ${Math.round(d.yieldPotential)}% — perd ~0.3%/jour à ce stade.`,
      source: "Guide récolte ARVALIS — Cereobs météo moisson",
      costBenefit: `Rendement estimé : ${(crop.id === "ble" ? 7 : crop.id === "mais" ? 10 : 3.5) * d.yieldPotential / 100} t/ha. Valeur : ${Math.round((crop.id === "ble" ? 7 : crop.id === "mais" ? 10 : 3.5) * d.yieldPotential / 100 * 200)} €/ha.`,
    });
  }

  return recs;
}

// ─── Guided Action Panel ──────────────────────────────────────────────────────
function GuidedPanel({ rec, onApply, onSkip, customDose, setCustomDose }: {
  rec: Recommendation; onApply: (dose: number) => void; onSkip: () => void;
  customDose: number; setCustomDose: (v: number) => void;
}) {
  const urgencyColor = rec.urgency === "high" ? "#ef4444" : rec.urgency === "medium" ? "#f59e0b" : "#22c55e";
  const urgencyLabel = rec.urgency === "high" ? "URGENT" : rec.urgency === "medium" ? "RECOMMANDÉ" : "OPTIONNEL";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onSkip}>
      <div className="max-w-lg w-full bg-[#0d2b33] border border-[#2a9d8f]/40 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: urgencyColor, backgroundColor: `${urgencyColor}20` }}>{urgencyLabel}</span>
            <h3 className="text-white font-bold text-lg">{rec.title}</h3>
          </div>
          <button onClick={onSkip} className="text-[#9acfd3] hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="bg-[#050f12]/60 rounded-xl p-3">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-1">Pourquoi maintenant</div>
            <p className="text-[#9acfd3] text-sm leading-relaxed">{rec.why}</p>
          </div>
          <div className="bg-[#050f12]/60 rounded-xl p-3">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-1">Dose recommandée — {rec.doseLabel}</div>
            <p className="text-[#9acfd3] text-sm leading-relaxed">{rec.justification}</p>
          </div>
          <div className="bg-[#050f12]/60 rounded-xl p-3">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-1">Coût / Bénéfice</div>
            <p className="text-[#9acfd3] text-sm leading-relaxed">{rec.costBenefit}</p>
          </div>
          <div className="text-[10px] text-[#1a6b5e] italic">{rec.source}</div>
        </div>

        {rec.type !== "harvest" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#9acfd3] mb-1">
              <span>Ajuster la dose</span>
              <span className="text-white font-bold">{customDose} {rec.type === "irrigate" ? "mm" : rec.type === "fertilize_n" ? "UN/ha" : "L/ha"}</span>
            </div>
            <input type="range"
              min={rec.type === "irrigate" ? 5 : rec.type === "fertilize_n" ? 10 : 0.25}
              max={rec.type === "irrigate" ? 50 : rec.type === "fertilize_n" ? 150 : 1.5}
              step={rec.type === "fertilize_n" ? 5 : 0.05}
              value={customDose} onChange={e => setCustomDose(Number(e.target.value))}
              className="w-full accent-[#2a9d8f]" />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => onApply(customDose)}
            className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: urgencyColor }}>
            {rec.type === "harvest" ? "Récolter maintenant" : `Appliquer ${customDose} ${rec.type === "irrigate" ? "mm" : rec.type === "fertilize_n" ? "UN" : "L/ha"}`}
          </button>
          <button onClick={onSkip} className="px-4 py-3 rounded-xl border border-[#2a9d8f]/30 text-[#9acfd3] hover:text-white transition-all text-sm">
            Ignorer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Harvest Recap ────────────────────────────────────────────────────────────
function HarvestRecap({ days, actions, config, onRestart, onReset }: {
  days: DayState[]; actions: ActionTaken[]; config: SimConfig; onRestart: () => void; onReset: () => void;
}) {
  const last = days[days.length - 1];
  const totalRain = days.reduce((s, d) => s + d.rainMm, 0);
  const totalIrrig = actions.filter(a => a.type === "irrigate").reduce((s, a) => s + a.value, 0);
  const stressDays = days.filter(d => d.waterStress > 0.5).length;
  const highRiskDays = days.filter(d => d.riskMildiou > 65).length;
  const fungActions = actions.filter(a => a.type === "fungicide").length;
  const conventionalFung = Math.round(config.crop.harvestDays / 25); // conventional = 1 treatment per 25 days
  const savedFung = Math.max(0, conventionalFung - fungActions);
  const baseYield = config.crop.id === "ble" ? 7.2 : config.crop.id === "mais" ? 10.5 : config.crop.id === "tournesol" ? 3.2 : config.crop.id === "colza" ? 3.8 : 5;
  const actualYield = (baseYield * last.yieldPotential / 100).toFixed(2);
  const conventionalYield = (baseYield * 0.88).toFixed(2); // conventional slightly lower (over-treatment stress)
  const gainEuros = Math.round(savedFung * 22 + (parseFloat(actualYield) - parseFloat(conventionalYield)) * 200);

  const scoreColor = last.yieldPotential > 75 ? "#22c55e" : last.yieldPotential > 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = last.yieldPotential > 75 ? "Excellente saison" : last.yieldPotential > 50 ? "Saison correcte" : "Saison difficile";

  return (
    <div className="min-h-screen bg-[#050f12] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">{config.crop.icon}</div>
          <h1 className="text-3xl font-bold text-white mb-1">Bilan de saison</h1>
          <p className="text-[#9acfd3]">{config.crop.name} — {config.region.name} — {config.soil.name}</p>
          <div className="mt-4 text-5xl font-bold" style={{ color: scoreColor }}>{Math.round(last.yieldPotential)}%</div>
          <div className="text-[#9acfd3] text-lg" style={{ color: scoreColor }}>{scoreLabel}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { l: "Rendement estimé", v: `${actualYield} t/ha`, sub: `Conventionnel référence : ${conventionalYield} t/ha`, c: scoreColor },
            { l: "Gain vs. conventionnel", v: `+${gainEuros} €/ha`, sub: `${savedFung} traitements évités + ${((parseFloat(actualYield) - parseFloat(conventionalYield)) * 200).toFixed(0)} €/ha rendement`, c: "#22c55e" },
            { l: "Eau totale reçue", v: `${Math.round(totalRain)} mm`, sub: `Irrigation : ${totalIrrig} mm — Pluie : ${Math.round(totalRain)} mm`, c: "#60a5fa" },
            { l: "Jours de stress hydrique", v: stressDays.toString(), sub: stressDays > 15 ? "Impact significatif sur rendement" : "Impact limité", c: stressDays > 15 ? "#f87171" : "#22c55e" },
            { l: "Traitements fongicides", v: fungActions.toString(), sub: `Conventionnel : ${conventionalFung} — Économie : ${savedFung} passages`, c: "#f472b6" },
            { l: "Jours à risque élevé (>65%)", v: highRiskDays.toString(), sub: highRiskDays > 0 ? `${highRiskDays} jours à risque non traités` : "Aucun risque non géré", c: highRiskDays > 5 ? "#f87171" : "#22c55e" },
          ].map(m => (
            <div key={m.l} className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
              <div className="text-[#9acfd3] text-xs mb-1">{m.l}</div>
              <div className="text-2xl font-bold mb-0.5" style={{ color: m.c }}>{m.v}</div>
              <div className="text-[#9acfd3] text-xs">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Actions log */}
        <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-5 mb-4">
          <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Toutes les interventions ({actions.length})</h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {actions.length === 0 ? (
              <p className="text-[#9acfd3] text-sm text-center py-2">Aucune intervention réalisée</p>
            ) : actions.map((a, i) => {
              const typeColors: Record<string, string> = { irrigate:"#60a5fa", fungicide:"#f472b6", fertilize_n:"#a78bfa", fertilize_npk:"#a78bfa", harvest:"#fbbf24" };
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-[#9acfd3]">Jour {a.day + 1} — {days[a.day]?.date}</span>
                  <span className="font-medium" style={{ color: typeColors[a.type] ?? "#fff" }}>{a.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AgroWorld value */}
        <div className="bg-[#2a9d8f]/10 border border-[#2a9d8f]/40 rounded-2xl p-5 mb-6 text-center">
          <p className="text-[#9acfd3] text-sm mb-1">Valeur générée par AgroWorld sur cette parcelle</p>
          <p className="text-3xl font-bold text-[#2a9d8f]">+{gainEuros} €/ha</p>
          <p className="text-[#9acfd3] text-xs mt-1">Traitement au bon moment, bonne dose, irrigation pilotée par les données sol</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onRestart} className="flex-1 py-4 bg-[#2a9d8f] hover:bg-[#1a6b5e] text-white font-bold rounded-2xl transition-all">
            Nouvelle simulation →
          </button>
          <button onClick={() => window.print()} className="px-6 py-4 border border-[#2a9d8f]/30 text-[#9acfd3] hover:text-white rounded-2xl transition-all text-sm">
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function TimelineBar({ total, current, events, onSeek, crop }: {
  total: number; current: number; events: WeatherEvent[]; onSeek: (d: number) => void; crop: Crop;
}) {
  const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  const pct = (d: number) => (d / Math.max(1, total - 1)) * 100;
  return (
    <div className="relative h-10 bg-[#0d2b33] rounded-xl overflow-hidden cursor-pointer select-none"
      onClick={e => { const r = e.currentTarget.getBoundingClientRect(); onSeek(Math.round(((e.clientX - r.left) / r.width) * (total - 1))); }}>
      {events.map(evt => {
        const colors: Record<string,string> = { drought:"#f59e0b", heavy_rain:"#60a5fa", frost:"#c4b5fd", heatwave:"#f87171", hail:"#94a3b8", disease_pressure:"#f472b6" };
        return <div key={evt.id} className="absolute top-0 h-full opacity-30 rounded" style={{ left:`${pct(evt.dayStart)}%`, width:`${pct(evt.duration)}%`, backgroundColor: colors[evt.type] }} title={evt.label} />;
      })}
      <div className="absolute top-0 h-full w-0.5 bg-yellow-400/50" style={{ left:`${pct(crop.harvestDays)}%` }} />
      {MONTHS.map((m, i) => (
        <div key={m} className="absolute top-0 h-full flex flex-col items-center pointer-events-none" style={{ left:`${(i / 12) * 100}%` }}>
          <div className="w-px h-2 bg-[#2a9d8f]/30" />
          <span className="text-[9px] text-[#9acfd3]/50 mt-0.5 hidden sm:block">{m}</span>
        </div>
      ))}
      <div className="absolute top-0 h-full bg-[#2a9d8f]/15 pointer-events-none transition-all" style={{ width:`${pct(current)}%` }} />
      <div className="absolute top-0 h-full w-0.5 bg-[#2a9d8f] pointer-events-none" style={{ left:`${pct(current)}%` }} />
    </div>
  );
}

// ─── Risk row ─────────────────────────────────────────────────────────────────
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
        <span className="text-xs font-bold w-20 text-right" style={{ color:c }}>{Math.round(value)}% {s}</span>
      </div>
    </div>
  );
}

// ─── Setup ────────────────────────────────────────────────────────────────────
function SetupPanel({ onStart }: { onStart: (cfg: SimConfig, events: WeatherEvent[]) => void }) {
  const [region, setRegion] = useState(REGIONS[0]);
  const [soil, setSoil] = useState(SOILS[0]);
  const [crop, setCrop] = useState(CROPS[0]);
  const [sowMonth, setSowMonth] = useState(CROPS[0].sowMonths[0]);
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [evtType, setEvtType] = useState<WeatherEvent["type"]>("drought");
  const [evtDay, setEvtDay] = useState(120);
  const [evtDur, setEvtDur] = useState(21);
  const MONTH_NAMES = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
  const EVT_LABELS: Record<string,string> = { drought:"Sécheresse", heavy_rain:"Pluies intenses", frost:"Gel tardif", heatwave:"Canicule", hail:"Grêle", disease_pressure:"Pression maladie" };

  return (
    <div className="min-h-screen bg-[#050f12] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AgroWorld <span className="text-[#2a9d8f]">Simulateur</span></h1>
          <p className="text-[#9acfd3]">Simulez une saison complète et recevez les conseils pas à pas</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Région</h3>
            <div className="space-y-1.5">
              {REGIONS.map(r => (
                <button key={r.id} onClick={() => setRegion(r)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-all ${region.id === r.id ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white" : "border-[#2a9d8f]/15 text-[#9acfd3] hover:border-[#2a9d8f]/30"}`}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Culture</h3>
            <div className="space-y-1.5 mb-4">
              {CROPS.map(c => (
                <button key={c.id} onClick={() => { setCrop(c); setSowMonth(c.sowMonths[0]); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all ${crop.id === c.id ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white" : "border-[#2a9d8f]/15 text-[#9acfd3] hover:border-[#2a9d8f]/30"}`}>
                  <span>{c.icon}</span>{c.name}
                </button>
              ))}
            </div>
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-2">Mois de semis</h3>
            <div className="flex flex-wrap gap-1.5">
              {crop.sowMonths.map(m => (
                <button key={m} onClick={() => setSowMonth(m)}
                  className={`px-2 py-1 rounded-full text-xs border transition-all ${sowMonth === m ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white" : "border-[#2a9d8f]/15 text-[#9acfd3]"}`}>
                  {MONTH_NAMES[m-1]}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Type de sol</h3>
            <div className="space-y-1.5 mb-4">
              {SOILS.map(s => (
                <button key={s.id} onClick={() => setSoil(s)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-all ${soil.id === s.id ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white" : "border-[#2a9d8f]/15 text-[#9acfd3] hover:border-[#2a9d8f]/30"}`}>
                  {s.name}
                </button>
              ))}
            </div>
            <h3 className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-2">Ajouter un événement</h3>
            <select value={evtType} onChange={e => setEvtType(e.target.value as WeatherEvent["type"])}
              className="w-full bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-xl px-2 py-1.5 mb-2">
              {Object.entries(EVT_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div><label className="text-[9px] text-[#9acfd3]">Jour</label>
                <input type="number" value={evtDay} onChange={e => setEvtDay(Number(e.target.value))} min={1} max={300}
                  className="w-full bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-lg px-2 py-1 mt-0.5" /></div>
              <div><label className="text-[9px] text-[#9acfd3]">Durée</label>
                <input type="number" value={evtDur} onChange={e => setEvtDur(Number(e.target.value))} min={1} max={90}
                  className="w-full bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-lg px-2 py-1 mt-0.5" /></div>
            </div>
            <button onClick={() => setEvents(ev => [...ev, { id: Math.random().toString(36).slice(2), dayStart:evtDay, duration:evtDur, type:evtType, intensity:0.8, label:`${EVT_LABELS[evtType]} J${evtDay}→J${evtDay+evtDur}` }])}
              className="w-full text-xs py-1.5 rounded-xl bg-[#2a9d8f]/15 border border-[#2a9d8f]/30 text-[#2a9d8f] hover:bg-[#2a9d8f]/25 transition-all mb-2">
              + Ajouter
            </button>
            {events.map(e => (
              <div key={e.id} className="flex items-center justify-between text-[10px] text-amber-400 py-0.5">
                <span>{e.label}</span>
                <button onClick={() => setEvents(ev => ev.filter(x => x.id !== e.id))} className="text-[#9acfd3] hover:text-white ml-1">✕</button>
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function SimDashboard({ config, events, onReset }: { config: SimConfig; events: WeatherEvent[]; onReset: () => void }) {
  const [days, setDays] = useState<DayState[]>([]);
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [chartKey, setChartKey] = useState<keyof DayState>("tempMean");
  const [activeRec, setActiveRec] = useState<Recommendation | null>(null);
  const [customDose, setCustomDose] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [harvested, setHarvested] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const newDays = runSimulation(config, events, actions);
    setDays(newDays);
    setCurrent(c => Math.min(c, Math.max(0, newDays.length - 1)));
  }, [config, events, actions]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrent(c => {
          if (c >= (days.length - 1)) { setPlaying(false); return c; }
          return Math.min(c + speed, days.length - 1);
        });
      }, 400);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, days.length]);

  // Auto-pause on urgent alert
  useEffect(() => {
    if (!days[current]) return;
    const recs = getRecommendations(days[current], config.crop, config.soil);
    const urgent = recs.find(r => r.urgency === "high" && !dismissed.has(`${r.type}-${current}`));
    if (urgent && playing) { setPlaying(false); setActiveRec(urgent); setCustomDose(urgent.dose); }
  }, [current, days, config, playing, dismissed]);

  const doAction = (type: ActionTaken["type"], dose: number) => {
    const labels: Record<string, string> = { irrigate:`Irrigation ${dose}mm`, fungicide:`Fongicide ${dose}L/ha`, fertilize_n:`Apport N ${dose} UN`, fertilize_npk:`Apport NPK`, harvest:"Récolte" };
    setActions(prev => [...prev.filter(a => !(a.day === current && a.type === type)), { day: current, type, value: dose, label: labels[type] }]);
    if (type === "harvest") setHarvested(true);
    setActiveRec(null);
  };

  if (harvested && days.length > 0) {
    return <HarvestRecap days={days} actions={actions} config={config} onReset={() => { setHarvested(false); setActions([]); setCurrent(0); onReset(); }} onRestart={() => { setHarvested(false); setActions([]); setCurrent(0); onReset(); }} />;
  }

  const d = days[current];
  if (!d) return <div className="min-h-screen bg-[#050f12] flex items-center justify-center text-[#2a9d8f] animate-pulse">Calcul en cours...</div>;

  const recs = getRecommendations(d, config.crop, config.soil);
  const CHARTS = [
    { key:"tempMean" as const, label:"Température", color:"#f87171", unit:"°C" },
    { key:"humiditySol" as const, label:"Humidité sol", color:"#2a9d8f", unit:"%" },
    { key:"ndvi" as const, label:"NDVI", color:"#22c55e", unit:"" },
    { key:"riskMildiou" as const, label:"Risque maladie", color:"#f472b6", unit:"%" },
    { key:"n" as const, label:"Azote N", color:"#60a5fa", unit:"mg/kg" },
    { key:"yieldPotential" as const, label:"Potentiel", color:"#fbbf24", unit:"%" },
  ];
  const sel = CHARTS.find(c => c.key === chartKey) ?? CHARTS[0];

  return (
    <div className="min-h-screen bg-[#050f12] text-white flex flex-col">
      {activeRec && (
        <GuidedPanel rec={activeRec} customDose={customDose} setCustomDose={setCustomDose}
          onApply={dose => doAction(activeRec.type, dose)}
          onSkip={() => { setDismissed(s => new Set([...s, `${activeRec.type}-${current}`])); setActiveRec(null); }} />
      )}

      {/* Header */}
      <div className="border-b border-[#2a9d8f]/20 bg-[#0d2b33]/80 backdrop-blur px-4 py-3 flex items-center gap-3 flex-wrap sticky top-0 z-20">
        <button onClick={onReset} className="text-[#9acfd3] hover:text-white text-xs">← Reconfigurer</button>
        <span className="text-[#2a9d8f] font-bold">{config.crop.icon} {config.crop.name}</span>
        <span className="text-[#9acfd3] text-xs">· {config.region.name} · {config.soil.name}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-white font-semibold text-sm">J{current+1} — {d.date}</span>
          <span className="text-[#9acfd3] text-xs hidden sm:block">{Math.round(d.growthStage)}% croissance</span>
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
            className="bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-lg px-2 py-1">
            <option value={1}>1j/tick</option><option value={3}>3j/tick</option>
            <option value={7}>7j/tick</option><option value={14}>14j/tick</option>
          </select>
          <button onClick={() => setPlaying(p => !p)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${playing ? "bg-red-900/30 border-red-500/50 text-red-400" : "bg-[#2a9d8f]/20 border-[#2a9d8f] text-[#2a9d8f]"}`}>
            {playing ? "⏸" : "▶"}
          </button>
          <button onClick={() => { setPlaying(false); setCurrent(0); setActions([]); setDismissed(new Set()); }} className="text-[#9acfd3] hover:text-white text-xs">⏮</button>
        </div>
      </div>

      <div className="px-4 pt-2 pb-1">
        <TimelineBar total={days.length} current={current} events={events} onSeek={d => { setPlaying(false); setCurrent(d); }} crop={config.crop} />
      </div>

      {/* Alerts */}
      {d.alerts.length > 0 && (
        <div className="mx-4 mb-1 flex gap-2 flex-wrap">
          {d.alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-xl px-3 py-1.5 text-xs text-red-300">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shrink-0" />{a}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 grid lg:grid-cols-3 gap-3 px-4 pb-4">
        {/* Left */}
        <div className="space-y-3">
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-2">Météo & Air</div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[{l:"T° min",v:`${d.tempMin}°`},{l:"T° moy",v:`${d.tempMean}°`},{l:"T° max",v:`${d.tempMax}°`}].map(m=>(
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                  <div className="text-white font-bold text-sm">{m.v}</div><div className="text-[#9acfd3] text-xs">{m.l}</div>
                </div>
              ))}
            </div>
            <Spark vals={days.slice(Math.max(0,current-40),current+1).map(dd=>dd.humidityAir)} color="#60a5fa" h={36} />
            <div className="flex justify-between text-xs text-[#9acfd3] mt-1">
              <span>Humidité air</span><span className="text-white">{d.humidityAir}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[{l:"Pluie",v:`${d.rainMm}mm`},{l:"Vent",v:`${d.windSpeed}m/s`},{l:"Lux",v:`${d.lux}`}].map(m=>(
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                  <div className="text-white font-bold text-xs">{m.v}</div><div className="text-[#9acfd3] text-[10px]">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-2">Sol — Sonde NPK</div>
            <Spark vals={days.slice(Math.max(0,current-40),current+1).map(dd=>dd.humiditySol)} color="#2a9d8f" h={36} />
            <div className="flex justify-between text-xs text-[#9acfd3] mb-2">
              <span>Humidité sol</span><span className="text-white">{d.humiditySol}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[{l:"N",v:d.n,c:"#60a5fa"},{l:"P",v:d.p,c:"#f472b6"},{l:"K",v:d.k,c:"#a78bfa"}].map(m=>(
                <div key={m.l} className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                  <div className="font-bold text-xs" style={{color:m.c}}>{m.v}</div>
                  <div className="text-[#9acfd3] text-[10px]">{m.l} mg/kg</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                <div className="text-white font-bold text-sm">{d.ph}</div><div className="text-[#9acfd3] text-xs">pH</div>
              </div>
              <div className="bg-[#050f12]/40 rounded-xl p-2 text-center">
                <div className={`font-bold text-sm ${d.waterStress > 0.5 ? "text-red-400" : "text-green-400"}`}>{Math.round(d.waterStress*100)}%</div>
                <div className="text-[#9acfd3] text-xs">Stress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="space-y-3">
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[#2a9d8f] text-xs uppercase tracking-widest">Évolution saison</div>
              <select value={chartKey as string} onChange={e => setChartKey(e.target.value as keyof DayState)}
                className="bg-[#050f12] border border-[#2a9d8f]/30 text-white text-xs rounded-lg px-2 py-1">
                {CHARTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <div className="relative">
              <Spark vals={days.slice(0,current+1).map(dd=>Number(dd[chartKey])||0)} color={sel.color} h={110} />
              <div className="absolute right-2 bottom-2 text-xl font-bold" style={{color:sel.color}}>
                {Number(d[chartKey]).toFixed(sel.unit===""?3:1)} <span className="text-sm font-normal">{sel.unit}</span>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap mt-2">
              {CHARTS.map(o => (
                <button key={o.key} onClick={() => setChartKey(o.key)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${chartKey===o.key?"text-white":"text-[#9acfd3] border-[#2a9d8f]/20"}`}
                  style={{borderColor:chartKey===o.key?o.color:undefined,backgroundColor:chartKey===o.key?`${o.color}20`:undefined}}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#2a9d8f] text-xs uppercase tracking-widest">NDVI — Caméra NIR</span>
              <span className="text-xs font-bold" style={{color:d.ndvi>0.6?"#22c55e":d.ndvi>0.35?"#f59e0b":"#ef4444"}}>
                {d.ndvi.toFixed(3)} — {d.ndvi>0.6?"Bonne santé":d.ndvi>0.35?"Modéré":"Stress"}
              </span>
            </div>
            <div className="grid rounded-lg overflow-hidden" style={{gridTemplateColumns:"repeat(20,1fr)",gap:"1px",backgroundColor:"#050f12"}}>
              {Array.from({length:120},(_,i)=>{
                const row=Math.floor(i/20),col=i%20;
                const base=0.3+0.5*Math.sin(row*0.9+d.day*0.02)*Math.cos(col*0.7);
                const v=Math.min(1,Math.max(0,d.ndvi*base));
                const g=Math.round(60+v*140),r=Math.round(10+(1-v)*50);
                return <div key={i} className="aspect-square" style={{backgroundColor:`rgb(${r},${g},30)`}}/>;
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3">
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-3">Culture {config.crop.icon}</div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(d.growthStage)}%</div>
                <div className="text-[#9acfd3] text-xs">Stade</div>
                <div className="h-1.5 bg-[#0d2b33] rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#2a9d8f] rounded-full" style={{width:`${d.growthStage}%`}}/>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${d.yieldPotential>70?"text-green-400":d.yieldPotential>40?"text-amber-400":"text-red-400"}`}>{Math.round(d.yieldPotential)}%</div>
                <div className="text-[#9acfd3] text-xs">Potentiel récolte</div>
                <div className="h-1.5 bg-[#0d2b33] rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${d.yieldPotential>70?"bg-green-400":d.yieldPotential>40?"bg-amber-400":"bg-red-500"}`} style={{width:`${d.yieldPotential}%`}}/>
                </div>
              </div>
            </div>
            {d.weatherEvent && <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-300 text-xs">{d.weatherEvent}</div>}
          </div>

          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-2">World Model — Risques 48h</div>
            <Risk label={config.crop.diseases[0]||"Mildiou"} value={d.riskMildiou}/>
            <Risk label={config.crop.diseases[1]||"Rouille"} value={d.riskRouille}/>
            <Risk label={config.crop.diseases[2]||"Botrytis"} value={d.riskBotrytis}/>
          </div>

          {/* Recommandations détaillées */}
          <div className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-4">
            <div className="text-[#2a9d8f] text-xs uppercase tracking-widest mb-2">Recommandations AgroWorld</div>
            {recs.length === 0 ? (
              <p className="text-green-400 text-xs text-center py-2">Aucune action requise</p>
            ) : recs.map((rec, i) => {
              const isDismissed = dismissed.has(`${rec.type}-${current}`);
              const urgColor = rec.urgency==="high"?"#ef4444":rec.urgency==="medium"?"#f59e0b":"#22c55e";
              return !isDismissed ? (
                <div key={i} className="border rounded-xl p-3 mb-2 cursor-pointer hover:opacity-90 transition-all"
                  style={{borderColor:`${urgColor}40`,backgroundColor:`${urgColor}08`}}
                  onClick={() => { setActiveRec(rec); setCustomDose(rec.dose); setPlaying(false); }}>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-xs font-semibold">{rec.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{color:urgColor,backgroundColor:`${urgColor}20`}}>
                      {rec.urgency==="high"?"URGENT":rec.urgency==="medium"?"VOIR":"INFO"}
                    </span>
                  </div>
                  <p className="text-[#9acfd3] text-[11px] mt-1 line-clamp-2">{rec.why}</p>
                  <div className="text-[#2a9d8f] text-[11px] mt-1 font-medium">→ Cliquer pour le détail et la dose</div>
                </div>
              ) : null;
            })}
            {/* Action log */}
            {actions.length > 0 && (
              <div className="border-t border-[#2a9d8f]/15 mt-2 pt-2 space-y-1 max-h-20 overflow-y-auto">
                {actions.slice(-4).map((a,i)=>(
                  <div key={i} className="text-[10px] text-[#9acfd3] flex justify-between">
                    <span>J{a.day+1}</span><span>{a.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const [config, setConfig] = useState<SimConfig | null>(null);
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  if (!config) return <SetupPanel onStart={(cfg,evts)=>{setConfig(cfg);setEvents(evts);}} />;
  return <SimDashboard config={config} events={events} onReset={() => setConfig(null)} />;
}
