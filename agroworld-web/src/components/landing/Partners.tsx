"use client";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const profiles = [
  {emoji:"&#128668;",title:"Agriculteur pilote",desc:"Vous avez des parcelles et souhaitez tester le boitier en avant-premiere. 0 EUR pour les 10 premiers."},
  {emoji:"&#127807;",title:"Cooperative agricole",desc:"Vous gerez des milliers d adherents et cherchez a innover sur le conseil phyto et l irrigation."},
  {emoji:"&#128176;",title:"Investisseur",desc:"Vous croyez dans l agritech souveraine et le potentiel des World Models appliques au reel."},
  {emoji:"&#128300;",title:"Partenaire recherche",desc:"INRAE, ARVALIS, chambre d agriculture : co-developpons des datasets et validons les modeles."},
];

export function Partners() {
  const {register,handleSubmit,reset,formState:{isSubmitting}} = useForm<{name:string,email:string,profile:string,message:string}>();
  const onSubmit = async (data: {name:string,email:string,profile:string,message:string}) => {
    try {
      await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      toast.success("Message envoye ! Nous vous recontactons sous 48h.");
      reset();
    } catch {
      toast.error("Erreur envoi. Ecrivez a contact@agroworld.io");
    }
  };
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#050f12] to-[#020809]" id="partners">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
          <span className="text-[#2a9d8f] text-sm font-semibold uppercase tracking-widest">Rejoignez le projet</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Nous cherchons des <span className="bg-gradient-to-r from-[#2a9d8f] to-[#9acfd3] bg-clip-text text-transparent">partenaires fondateurs</span></h2>
          <p className="text-[#9acfd3] text-lg max-w-2xl mx-auto">Le projet est en Phase 1. Rejoindre maintenant, c est co-construire la solution et beneficier de conditions preferentielles.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {profiles.map((p,i)=>(
            <motion.div key={p.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-6 text-center hover:border-[#2a9d8f]/40 transition-all">
              <div className="text-4xl mb-3" dangerouslySetInnerHTML={{__html:p.emoji}} />
              <h3 className="text-white font-bold mb-2">{p.title}</h3>
              <p className="text-[#9acfd3] text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="max-w-2xl mx-auto bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(42,157,143,0.1)]">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Entrons en contact</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input {...register("name",{required:true})} placeholder="Nom / Structure"
                className="w-full bg-[#050f12]/60 border border-[#2a9d8f]/30 text-white placeholder-[#1a6b5e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a9d8f]" />
              <input {...register("email",{required:true})} type="email" placeholder="Email"
                className="w-full bg-[#050f12]/60 border border-[#2a9d8f]/30 text-white placeholder-[#1a6b5e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a9d8f]" />
            </div>
            <select {...register("profile")} className="w-full bg-[#050f12]/60 border border-[#2a9d8f]/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a9d8f]">
              <option value="">Votre profil...</option>
              <option value="agri">Agriculteur pilote</option>
              <option value="coop">Cooperative / Negoce</option>
              <option value="investor">Investisseur</option>
              <option value="research">Recherche / Institut</option>
              <option value="other">Autre</option>
            </select>
            <textarea {...register("message")} placeholder="Dites-nous en plus (optionnel)..." rows={3}
              className="w-full bg-[#050f12]/60 border border-[#2a9d8f]/30 text-white placeholder-[#1a6b5e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a9d8f] resize-none" />
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-[#2a9d8f] hover:bg-[#1a6b5e] text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 text-lg">
              {isSubmitting?"Envoi...":"&#128640; Rejoindre le projet →"}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
