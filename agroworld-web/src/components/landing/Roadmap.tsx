"use client";
import { motion } from "framer-motion";

const steps = [
  {phase:"Phase 1",date:"Q1-Q2 2026",status:"current",title:"MVP & Validation terrain",
    items:["Boitier proto ESP32-S3 (5 unites test)","World Model bootstrap donnees synthetiques","App mobile MVP iOS/Android","3-5 agriculteurs pilotes"]},
  {phase:"Phase 2",date:"Q3-Q4 2026",status:"planned",title:"Industrialisation boitier",
    items:["PCB custom (50 unites)","World Model affine sur donnees reelles","Partenariats cooperatives","Certification CE boitier"]},
  {phase:"Phase 3",date:"2027",status:"future",title:"Scale & Ecosysteme",
    items:["1000+ boitiers deployes","API ouverte integration ERP agri","Couverture 5 cultures majeures","Levee de fonds Serie A"]},
];

export function Roadmap() {
  return (
    <section className="py-24 px-6 bg-[#0d2b33]" id="roadmap">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">Roadmap</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Le chemin vers <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">le deploiement</span></h2>
        </motion.div>
        <div className="space-y-8">
          {steps.map((s,i)=>(
            <motion.div key={s.phase} initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.15}}
              className={`bg-[#1a6b5e]/08 border ${s.status==="current"?"border-[#2a9d8f]/50 shadow-[0_0_30px_rgba(42,157,143,0.1)]":"border-[#2a9d8f]/20"} rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#2a9d8f] text-xs px-3 py-1 rounded-full border border-[#2a9d8f]/30">{s.date}</span>
                {s.status==="current"&&<span className="flex items-center gap-1 text-xs text-[#2a9d8f]"><span className="w-1.5 h-1.5 bg-[#2a9d8f] rounded-full animate-pulse" />En cours</span>}
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2">
                {s.items.map(item=>(<li key={item} className="flex items-start gap-2 text-[#9acfd3] text-sm"><span className="text-[#2a9d8f] mt-0.5">&#8594;</span>{item}</li>))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
