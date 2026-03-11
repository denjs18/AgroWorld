export function Footer() {
  return (
    <footer className="border-t border-[#1a6b5e]/40 bg-[#020809] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">&#127807;</span>
          <span className="font-bold text-white">Agro<span className="text-[#2a9d8f]">World</span></span>
          <span className="text-[#1a6b5e] text-sm ml-2">Projet en developpement · Phase 1 · 2026</span>
        </div>
        <div className="text-[#1a6b5e] text-sm">Base a Paris · ESP32 · LoRa · FastAPI · PyTorch · React Native</div>
        <a href="/login" className="text-[#2a9d8f] hover:text-[#9acfd3] text-sm underline transition-colors">Acces equipe &rarr;</a>
      </div>
    </footer>
  );
}
