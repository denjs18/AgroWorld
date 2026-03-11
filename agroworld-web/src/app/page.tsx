import { Navbar }          from "@/components/landing/Navbar";
import { Hero }            from "@/components/landing/Hero";
import { ProblemSection }  from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { HardwareSection } from "@/components/landing/HardwareSection";
import { AppSection }      from "@/components/landing/AppSection";
import { UseCases }        from "@/components/landing/UseCases";
import { Roadmap }         from "@/components/landing/Roadmap";
import { Partners }        from "@/components/landing/Partners";
import { Footer }          from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HardwareSection />
      <AppSection />
      <UseCases />
      <Roadmap />
      <Partners />
      <Footer />
    </main>
  );
}
