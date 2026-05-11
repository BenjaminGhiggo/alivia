import { Eye, Code2, Network, Lock, Siren } from "lucide-react";
import CrystalIcon from "./CrystalIcon";
import SectionTitle from "./components/SectionTitle";
import PlasmaCard from "./components/PlasmaCard";

const securityCards = [
  {
    icon: <CrystalIcon color="#00d2ff" size="sm"><Eye className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Zero-Knowledge Proofs",
    description: "Privacidad del voto garantizada: se verifica la validez sin revelar el contenido del voto.",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    icon: <CrystalIcon color="#a855f7" size="sm"><Code2 className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Smart Contract Auditable",
    description: "Código abierto y auditado por terceros independientes. Transparencia total del proceso.",
    accent: "from-purple-400 to-violet-500",
  },
  {
    icon: <CrystalIcon color="#f59e0b" size="sm"><Network className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Merge-mining con Bitcoin",
    description: "La red más segura del mundo protege cada transacción de la plataforma.",
    accent: "from-amber-400 to-orange-500",
  },
  {
    icon: <CrystalIcon color="#f472b6" size="sm"><Lock className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Cifrado End-to-End",
    description: "Desde el dispositivo del votante hasta la blockchain, tu voto viaja siempre cifrado.",
    accent: "from-red-400 to-rose-500",
  },
  {
    icon: <CrystalIcon color="#34d399" size="sm"><Siren className="h-5 w-5 stroke-[var(--color-glow)]" /></CrystalIcon>,
    title: "Resistencia a DDoS",
    description: "Infraestructura distribuida con mitigación automática de ataques de denegación de servicio.",
    accent: "from-emerald-400 to-green-500",
  },
];

export default function SecurityFeatures() {
  return (
    <div id="security" className="mx-auto my-32 max-w-7xl px-6 lg:px-8">
      <SectionTitle
        title="Seguridad de grado institucional"
        description="Múltiples capas de protección para cada etapa del proceso electoral"
      />
      <div className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
