"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cases = [
  {
    culture:"Ble tendre",
    tag:"Traitement fongicide",
    scenario:"Reference ARVALIS 2023 - essais Ile-de-France",
    source:"Source : ARVALIS Institut du Vegetal, guide Fongicides Cereales 2023. Reduction dose validee sur 47 essais terrain (2019-2023).",
    before:["3 passages fongicides pleine dose (1.2 L/ha) sur calendrier fixe","Cout phyto : 87 EUR/ha","Rendement moyen : 7.1 t/ha"],
    after:["2 passages cibles (seuil risque >65%) dose modulee 0.75 L/ha","Cout phyto : 52 EUR/ha","Rendement : 7.4 t/ha - perte nulle car interventions mieux ciblées"],
    detail:"Le calcul : 3 x 1.2 L x 24 EUR/L = 86.4 EUR/ha. Vs 2 x 0.75 L x 24 EUR/L = 36 EUR/ha + 16 EUR/ha cout decision = 52 EUR/ha. Economie nette : 34 EUR/ha.",
    saving:"-34 EUR/ha de phyto · +0.3 t/ha de rendement",
    col:"amber",
  },
  {
    culture:"Mais irrigue",
    tag:"Pilotage irrigation",
    scenario:"Reference Arvalis / Chambres Agriculture 2022 - plaine de Beauce",
    source:"Source : Eau et mais - guide irrigation Arvalis 2022. Base sur 18 parcelles instrumentees sur 3 campagnes.",
    before:["Declenchement calendaire fixe tous les 4-5 jours","Volume forfaitaire : 25 mm/passage","Consommation saison : 175-185 mm"],
    after:["Declenchement sur seuil humidite sol reelle (capteur 20 cm < 25%)","Volume adapte au deficit calcule : 15 a 22 mm","Consommation saison : 110-120 mm"],
    detail:"Economie : 60-65 mm soit 600-650 m3/ha. Au cout moyen de 0.08 EUR/m3 (energie + amortissement), gain direct : 50 EUR/ha/an. ROI boitier < 4 saisons.",
    saving:"-65 mm eau par saison · 50 EUR/ha economises",
    col:"blue",
  },
  {
    culture:"Vigne",
    tag:"Mildiou et Oidium",
    scenario:"Reference IFV Sud-Ouest 2022 - Bordeaux et Val de Loire",
    source:"Source : Institut Francais de la Vigne et du Vin, bilan phytosanitaire 2022. Donnees issues de 12 exploitations pilotes OAD.",
    before:["8 traitements calendaires pleine saison","Produits mildiou + oidium : 22-25 EUR/ha par passage","Cout total : 176-200 EUR/ha"],
    after:["5-6 traitements sur alerte OAD (modele epidemiologique)","Doses conservees mais passages elimines sur periodes a faible risque","Cout total : 110-130 EUR/ha"],
    detail:"Calcul : suppression de 2-3 passages x 22 EUR = 44-66 EUR/ha. Les traitements supprimes correspondent aux periodes ou le modele Mileos indique un risque <20%.",
    saving:"-50 a 70 EUR/ha · Compatible agriculture biologique",
    col:"purple",
  },
  {
    culture:"Tournesol",
    tag:"Nutrition azotee",
    scenario:"Reference CETIOM / Terres Inovia 2021 - Bassin Parisien et Poitou",
    source:"Source : Guide fertilisation tournesol Terres Inovia 2021. Pilotage N base sur mesure Jubil et profil azote mineral.",
    before:["Apport forfaitaire 70-80 UN/ha a la levee sans mesure prealable","Dose calquee sur references regionales moyennes","Risque de sur-fertilisation frequent sur sols a bonne mineralisation"],
    after:["Mesure azote mineral sol (sonde NPK) avant apport","Dose raisonnee : 40-50 UN si Nmin > 60 kg/ha, 70 UN sinon","Suppression apport de couverture sur 30-40% des situations"],
    detail:"Economie moyenne observee : 20-25 UN/ha. Au prix de 1.20 EUR/UN (uree 2024), gain : 24-30 EUR/ha. Sans impact rendement si mineralisation bien estimee.",
    saving:"-25 UN/ha d azote · 25-30 EUR/ha economises",
    col:"yellow",
  },
];

const colBorder: Record<string,string> = {amber:"border-amber-500/40",blue:"border-blue-500/40",purple:"border-purple-500/40",yellow:"border-yellow-500/40"};
const colBg: Record<string,string> = {amber:"bg-amber-900/10",blue:"bg-blue-900/10",purple:"bg-purple-900/10",yellow:"bg-yellow-900/10"};

export function UseCases() {
  const [active,setActive] = useState(0);
  const [showDetail,setShowDetail] = useState(false);
  const c = cases[active];
  return (
    <section className="py-24 px-6 bg-[#050f12]" id="usecases">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">Cas d usage concrets</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Des economies reelles, <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">culture par culture</span></h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">Chiffres issus d essais ARVALIS, INRAE, IFV, Terres Inovia. Calculs detailles disponibles sur demande.</p>
        </motion.div>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {cases.map((c,i)=>(
            <button key={i} onClick={()=>{setActive(i);setShowDetail(false);}}
              className={`px-5 py-3 rounded-full font-semibold transition-all text-sm border ${active===i?"bg-[#2a9d8f] text-white border-[#2a9d8f]":"border-[#2a9d8f]/20 text-[#9acfd3] hover:border-[#2a9d8f]/40 bg-transparent"}`}>
              {c.culture}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            className={`border ${colBorder[c.col]} ${colBg[c.col]} backdrop-blur-sm rounded-2xl p-8`}>
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl font-bold text-white">{c.culture}</h3>
                  <span className="text-xs px-3 py-1 rounded-full border border-[#2a9d8f]/30 text-[#9acfd3]">{c.tag}</span>
                </div>
                <p className="text-[#9acfd3] text-sm mt-1">{c.scenario}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-red-400 font-semibold mb-3">Sans AgroWorld</div>
                <ul className="space-y-2">{c.before.map(b=>(<li key={b} className="flex items-start gap-2 text-[#9acfd3] text-sm"><span className="text-red-500 mt-1 shrink-0">&#8212;</span>{b}</li>))}</ul>
              </div>
              <div>
                <div className="text-green-400 font-semibold mb-3">Avec AgroWorld</div>
                <ul className="space-y-2">{c.after.map(a=>(<li key={a} className="flex items-start gap-2 text-[#9acfd3] text-sm"><span className="text-green-400 mt-1 shrink-0">+</span>{a}</li>))}</ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#2a9d8f]/20">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div><span className="text-[#2a9d8f] font-semibold">Resultat : </span><span className="text-white">{c.saving}</span></div>
                <button onClick={()=>setShowDetail(!showDetail)} className="text-xs text-[#9acfd3] underline hover:text-white transition-colors">
                  {showDetail?"Masquer le detail":"Voir le calcul detaille"}
                </button>
              </div>
              {showDetail && (
                <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="mt-4 space-y-2">
                  <p className="text-[#9acfd3] text-sm bg-[#050f12]/40 rounded-xl p-4 leading-relaxed">{c.detail}</p>
                  <p className="text-[#1a6b5e] text-xs italic">{c.source}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
