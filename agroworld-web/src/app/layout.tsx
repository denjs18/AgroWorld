import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgroWorld — L'IA au service de vos cultures",
  description: "Boîtier terrain multi-capteurs + World Model IA pour guider irrigation, traitements phytosanitaires et fertilisation. Projet en recherche de partenaires.",
  openGraph: {
    title: "AgroWorld — L'IA au service de vos cultures",
    description: "Projet innovant IA + IoT agricole. Rejoignez l'aventure.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} bg-agro-900 text-white antialiased`}>
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
