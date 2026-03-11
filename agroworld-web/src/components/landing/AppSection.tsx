"use client";
import { motion } from "framer-motion";

const screens = [
  {
    tag:"Vue globale",
    title:"Dashboard parcelles",
    desc:"Toutes vos parcelles en un coup d oeil, avec un code couleur d alerte base sur les mesures temps reel du boitier. Les donnees se mettent a jour toutes les 15 minutes. Vous savez immediatement ou regarder en priorite."
  },
  {
    tag:"Anticipation",
    title:"Alertes et fenetres d intervention",
    desc:"Quand le risque depasse un seuil, l app vous envoie une notification avec la fenetre meteo optimale et la dose recommandee. Pas d alerte inutile, pas de sur-information : seulement ce qui change votre decision du lendemain."
  },
  {
    tag:"Simulation",
    title:"What-if : que se passe-t-il si...",
    desc:"Que se passe-t-il si vous decalez le traitement de 3 jours ? Si la pluie annoncee annule le passage prevu ? Le World Model simule plusieurs scenarios sur 7 jours pour que vous puissiez choisir en connaissance de cause."
  },
  {
    tag:"Tracabilite",
    title:"Carnet cultural numerique",
    desc:"Chaque intervention se saisit en 3 taps : type d action, produit, dose, observation libre. L historique complet sol + meteo + interventions est disponible a tout moment, exportable en PDF pour la PAC ou un audit."
  },
];

export function AppSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0d2b33] to-[#050f12]" id="app">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">L application</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Concue <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">pour le terrain</span></h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">Utilisable avec des gants, en plein soleil, sans formation. Pas d abonnement cache, pas de donnees revendues.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {screens.map((s,i)=>(
            <motion.div key={s.title} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-6 hover:border-[#2a9d8f]/40 transition-all">
              <span className="text-[#2a9d8f] text-xs font-semibold uppercase tracking-widest">{s.tag}</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-3">{s.title}</h3>
              <p className="text-[#9acfd3] leading-relaxed text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
          className="mt-8 bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-6 flex flex-wrap gap-3 justify-center">
          {["iOS et Android","Mode hors-ligne","Notifications push","Multi-parcelles","Export PDF PAC","Partage equipe"].map(tag=>(
            <span key={tag} className="bg-[#1a6b5e]/30 text-[#9acfd3] px-4 py-2 rounded-full text-sm border border-[#2a9d8f]/20">{tag}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
