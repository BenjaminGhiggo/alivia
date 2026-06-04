import { MessageCircle, Bot, Link, SearchCheck } from "lucide-react";
import CrystalIcon from "./CrystalIcon";
import SectionTitle from "./components/SectionTitle";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <CrystalIcon color="#00d2ff"><MessageCircle className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Reporta",
    description: "Escribele a Alivia en Telegram o Discord. Cuentale lo que viste — una licitacion sospechosa, un vinculo familiar, un contrato amanado.",
  },
  {
    icon: <CrystalIcon color="#a855f7"><Bot className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Entrevista",
    description: "Alivia te hace preguntas para estructurar tu pista: fechas, nombres, cargos, empresas, evidencia disponible. Sin apuro, sin interrumpir.",
  },
  {
    icon: <CrystalIcon color="#f59e0b"><Link className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Conecta y sella",
    description: "Tu aporte se vincula al grafo publico y se mintea un NFT-Acta en Syscoin Tanenbaum. Nadie puede borrarlo.",
  },
  {
    icon: <CrystalIcon color="#34d399"><SearchCheck className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Consulta",
    description: "Cualquier persona puede explorar el grafo, preguntarle a Alivia por un nombre, o citar el hash del NFT-Acta para verificar.",
  },
];

export default function HowItWorks() {
  return (
    <div id="how-it-works" className="mx-auto my-16 max-w-7xl px-4 sm:my-24 sm:px-6 md:my-32 lg:px-8">
      <SectionTitle
        title="Cómo funciona"
        description="Cuatro pasos para que una pista ciudadana se vuelva memoria publica"
      />
      <div className="relative mt-10 sm:mt-14 md:mt-20">
        <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-400 to-purple-400 md:block" />
        <div className="space-y-8 sm:space-y-12 md:space-y-16">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`relative flex flex-col items-center gap-4 sm:gap-6 md:gap-8 md:flex-row ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div className="flex-1 text-center md:text-left">
                <div>
                  {step.icon}
                </div>
                <h3 className="mt-3 text-lg font-bold text-foreground sm:mt-4 sm:text-xl">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">{step.description}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-400 bg-background text-sm font-bold text-amber-600 md:absolute md:left-1/2 md:-translate-x-1/2">
                {i + 1}
              </div>
              <div className="flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
