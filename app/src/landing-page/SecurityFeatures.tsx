import { Eye, Code2, Network, Lock, Siren } from "lucide-react";
import SectionTitle from "./components/SectionTitle";
import { Card, CardContent, CardDescription, CardTitle } from "../client/components/ui/card";

interface SecurityCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const securityCards: SecurityCard[] = [
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Zero-Knowledge Proofs",
    description: "Privacidad del voto garantizada: se verifica la validez sin revelar el contenido del voto.",
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    title: "Smart Contract Auditable",
    description: "Código abierto y auditado por terceros independientes. Transparencia total del proceso.",
  },
  {
    icon: <Network className="h-6 w-6" />,
    title: "Merge-mining con Bitcoin",
    description: "La red más segura del mundo protege cada transacción de la plataforma.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Cifrado End-to-End",
    description: "Desde el dispositivo del votante hasta la blockchain, tu voto viaja siempre cifrado.",
  },
  {
    icon: <Siren className="h-6 w-6" />,
    title: "Resistencia a DDoS",
    description: "Infraestructura distribuida con mitigación automática de ataques de denegación de servicio.",
  },
];

export default function SecurityFeatures() {
  return (
    <div id="security" className="mx-auto my-32 max-w-7xl px-6 lg:px-8">
      <SectionTitle
        title="Seguridad de grado institucional"
        description="Múltiples capas de protección para cada etapa del proceso electoral"
      />
      <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {securityCards.map((card) => (
          <Card key={card.title} variant="bento" className="hover:border-amber-200 dark:hover:border-amber-800">
            <CardContent className="flex flex-col items-start gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                {card.icon}
              </div>
              <CardTitle className="text-base">{card.title}</CardTitle>
              <CardDescription className="text-sm">{card.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
