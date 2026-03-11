"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md bg-[#0d2b33]/90 py-3 shadow-lg border-b border-[#1a6b5e]/30" : "bg-transparent py-5"}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">&#127807;</span>
          <span className="font-bold text-xl text-white">Agro<span className="text-[#2a9d8f]">World</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#9acfd3]">
          {[["Solution","#solution"],["Materiel","#hardware"],["Application","#app"],["Cas d usage","#usecases"],["Roadmap","#roadmap"]].map(([l,h]) => (
            <a key={h} href={h} className="hover:text-[#2a9d8f] transition-colors">{l}</a>
          ))}
        </div>
        <a href="#partners" className="bg-[#2a9d8f] hover:bg-[#1a6b5e] text-white px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105">
          Devenir partenaire &rarr;
        </a>
      </div>
    </nav>
  );
}
