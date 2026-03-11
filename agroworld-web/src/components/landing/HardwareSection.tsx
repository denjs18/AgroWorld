"use client";
import { motion } from "framer-motion";

const sensors = [
  {icon:"&#127807;",name:"Sonde NPK RS485",desc:"Azote, Phosphore, Potassium + pH + EC",depth:"5 cm"},
  {icon:"&#128167;",name:"Humidite sol",desc:"3 profondeurs : 5 / 20 / 40 cm",depth:"40 cm"},
  {icon:"&#127777;",name:"BME280",desc:"Temperature + Humidite + Pression",depth:"Air"},
  {icon:"&#127783;",name:"Anemometre",desc:"Vitesse et direction du vent",depth:"2m"},
  {icon:"&#127783;",name:"Pluviometre",desc:"0.28mm par impulsion",depth:"Sol"},
  {icon:"&#9728;",name:"Capteur PAR",desc:"Lumiere photosynthetiquement active BH1750",depth:"Air"},
  {icon:"&#128247;",name:"Camera RGB + NIR",desc:"ESP32-CAM + filtre 850nm pour NDVI",depth:"Vue"},
];

export function HardwareSection() {
  return (
    <section className="py-24 px-6 bg-[#0d2b33]" id="hardware">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">Le materiel</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Un boitier <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">tout-en-un</span></h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">IP67, autonome solaire, communication LoRa 2-10km. Prix cible : <strong className="text-white">150-250 EUR</strong>.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
            className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(42,157,143,0.1)]">
            <div className="bg-[#050f12]/60 rounded-xl p-6 mb-6 font-mono text-sm">
              <div className="text-[#2a9d8f] mb-3 font-bold">// ESP32-S3 AgroWorld v0.1</div>
              {["MCU       ESP32-S3  240MHz 8MB PSRAM","Comm      SX1276   LoRa 868MHz TTN","Power     5W Solar + LiPo 3000mAh","Sleep     Deep sleep 15min cycle","Envoi     20 bytes / 15 min","IP Rating IP67"].map(l=>(
                <div key={l} className="text-[#9acfd3] leading-7">{l}</div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              {[["&#9889;","Autonomie","7 jours"],["&#128225;","Portee","2-10 km"],["&#127777;","Capteurs","7 types"],["&#128176;","Prix cible","~200 EUR"]].map(([e,l,v])=>(
                <div key={l} className="bg-[#050f12]/40 rounded-xl p-3">
                  <div className="text-2xl" dangerouslySetInnerHTML={{__html:e}} />
                  <div className="text-[#2a9d8f] text-xs uppercase">{l}</div>
                  <div className="text-white font-bold">{v}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="space-y-3">
            {sensors.map((s,i)=>(
              <motion.div key={s.name} initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.06}}
                className="flex items-center gap-4 bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-xl px-5 py-4 hover:border-[#2a9d8f]/40 transition-all">
                <span className="text-2xl" dangerouslySetInnerHTML={{__html:s.icon}} />
                <div className="flex-1">
                  <div className="text-white font-semibold">{s.name}</div>
                  <div className="text-[#9acfd3] text-sm">{s.desc}</div>
                </div>
                <span className="text-[#2a9d8f] text-xs bg-[#050f12]/50 px-2 py-1 rounded-full">{s.depth}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
