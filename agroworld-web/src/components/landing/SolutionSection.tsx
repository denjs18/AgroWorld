"use client";
import { motion } from "framer-motion";

export function SolutionSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#050f12] to-[#0d2b33]" id="solution">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">La solution</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Un <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">World Model IA</span> nourri de capteurs reels</h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">Contrairement a un simple chatbot, AgroWorld apprend la dynamique reelle de votre champ et simule l avenir avec une causalite physique.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {[
            {emoji:"&#128225;",title:"Capteurs terrain",items:["Sol : NPK, pH, EC, humidite x3","Air : T, RH, pression","Meteo : vent, pluie, PAR","Vision : camera RGB + NIR (NDVI)"]},
            {emoji:"&#129504;",title:"World Model IA",items:["LSTM bidirectionnel + Attention","Fusion capteurs + satellite Sentinel-2","Prediction J+1 a J+7","Apprentissage continu terrain"]},
            {emoji:"&#128241;",title:"App agriculteur",items:["Alertes push intelligentes","Fenetres d intervention optimales","Simulation what-if en 2 taps","Carnet cultural automatique"]},
          ].map((col,i) => (
            <motion.div key={col.title} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.15}}
              className="bg-[#1a6b5e]/08 backdrop-blur-sm border border-[#2a9d8f]/20 rounded-2xl p-6 hover:border-[#2a9d8f]/40 transition-all">
              <div className="text-4xl mb-3" dangerouslySetInnerHTML={{__html:col.emoji}} />
              <h3 className="text-xl font-bold text-white mb-4">{col.title}</h3>
              <ul className="space-y-2">{col.items.map(item=>(
                <li key={item} className="flex items-start gap-2 text-[#9acfd3] text-sm"><span className="text-[#2a9d8f] mt-0.5">&#10003;</span>{item}</li>
              ))}</ul>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Pourquoi un World Model plutot qu un LLM ?</h3>
              <p className="text-[#9acfd3] mb-4 leading-relaxed">Les grands modeles de langage halucinent et ne comprennent pas la causalite physique. Un World Model apprend a <strong className="text-white">simuler la realite</strong> : si la temperature monte de 5 C avec une hygrometrie a 85%, il sait que le champignon va se developper dans 36h.</p>
              <p className="text-[#9acfd3] leading-relaxed">C est l approche defendue par <strong className="text-white">Yann LeCun (Meta AMI Labs)</strong> : l intelligence reelle passe par la modelisation du monde physique.</p>
            </div>
            <div className="bg-[#050f12]/60 rounded-xl p-6 font-mono text-sm space-y-3">
              {[
                ["Entree capteurs 96h","T=18.5C · RH=84% · Pluie=2.1mm","text-[#9acfd3]"],
                ["Contexte parcelle","Ble tendre · BBCH 32 · Conv.","text-[#9acfd3]"],
                ["Risque mildiou J+3","78% (eleve)","text-amber-400"],
                ["Fenetre traitement","Jeudi 7h-10h (vent < 3m/s)","text-green-400"],
                ["Dose recommandee","0.75 L/ha vs 1.2 homologue","text-green-400"],
                ["Economie estimee","-37% produit","text-[#2a9d8f]"],
              ].map(([label,val,color])=>(
                <div key={label}><span className="text-[#1a6b5e]">{label}: </span><span className={color}>{val}</span></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
