import { Eye, FileSearch, Shield, MessageCircle, CheckCircle } from "lucide-react";
import CrystalIcon from "./CrystalIcon";
import SectionTitle from "./components/SectionTitle";
import PlasmaCard from "./components/PlasmaCard";

const securityCards = [
  {
    icon: <CrystalIcon color="#00d2ff" size="sm"><Eye className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "R2 · Anonimato seudónimo",
    description: "No pedimos nombre real ni almacenamos PII. El aportante siempre va como seudónimo. Sin identidad, no hay represalia.",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: <CrystalIcon color="#a855f7" size="sm"><FileSearch className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "R3 · Especificidad",
    description: "Sin un hecho concreto —fecha, nombre, cargo, evidencia— no se publica. Las creencias no entran al grafo. Los hechos sí.",
    accent: "from-purple-400 to-violet-500",
  },
  {
    icon: <CrystalIcon color="#f59e0b" size="sm"><Shield className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "R5 · Score de corroboración",
    description: "Cada señalamiento tiene un peso público según fuentes, evidencia documental y vínculos. No hay veredictos, solo señales.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    icon: <CrystalIcon color="#f472b6" size="sm"><MessageCircle className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "R6 · Lenguaje no inflamatorio",
    description: "Alivia nunca dice 'corrupto'. Dice 'señalado', 'vinculado', 'figura en el aporte'. La línea entre periodismo y panfleto no se cruza.",
    accent: "from-red-400 to-rose-500",
  },
  {
    icon: <CrystalIcon color="#34d399" size="sm"><CheckCircle className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "R10 · Confirmación explícita",
    description: "Antes de publicar, Alivia confirma con el aportante: 'voy a publicar tu señalamiento, ¿lo confirmas?'. Nunca actúa sin consentimiento.",
    accent: "from-emerald-400 to-green-500",
  },
];

export default function SecurityFeatures() {
  return (
    <div id="security" className="mx-auto my-16 max-w-7xl px-4 sm:my-24 sm:px-6 md:my-32 lg:px-8">
      <SectionTitle
        title="Principios anti-abuso"
        description="Cinco reglas operativas que protegen la integridad del grafo y a quienes aportan"
      />
      <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 md:mt-16 md:gap-5 lg:grid-cols-3">
        {securityCards.map((card) => (
          <PlasmaCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            description={card.description}
            accentColor={card.accent}
          />
        ))}
      </div>
    </div>
  );
}
