"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cases = [
  {
    culture:"&#127807; Ble tendre",tag:"Traitement fongicide",scenario:"Saison 2024 - Eure-et-Loir",
    before:["3 passages fongicides systematiques pleine dose (1.2 L/ha)","Decision sur calendrier fixe sans donnees terrain","Cout phyto : 87 EUR/ha · Rendement : 7.1 t/ha"],
    after:["2 passages cibles (risque >65%) dose optimisee (0.75 L/ha)","Declenchement sur fenetre meteo favorable","Cout phyto : 52 EUR/ha (-40%) · Rendement : 7.4 t/ha (+4%)"],
    saving:"-35 EUR/ha de phyto · Simulation sur donnees ARVALIS",col:"amber",
  },
  {
    culture:"&#127805; Mais irrigue",tag:"Pilotage irrigation",scenario:"Saison 2024 - Beauce",
    before:["Declenchement sur calendrier fixe (tous les 4 jours)","Volume apporte : 25 mm/passage","Consommation eau : 180 mm/saison"],
    after:["Declenchement si humidite sol <25% a 20cm","Volume adapte au deficit reel calcule","Consommation eau : 115 mm/saison (-36%)"],
    saving:"-65 mm eau economies · ROI boitier < 1 saison",col:"blue",
  },
  {
    culture:"&#127815; Vigne",tag:"Mildiou & Oidium",scenario:"Millesime 2024 - Val de Loire",
    before:["8 traitements sur calendrier classique","Doses pleines a chaque passage","Cout traitement : 340 EUR/ha"],
    after:["5 traitements cibles (score risque >70%)","Dose modulee selon pression reelle","Cout traitement : 195 EUR/ha (-43%)"],
    saving:"-145 EUR/ha · Compatible agriculture biologique",col:"purple",
  },
  {
    culture:"&#127803; Tournesol",tag:"Nutrition azotee",scenario:"Printemps 2025 - Poitou",
    before:["Apport azote forfaitaire 80 UN/ha a la levee","Aucun suivi mineralisation en cours de saison","Surcout fertilisation : +30 UN/ha inutiles"],
    after:["Mesure NPK sol temps reel (sonde RS485)","Fractionnement pilote : 45 UN levee + 25 UN si N<60mg/kg","Economie engrais : 28 EUR/ha"],
    saving:"-28 EUR/ha d engrais · Reduction empreinte azote -37%",col:"yellow",
  },
];

const colBorder: Record<string,string> = {amber:"border-amber-500/40",blue:"border-blue-500/40",purple:"border-purple-500/40",yellow:"border-yellow-500/40"};
const colBg: Record<string,string> = {amber:"bg-amber-900/10",blue:"bg-blue-900/10",purple:"bg-purple-900/10",yellow:"bg-yellow-900/10"};

export function UseCases() {
  const [active,setActive] = useState(0);
  const c = cases[active];
  return (
    <section className="py-24 px-6 bg-[#050f12]" id="usecases">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">Cas d usage concrets</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Des economies reelles, <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">culture par culture</span></h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">Simulations basees sur donnees ARVALIS, INRAE, CTIFL.</p>
        </motion.div>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {cases.map((c,i)=>(
            <button key={i} onClick={()=>setActive(i)}
              className={`px-5 py-3 rounded-full font-semibold transition-all text-sm border ${active===i?"bg-[#2a9d8f] text-white border-[#2a9d8f]":"border-[#2a9d8f]/20 text-[#9acfd3] hover:border-[#2a9d8f]/40 bg-transparent"}`}
              dangerouslySetInnerHTML={{__html:c.culture}} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            className={`border ${colBorder[c.col]} ${colBg[c.col]} backdrop-blur-sm rounded-2xl p-8`}>
            <div className="flex items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white" dangerouslySetInnerHTML={{__html:c.culture}} />
                  <span className="text-xs px-3 py-1 rounded-full border border-current text-[#9acfd3]">{c.tag}</span>
                </div>
                <p className="text-[#9acfd3] text-sm">{c.scenario}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-red-400 font-semibold mb-3">&#10060; Sans AgroWorld</div>
                <ul className="space-y-2">{c.before.map(b=>(<li key={b} className="flex items-start gap-2 text-[#9acfd3] text-sm"><span className="text-red-500 mt-0.5">&#8226;</span>{b}</li>))}</ul>
              </div>
              <div>
                <div className="text-green-400 font-semibold mb-3">&#10003; Avec AgroWorld</div>
                <ul className="space-y-2">{c.after.map(a=>(<li key={a} className="flex items-start gap-2 text-[#9acfd3] text-sm"><span className="text-green-400 mt-0.5">&#10003;</span>{a}</li>))}</ul>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2a9d8f]/20 text-center">
              <span className="text-[#2a9d8f] font-semibold">&#128176; Resultat : </span>
              <span className="text-white">{c.saving}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
