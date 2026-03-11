"use client";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#050f12] via-[#0d2b33] to-[#050f12]" />
      <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 30% 50%, rgba(42,157,143,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(106,184,191,0.08) 0%, transparent 50%)"}} />
      <div className="absolute inset-0 opacity-5" style={{backgroundImage:"linear-gradient(rgba(42,157,143,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(42,157,143,0.5) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-[#9acfd3] mb-8 border border-[#2a9d8f]/30 bg-[#1a6b5e]/10 backdrop-blur-sm">
          <span className="w-2 h-2 bg-[#2a9d8f] rounded-full animate-pulse" />
          Projet en developpement &middot; Recherche de partenaires
        </motion.div>
        <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="text-white">L&apos;IA au service</span><br />
          <span className="bg-gradient-to-r from-[#2a9d8f] via-[#6ab8bf] to-[#9acfd3] bg-clip-text text-transparent">de vos cultures</span>
        </motion.h1>
        <motion.p initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
          className="text-xl text-[#9acfd3] max-w-3xl mx-auto mb-10 leading-relaxed">
          AgroWorld combine un <strong className="text-white">boitier IoT terrain</strong> multi-capteurs
          et un <strong className="text-white">World Model IA</strong> pour guider chaque decision agricole &mdash;
          traitement phytosanitaire, irrigation, fertilisation &mdash; au bon moment, a la bonne dose.
        </motion.p>
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.5}}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#partners" className="bg-[#2a9d8f] hover:bg-[#1a6b5e] text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(42,157,143,0.3)]">
            Rejoindre le projet &rarr;
          </a>
          <a href="#solution" className="border border-[#2a9d8f]/40 bg-[#1a6b5e]/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#1a6b5e]/30 transition-all">
            Decouvrir la solution
          </a>
        </motion.div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[["−40%","de pesticides","grace au dosage optimal"],["−35%","d eau irrigation","par pilotage precis"],["+8%","de rendement","par anticipation des risques"]].map(([val,label,sub]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-[#2a9d8f]">{val}</div>
              <div className="text-white font-semibold text-sm">{label}</div>
              <div className="text-[#9acfd3] text-xs mt-1">{sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#2a9d8f]/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-[#2a9d8f] rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
