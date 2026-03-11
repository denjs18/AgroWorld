"use client";
import { motion } from "framer-motion";

const steps = [
  {
    phase:"Phase 1",
    label:"MVP & Validation terrain",
    status:"current",
    items:[
      "Prototype boitier ESP32-S3 (5 unites, parcelles pilotes)",
      "World Model bootstrap sur donnees synthetiques et open data meteo",
      "Application mobile iOS / Android : dashboard, alertes, carnet cultural",
      "3 a 5 agriculteurs en acces anticipe pour iterer sur les usages",
      "Integration TTN LoRa et premier backend de collecte",
    ]
  },
  {
    phase:"Phase 2",
    label:"Industrialisation et premiers partenariats",
    status:"planned",
    items:[
      "PCB custom et boitier definitif (50 a 100 unites)",
      "World Model affine sur donnees terrain reelles (sol + satellite + meteo)",
      "Premiers partenariats cooperatives et negoces agricoles",
      "Certification CE boitier IoT",
      "API ouverte pour integration outils tiers (ERP agri, Smag, MesParcelles)",
    ]
  },
  {
    phase:"Phase 3",
    label:"Deploiement et ecosysteme",
    status:"future",
    items:[
      "Deploiement 500 a 2000 boitiers sur 5 cultures majeures",
      "World Model multi-cultures et multi-regions avec apprentissage federe",
      "Marketplace de modeles predictifs ouverte aux instituts techniques",
      "Couverture nationale France + ouverture marches iberique et maghrebin",
      "Tour de financement Serie A pour industrialisation a grande echelle",
    ]
  },
];

export function Roadmap() {
  return (
    <section className="py-24 px-6 bg-[#0d2b33]" id="roadmap">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">Roadmap</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Le chemin vers <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">le deploiement</span></h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">Un projet qui avance par etapes reelles, pas par annonces. Chaque phase doit etre validee avant de passer a la suivante.</p>
        </motion.div>
        <div className="relative">
          <div className="absolute left-6 top-6 bottom-6 w-px bg-[#2a9d8f]/20 hidden md:block" />
          <div className="space-y-6">
            {steps.map((s,i)=>(
              <motion.div key={s.phase} initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.15}}
                className={`relative md:pl-16 bg-[#1a6b5e]/08 border ${s.status==="current"?"border-[#2a9d8f]/50 shadow-[0_0_30px_rgba(42,157,143,0.08)]":"border-[#2a9d8f]/15"} rounded-2xl p-6`}>
                <div className={`absolute left-4 top-7 w-4 h-4 rounded-full border-2 hidden md:block ${s.status==="current"?"bg-[#2a9d8f] border-[#2a9d8f] shadow-[0_0_12px_rgba(42,157,143,0.6)]":"bg-[#0d2b33] border-[#2a9d8f]/30"}`} />
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-[#2a9d8f] text-xs font-semibold uppercase tracking-wider">{s.phase}</span>
                  {s.status==="current" && <span className="flex items-center gap-1.5 text-xs text-[#2a9d8f] bg-[#2a9d8f]/10 px-3 py-1 rounded-full border border-[#2a9d8f]/20"><span className="w-1.5 h-1.5 bg-[#2a9d8f] rounded-full animate-pulse" />En cours</span>}
                  <h3 className="text-lg font-bold text-white">{s.label}</h3>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                  {s.items.map(item=>(
                    <li key={item} className="flex items-start gap-2 text-[#9acfd3] text-sm">
                      <span className="text-[#2a9d8f] mt-0.5 shrink-0">&rarr;</span>{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
