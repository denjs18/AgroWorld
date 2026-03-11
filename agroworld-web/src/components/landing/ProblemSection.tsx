"use client";
import { motion } from "framer-motion";

const problems = [
  {
    title:"Un gaspillage de produits qui n est pas une fatalite",
    text:"Par precaution, la plupart des agriculteurs appliquent la dose maximale homologuee. Mais un traitement fongicide declenche au bon stade vegetatif, dans une fenetre meteo favorable, permet souvent de reduire les doses de 30 a 50% sans perdre en efficacite. Il manque simplement les donnees pour prendre cette decision en confiance."
  },
  {
    title:"L irrigation a l aveugle",
    text:"Irriguer sans connaitre l humidite reelle du sol a differentes profondeurs, c est arroser trop tot ou trop tard. Les consequences sont concretes : stress hydrique en periode critique, lixiviation des nutrients, consommation inutile d une ressource de plus en plus rare. Les outils existent. Ils ne sont juste pas encore accessibles."
  },
  {
    title:"Les maladies, toujours detectees trop tard",
    text:"Le mildiou, la rouille, le botrytis : quand les symptomes sont visibles a l oeil nu, il est generalement trop tard pour un traitement curatif efficace. L enjeu n est pas de reagir plus vite, c est d anticiper 48 a 72 heures a l avance, quand le traitement preventif est encore pleinement efficace."
  },
  {
    title:"Une memoire culturale qui repart de zero chaque annee",
    text:"Sans historique structure qui croise sol, meteo et interventions, chaque saison recommence de zero. Les decisions se prennent sur des impressions ou des carnets papier incomplets. Capitaliser sur ses propres donnees terrain devrait etre un droit, pas un luxe reserve aux grandes exploitations."
  },
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
              <div className="w-8 h-[2px] bg-[#2a9d8f] mb-4 rounded-full" />
              <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
              <p className="text-[#9acfd3] leading-relaxed text-sm">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
