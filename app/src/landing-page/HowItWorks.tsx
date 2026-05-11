import { Fingerprint, Vote, Link, SearchCheck } from "lucide-react";
import CrystalIcon from "./CrystalIcon";
import SectionTitle from "./components/SectionTitle";

const steps = [
  {
    icon: <CrystalIcon color="#00d2ff"><Fingerprint className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Registro",
    description: "Verificación de identidad con IA: biometría facial + documento de identidad.",
  },
  {
    icon: <CrystalIcon color="#a855f7"><Vote className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Votación",
    description: "Selección de candidato u opción en una interfaz segura e intuitiva.",
  },
  {
    icon: <CrystalIcon color="#f59e0b"><Link className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Registro en Blockchain",
    description: "El voto cifrado se registra en Syscoin NEVM como transacción inmutable.",
  },
  {
    icon: <CrystalIcon color="#34d399"><SearchCheck className="h-6 w-6 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Verificación",
    description: "Cualquier persona puede auditar el resultado en el explorador de bloques.",
  },
];

export default function HowItWorks() {
  return (
    <div id="how-it-works" className="mx-auto my-24 max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionTitle
        title="Cómo funciona"
        description="Cuatro pasos simples para una votación segura y transparente"
      />
      <div className="relative mt-16">
        <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-400 via-purple-400 to-emerald-400 md:block" />
        <div className="grid gap-8 md:grid-cols-4 md:gap-0">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-400/50 bg-background shadow-lg shadow-amber-500/10">
                {step.icon}
              </div>
              <div className="absolute top-8 left-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-amber-400/30 to-transparent md:block md:left-[calc(50%+2rem)]" />
              <div className="mt-4 rounded-xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm">
                <div className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-purple-500 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-2 text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
