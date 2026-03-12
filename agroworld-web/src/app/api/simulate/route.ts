import { NextRequest, NextResponse } from "next/server";

function noise(base: number, amplitude: number, t: number, freq = 1) {
  return base + amplitude * Math.sin(t * freq) + (Math.random() - 0.5) * amplitude * 0.3;
}

export async function GET(req: NextRequest) {
  const t = Date.now() / 10000;
  const hour = new Date().getHours();
  const dayFactor = Math.sin(((hour - 6) / 24) * 2 * Math.PI);

  const data = {
    timestamp: new Date().toISOString(),
    // Capteurs air I2C (BME280)
    temp_air: parseFloat(noise(18 + dayFactor * 8, 1.5, t, 0.7).toFixed(1)),
    humidity_air: parseFloat(noise(65 - dayFactor * 15, 4, t, 0.5).toFixed(1)),
    pressure: parseFloat(noise(1013, 3, t, 0.1).toFixed(1)),
    // Luminosite (BH1750)
    lux: parseFloat(Math.max(0, noise(400 + dayFactor * 350, 50, t, 1.2)).toFixed(0)),
    // Sonde NPK RS485
    temp_sol: parseFloat(noise(14 + dayFactor * 3, 0.5, t, 0.3).toFixed(1)),
    humidity_sol: parseFloat(noise(42, 6, t, 0.2).toFixed(1)),
    ph: parseFloat(noise(6.8, 0.2, t, 0.1).toFixed(2)),
    n: parseFloat(noise(120, 15, t, 0.4).toFixed(0)),
    p: parseFloat(noise(45, 8, t, 0.3).toFixed(0)),
    k: parseFloat(noise(180, 20, t, 0.35).toFixed(0)),
    // Meteo
    wind_speed: parseFloat(Math.max(0, noise(3.2, 2, t, 1.5)).toFixed(1)),
    wind_dir: Math.round(noise(210, 30, t, 0.8)) % 360,
    rain_mm: parseFloat(Math.max(0, noise(0.1, 0.2, t, 2)).toFixed(2)),
    // NDVI simule (camera NIR)
    ndvi: parseFloat(noise(0.62, 0.08, t, 0.15).toFixed(3)),
    // LoRa
    rssi: Math.round(noise(-85, 8, t, 0.9)),
    snr: parseFloat(noise(7.2, 1.5, t, 0.8).toFixed(1)),
    lora_ok: true,
    // Risque maladie (World Model simule)
    risk_mildiou: parseFloat(Math.min(100, Math.max(0, noise(38, 20, t, 0.5))).toFixed(0)),
    risk_rouille: parseFloat(Math.min(100, Math.max(0, noise(22, 15, t, 0.4))).toFixed(0)),
    // Batterie
    battery_pct: parseFloat(noise(78, 3, t, 0.05).toFixed(0)),
  };

  return NextResponse.json(data);
}
