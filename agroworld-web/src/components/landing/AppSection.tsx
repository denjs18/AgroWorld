"use client";
import { motion } from "framer-motion";

const screens = [
  {emoji:"&#127807;",title:"Dashboard parcelles",desc:"Vue instantanee de toutes vos parcelles avec code couleur d alerte. Donnees actualisees toutes les 15 minutes depuis le boitier terrain."},
  {emoji:"&#128276;",title:"Alertes intelligentes",desc:"Notification push avec fenetre d intervention optimale et dose recommandee. Ex : Risque mildiou 78%, traiter jeudi 7h-10h, dose 0.75L/ha."},
  {emoji:"&#128302;",title:"Simulation What-if",desc:"Que se passe-t-il si je ne traite pas cette semaine ? Le World Model simule 4 scenarios sur 7 jours et compare rendements et risques."},
  {emoji:"&#128203;",title:"Carnet cultural",desc:"Saisie en 3 taps : type d action, produit, dose, note. Historique complet exportable PDF pour la PAC. Memoire totale sol + interventions."},
];

export function AppSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0d2b33] to-[#050f12]" id="app">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">L application</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Concue <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">pour le terrain</span></h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">Utilisable avec des gants, en plein soleil, en 30 secondes. Pas d abonnement, pas de formation requise.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {screens.map((s,i)=>(
            <motion.div key={s.title} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-6 hover:border-[#2a9d8f]/40 transition-all group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform" dangerouslySetInnerHTML={{__html:s.emoji}} />
              <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
              <p className="text-[#9acfd3] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
          className="mt-8 bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-6 flex flex-wrap gap-4 justify-center">
          {["iOS & Android","Mode offline","Notifications push","Multi-parcelles","Export PDF PAC","Communaute"].map(tag=>(
            <span key={tag} className="bg-[#1a6b5e]/30 text-[#9acfd3] px-4 py-2 rounded-full text-sm border border-[#2a9d8f]/20">&#10003; {tag}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
