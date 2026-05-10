import { Fingerprint, Vote, Link, SearchCheck } from "lucide-react";
import SectionTitle from "./components/SectionTitle";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <Fingerprint className="h-8 w-8" />,
    title: "Registro",
    description: "Verificación de identidad con IA: biometría facial + documento de identidad.",
  },
  {
    icon: <Vote className="h-8 w-8" />,
    title: "Votación",
    description: "Selección de candidato u opción en una interfaz segura e intuitiva.",
  },
  {
    icon: <Link className="h-8 w-8" />,
    title: "Registro en Blockchain",
    description: "El voto cifrado se registra en Syscoin NEVM como transacción inmutable.",
  },
  {
    icon: <SearchCheck className="h-8 w-8" />,
    title: "Verificación",
    description: "Cualquier persona puede auditar el resultado en el explorador de bloques.",
  },
];

export default function HowItWorks() {
  return (
    <div id="how-it-works" className="mx-auto my-32 max-w-7xl px-6 lg:px-8">
      <SectionTitle
        title="Cómo funciona"
        description="Cuatro pasos simples para una votación segura y transparente"
      />
      <div className="relative mt-20">
        <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-400 to-purple-400 md:block" />
        <div className="space-y-16">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`relative flex flex-col items-center gap-8 md:flex-row ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                  {step.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
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
