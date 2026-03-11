"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push("/app");
    else setError("Email ou mot de passe incorrect");
  };

  return (
    <div className="min-h-screen bg-[#050f12] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">&#127807;</span>
          <h1 className="text-2xl font-bold text-white mt-3">Agro<span className="text-[#2a9d8f]">World</span></h1>
          <p className="text-[#9acfd3] mt-2">Acces equipe et partenaires</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#1a6b5e]/08 border border-[#2a9d8f]/20 rounded-2xl p-8 space-y-4">
          {error && <div className="bg-red-900/30 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required
            className="w-full bg-[#050f12]/60 border border-[#2a9d8f]/30 text-white placeholder-[#1a6b5e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a9d8f]" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe" required
            className="w-full bg-[#050f12]/60 border border-[#2a9d8f]/30 text-white placeholder-[#1a6b5e] rounded-xl px-4 py-3 focus:outline-none focus:border-[#2a9d8f]" />
          <button type="submit" disabled={loading}
            className="w-full bg-[#2a9d8f] hover:bg-[#1a6b5e] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
            {loading?"Connexion...":"Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
