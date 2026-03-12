// Simulation engine - AgroWorld World Simulator
// src/lib/sim-engine.ts

export type Region = {
  id: string; name: string; meanTemp: number; amplitude: number;
  annualRainMm: number; rainPeakMonth: number; droughtRisk: number;
};
export type SoilType = {
  id: string; name: string; fieldCapacity: number; wiltingPoint: number;
  drainageRate: number; nBase: number; pBase: number; kBase: number; phBase: number;
};
export type Crop = {
  id: string; name: string; icon: string;
  sowMonths: number[]; harvestDays: number;
  nUptakeTotal: number; pUptakeTotal: number; kUptakeTotal: number;
  waterNeedPeak: number; ndviMax: number;
  diseases: string[]; optTempMin: number; optTempMax: number;
  kcCurve: number[]; // 10 stages 0->9
};
export type WeatherEvent = {
  id: string; dayStart: number; duration: number;
  type: "drought" | "heavy_rain" | "frost" | "heatwave" | "hail" | "disease_pressure";
  intensity: number; // 0-1
  label: string;
};
export type ActionTaken = {
  day: number; type: "irrigate" | "fungicide" | "fertilize_n" | "fertilize_npk" | "harvest";
  value: number; label: string;
};
export type DayState = {
  day: number; date: string;
  tempMin: number; tempMax: number; tempMean: number;
  humidityAir: number; rainMm: number; irrigMm: number; lux: number; windSpeed: number;
  humiditySol: number; n: number; p: number; k: number; ph: number;
  ndvi: number; growthStage: number; yieldPotential: number;
  riskMildiou: number; riskRouille: number; riskBotrytis: number;
  waterStress: number; alerts: string[]; actions: string[];
  weatherEvent?: string;
};
export type SimConfig = {
  region: Region; soil: SoilType; crop: Crop;
  sowDay: number; startYear: number; seed: number;
};

export const REGIONS: Region[] = [
  { id:"idf", name:"Île-de-France", meanTemp:11.5, amplitude:8, annualRainMm:640, rainPeakMonth:5, droughtRisk:0.3 },
  { id:"bretagne", name:"Bretagne", meanTemp:12, amplitude:5.5, annualRainMm:860, rainPeakMonth:11, droughtRisk:0.1 },
  { id:"occitanie", name:"Occitanie / Toulouse", meanTemp:14, amplitude:9.5, annualRainMm:560, rainPeakMonth:4, droughtRisk:0.6 },
  { id:"alsace", name:"Alsace", meanTemp:10.5, amplitude:11, annualRainMm:590, rainPeakMonth:6, droughtRisk:0.35 },
  { id:"paca", name:"PACA / Provence", meanTemp:15.5, amplitude:10, annualRainMm:620, rainPeakMonth:10, droughtRisk:0.75 },
  { id:"naquitaine", name:"Nouvelle-Aquitaine", meanTemp:13, amplitude:8.5, annualRainMm:730, rainPeakMonth:11, droughtRisk:0.45 },
  { id:"grandest", name:"Grand Est / Champagne", meanTemp:10, amplitude:11.5, annualRainMm:620, rainPeakMonth:6, droughtRisk:0.4 },
  { id:"normandie", name:"Normandie", meanTemp:11, amplitude:6, annualRainMm:790, rainPeakMonth:11, droughtRisk:0.15 },
];

export const SOILS: SoilType[] = [
  { id:"limoneux", name:"Limoneux (Beauce, Picardie)", fieldCapacity:38, wiltingPoint:15, drainageRate:0.08, nBase:130, pBase:55, kBase:190, phBase:7.1 },
  { id:"argileux", name:"Argileux lourd", fieldCapacity:42, wiltingPoint:22, drainageRate:0.04, nBase:150, pBase:45, kBase:225, phBase:7.3 },
  { id:"sableux", name:"Sableux (drainant)", fieldCapacity:22, wiltingPoint:7, drainageRate:0.18, nBase:80, pBase:35, kBase:130, phBase:6.4 },
  { id:"argilo_limoneux", name:"Argilo-limoneux (polyculture)", fieldCapacity:36, wiltingPoint:18, drainageRate:0.07, nBase:120, pBase:50, kBase:175, phBase:7.0 },
  { id:"calcaire", name:"Sol calcaire (Champagne)", fieldCapacity:28, wiltingPoint:12, drainageRate:0.12, nBase:100, pBase:40, kBase:160, phBase:7.8 },
  { id:"viticole", name:"Sol viticole argileux", fieldCapacity:32, wiltingPoint:16, drainageRate:0.06, nBase:90, pBase:60, kBase:210, phBase:7.5 },
];

export const CROPS: Crop[] = [
  {
    id:"ble", name:"Blé tendre", icon:"🌾",
    sowMonths:[10,11], harvestDays:270,
    nUptakeTotal:160, pUptakeTotal:35, kUptakeTotal:130,
    waterNeedPeak:4.5, ndviMax:0.85,
    diseases:["Mildiou","Rouille jaune","Septoriose"],
    optTempMin:5, optTempMax:22,
    kcCurve:[0.3,0.4,0.6,0.8,1.0,1.15,1.15,0.9,0.6,0.3],
  },
  {
    id:"mais", name:"Maïs irrigué", icon:"🌽",
    sowMonths:[4,5], harvestDays:155,
    nUptakeTotal:200, pUptakeTotal:50, kUptakeTotal:220,
    waterNeedPeak:7.0, ndviMax:0.90,
    diseases:["Fusariose","Helminthosporiose"],
    optTempMin:12, optTempMax:32,
    kcCurve:[0.3,0.4,0.55,0.75,0.95,1.15,1.2,1.1,0.8,0.5],
  },
  {
    id:"tournesol", name:"Tournesol", icon:"🌻",
    sowMonths:[4,5], harvestDays:145,
    nUptakeTotal:120, pUptakeTotal:40, kUptakeTotal:180,
    waterNeedPeak:5.0, ndviMax:0.80,
    diseases:["Sclerotinia","Mildiou"],
    optTempMin:10, optTempMax:30,
    kcCurve:[0.3,0.4,0.6,0.85,1.05,1.15,1.1,0.95,0.7,0.4],
  },
  {
    id:"colza", name:"Colza", icon:"🌼",
    sowMonths:[8,9], harvestDays:270,
    nUptakeTotal:180, pUptakeTotal:40, kUptakeTotal:150,
    waterNeedPeak:4.8, ndviMax:0.82,
    diseases:["Sclerotinia","Phoma"],
    optTempMin:3, optTempMax:20,
    kcCurve:[0.3,0.4,0.65,0.9,1.1,1.2,1.1,0.85,0.55,0.3],
  },
  {
    id:"vigne", name:"Vigne", icon:"🍇",
    sowMonths:[3], harvestDays:210,
    nUptakeTotal:60, pUptakeTotal:20, kUptakeTotal:90,
    waterNeedPeak:3.5, ndviMax:0.75,
    diseases:["Mildiou","Oidium","Botrytis"],
    optTempMin:10, optTempMax:28,
    kcCurve:[0.0,0.1,0.3,0.55,0.75,0.85,0.85,0.8,0.65,0.3],
  },
];

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

export function runSimulation(
  config: SimConfig,
  events: WeatherEvent[],
  actions: ActionTaken[],
  fromDay = 0
): DayState[] {
  const { region, soil, crop, sowDay, startYear, seed } = config;
  const rand = seededRand(seed + fromDay);
  const days: DayState[] = [];

  // Initial state
  let humiditySol = soil.fieldCapacity * 0.75;
  let n = soil.nBase;
  let p = soil.pBase;
  let k = soil.kBase;
  let ph = soil.phBase;
  let riskMildiou = 5;
  let riskRouille = 3;
  let riskBotrytis = 2;
  let yieldPotential = 100;

  for (let day = 0; day < 365; day++) {
    const doy = ((sowDay + day - 1) % 365) + 1;
    const date = new Date(startYear, 0, sowDay + day);
    const dateStr = date.toLocaleDateString("fr-FR", { day:"2-digit", month:"short" });

    // -- Growth stage 0-100% over harvestDays
    const growthStage = clamp((day / crop.harvestDays) * 100, 0, 100);
    const stageIdx = Math.min(9, Math.floor((growthStage / 100) * 10));
    const kc = crop.kcCurve[stageIdx];

    // -- Weather base (regional seasonal model)
    const seasonAngle = (2 * Math.PI * (doy - 80)) / 365;
    const baseTemp = region.meanTemp + region.amplitude * Math.sin(seasonAngle);
    const tempNoise = (rand() - 0.5) * 4;
    const tempMean = baseTemp + tempNoise;
    const diurnal = 6 + 3 * Math.abs(Math.sin(seasonAngle));
    const tempMin = tempMean - diurnal / 2;
    const tempMax = tempMean + diurnal / 2;

    // Rain: seasonal + random
    const rainAngle = (2 * Math.PI * (doy - region.rainPeakMonth * 30)) / 365;
    const rainBase = (region.annualRainMm / 365) * (1 + 0.6 * Math.sin(rainAngle));
    const rainProb = clamp(rainBase / 8, 0.15, 0.65);
    let rainMm = rand() < rainProb ? rainBase * 2.5 * rand() : 0;

    // Humidity air
    const humidityAir = clamp(65 + (rainMm > 0 ? 20 : 0) + (rand() - 0.5) * 15, 30, 98);

    // Lux (radiation)
    const luxBase = 300 + 400 * Math.max(0, Math.sin(seasonAngle));
    const lux = clamp(luxBase * (rainMm > 2 ? 0.4 : 0.85 + rand() * 0.15), 10, 1000);

    // Wind
    const windSpeed = clamp(2 + rand() * 5, 0, 15);

    // -- Apply weather events
    let evtLabel: string | undefined;
    const activeEvts = events.filter(e => day >= e.dayStart && day < e.dayStart + e.duration);
    for (const evt of activeEvts) {
      evtLabel = evt.label;
      if (evt.type === "drought") { rainMm = 0; }
      if (evt.type === "heavy_rain") { rainMm += evt.intensity * 25 * rand(); }
      if (evt.type === "frost") { /* tempMin handled above */ }
      if (evt.type === "heatwave") { /* tempMax already boosted */ }
      if (evt.type === "disease_pressure") { riskMildiou = Math.min(100, riskMildiou + evt.intensity * 15); }
    }

    // -- Apply actions for this day
    let irrigMm = 0;
    const dayActions = actions.filter(a => a.day === day);
    const actionLabels: string[] = [];
    for (const act of dayActions) {
      if (act.type === "irrigate") { irrigMm = act.value; actionLabels.push(`Irrigation +${act.value}mm`); }
      if (act.type === "fungicide") { riskMildiou = Math.max(0, riskMildiou - 40 * act.value); riskRouille = Math.max(0, riskRouille - 35 * act.value); actionLabels.push(`Fongicide dose ${act.value}`); }
      if (act.type === "fertilize_n") { n = Math.min(300, n + act.value); actionLabels.push(`Apport N +${act.value} UN`); }
      if (act.type === "fertilize_npk") { n = Math.min(300, n + act.value * 1); p = Math.min(150, p + act.value * 0.4); k = Math.min(400, k + act.value * 0.8); actionLabels.push(`Apport NPK`); }
    }

    // -- Soil water balance (simplified FAO-56)
    const et0 = clamp(0.0023 * (tempMean + 17.8) * Math.sqrt(tempMax - tempMin) * (lux / 100), 0, 10);
    const etc = et0 * kc;
    const drainage = humiditySol > soil.fieldCapacity ? (humiditySol - soil.fieldCapacity) * soil.drainageRate * 10 : 0;
    humiditySol = clamp(humiditySol + (rainMm + irrigMm - etc - drainage) * 0.3, soil.wiltingPoint, soil.fieldCapacity * 1.1);

    // Water stress
    const waterStress = humiditySol < soil.wiltingPoint * 1.5
      ? clamp(1 - (humiditySol - soil.wiltingPoint) / (soil.wiltingPoint * 0.5), 0, 1)
      : 0;

    // -- Nutrient uptake
    const uptakeRate = (growthStage > 5 && growthStage < 90) ? 0.005 : 0.001;
    n = clamp(n - crop.nUptakeTotal * uptakeRate * (1 - waterStress * 0.5), 0, 300);
    p = clamp(p - crop.pUptakeTotal * uptakeRate, 0, 150);
    k = clamp(k - crop.kUptakeTotal * uptakeRate, 0, 400);

    // -- NDVI (logistic growth, reduced by stress)
    const ndviRaw = crop.ndviMax / (1 + Math.exp(-0.08 * (growthStage - 35)));
    const ndvi = clamp(ndviRaw * (1 - waterStress * 0.4) * (n < 30 ? 0.7 : 1), 0.05, crop.ndviMax);

    // -- Disease dynamics
    const mildiouFav = (tempMean >= 12 && tempMean <= 22 && humidityAir > 78) ? 4 : -1.5;
    const rouilleFav = (tempMean >= 8 && tempMean <= 18 && humidityAir > 72) ? 3 : -1;
    const botrytisFav = (humidityAir > 85 && rainMm > 0) ? 3.5 : -1;
    riskMildiou = clamp(riskMildiou + mildiouFav + (rand() - 0.5) * 3, 0, 100);
    riskRouille = clamp(riskRouille + rouilleFav + (rand() - 0.5) * 2, 0, 100);
    riskBotrytis = clamp(riskBotrytis + botrytisFav + (rand() - 0.5) * 2, 0, 100);

    // -- Yield potential (stress accumulated)
    if (waterStress > 0.5) yieldPotential = Math.max(0, yieldPotential - waterStress * 2);
    if (tempMean < crop.optTempMin - 5) yieldPotential = Math.max(0, yieldPotential - 1.5);
    if (tempMean > crop.optTempMax + 5) yieldPotential = Math.max(0, yieldPotential - 2);
    if (riskMildiou > 70 && !dayActions.some(a => a.type === "fungicide")) yieldPotential = Math.max(0, yieldPotential - 1);

    // -- AgroWorld alerts
    const alerts: string[] = [];
    if (riskMildiou > 65) alerts.push(`Risque ${crop.diseases[0]} ${Math.round(riskMildiou)}% : traitement recommande`);
    if (riskRouille > 55) alerts.push(`Risque ${crop.diseases[1] || "rouille"} ${Math.round(riskRouille)}% : surveiller`);
    if (waterStress > 0.6) alerts.push(`Stress hydrique : humidite sol ${Math.round(humiditySol)}% — irriguer`);
    if (n < 25) alerts.push(`Carence azote detectee : N=${Math.round(n)} mg/kg`);
    if (growthStage >= 98) alerts.push(`Parcelle prete a la recolte — potentiel ${Math.round(yieldPotential)}%`);

    days.push({
      day, date: dateStr,
      tempMin: parseFloat(tempMin.toFixed(1)), tempMax: parseFloat(tempMax.toFixed(1)), tempMean: parseFloat(tempMean.toFixed(1)),
      humidityAir: parseFloat(humidityAir.toFixed(1)), rainMm: parseFloat(rainMm.toFixed(1)),
      irrigMm: parseFloat(irrigMm.toFixed(1)), lux: Math.round(lux), windSpeed: parseFloat(windSpeed.toFixed(1)),
      humiditySol: parseFloat(humiditySol.toFixed(1)), n: Math.round(n), p: Math.round(p), k: Math.round(k),
      ph: parseFloat(ph.toFixed(2)),
      ndvi: parseFloat(ndvi.toFixed(3)), growthStage: parseFloat(growthStage.toFixed(1)),
      yieldPotential: parseFloat(yieldPotential.toFixed(1)),
      riskMildiou: parseFloat(riskMildiou.toFixed(0)), riskRouille: parseFloat(riskRouille.toFixed(0)),
      riskBotrytis: parseFloat(riskBotrytis.toFixed(0)),
      waterStress: parseFloat(waterStress.toFixed(2)),
      alerts, actions: actionLabels,
      weatherEvent: evtLabel,
    });

    if (actions.some(a => a.type === "harvest" && a.day <= day)) break;
  }

  return days;
}
