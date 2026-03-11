"use client";
import { motion } from "framer-motion";

const problems = [
  {icon:"&#128184;",title:"Gaspillage de pesticides",text:"Les agriculteurs appliquent souvent des doses maximales homologuees par precaution. Un traitement au bon stade vegetatif, aux conditions meteo optimales, permet de diviser les doses par 2 a 3 avec la meme efficacite."},
  {icon:"&#127783;",title:"Irrigation mal pilotee",text:"Irriguer sans connaitre l humidite reelle du sol a 3 profondeurs, c est arroser soit trop tot, soit trop tard. 35% de l eau agricole est gaspillee faute de donnees terrain precises."},
  {icon:"&#129748;",title:"Maladies detectees trop tard",text:"Le mildiou, la rouille, le botrytis : quand les symptomes sont visibles, il est souvent trop tard pour un traitement curatif efficace. L anticipation 48-72h change tout."},
  {icon:"&#128203;",title:"Aucune memoire culturale",text:"Chaque saison, les decisions sont prises de memoire ou sur des carnets papier. Sans historique structure sol/meteo/interventions, impossible d optimiser d une saison a l autre."},
];

export function ProblemSection() {
  return (
    <section className="py-24 px-6 bg-[#050f12]" id="probleme">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">Le constat</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Ce que les agriculteurs vivent <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">chaque saison</span></h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">Des decisions prises a l aveugle, faute de donnees temps reel et d outils de prediction adaptes au terrain.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((p,i) => (
            <motion.div key={p.title} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="bg-[#1a6b5e]/08 backdrop-blur-sm border border-[#2a9d8f]/20 rounded-2xl p-6 hover:border-[#2a9d8f]/40 transition-all">
              <div className="text-4xl mb-4" dangerouslySetInnerHTML={{__html:p.icon}} />
              <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
              <p className="text-[#9acfd3] leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
