import { ExternalLink, Cpu, Shield, Zap, FileCheck, Lock, FileCode, Database, Search } from "lucide-react";
import CrystalIcon from "./CrystalIcon";
import SectionTitle from "./components/SectionTitle";
import { Card, CardContent, CardTitle, CardDescription } from "../client/components/ui/card";

interface TechSpec {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const iconColors: Record<string, string> = {
  zap: "#f59e0b",
  cpu: "#00d2ff",
  shield: "#a855f7",
};

const techSpecs: TechSpec[] = [
  { label: "Transacciones por segundo", value: "1,000+ TPS", icon: <CrystalIcon color={iconColors.zap} size="sm"><Zap className="h-4 w-4 stroke-[var(--color-glow)]" /></CrystalIcon> },
  { label: "Costo por transacción", value: "< $0.01 USD", icon: <CrystalIcon color={iconColors.cpu} size="sm"><Cpu className="h-4 w-4 stroke-[var(--color-glow)]" /></CrystalIcon> },
  { label: "Finality time", value: "~5 segundos", icon: <CrystalIcon color={iconColors.shield} size="sm"><Shield className="h-4 w-4 stroke-[var(--color-glow)]" /></CrystalIcon> },
];

const flowSteps = [
  { label: "Voto", icon: FileCheck, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/50", border: "border-amber-200 dark:border-amber-800" },
  { label: "Cifrado", icon: Lock, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/50", border: "border-purple-200 dark:border-purple-800" },
  { label: "Smart Contract", icon: FileCode, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/50", border: "border-cyan-200 dark:border-cyan-800" },
  { label: "Bloque", icon: Database, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/50", border: "border-emerald-200 dark:border-emerald-800" },
  { label: "Verificación", icon: Search, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/50", border: "border-rose-200 dark:border-rose-800" },
];

export default function BlockchainSection() {
  return (
    <div id="blockchain" className="mx-auto my-16 max-w-7xl px-4 sm:my-24 sm:px-6 md:my-32 lg:px-8">
      <SectionTitle
        title="Tecnología Blockchain"
        description="ALIVIA está construida sobre Syscoin NEVM — la seguridad de Bitcoin con contratos inteligentes compatibles con Ethereum"
      />
      <div className="mt-8 grid gap-6 sm:mt-12 sm:gap-8 md:mt-16 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-bold text-foreground sm:mb-6 sm:text-2xl">¿Por qué Syscoin?</h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <Shield className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <strong className="text-foreground">Merge-mining con Bitcoin</strong>
                <p className="text-sm text-muted-foreground">
                  Syscoin hereda la seguridad de la red Bitcoin, la más grande y segura del mundo.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Zap className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <strong className="text-foreground">Bajo costo, alta velocidad</strong>
                <p className="text-sm text-muted-foreground">
                  Transacciones por centavos con confirmación en segundos, ideal para procesos electorales masivos.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Cpu className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <strong className="text-foreground">Compatibilidad EVM</strong>
                <p className="text-sm text-muted-foreground">
                  Contratos inteligentes compatibles con Ethereum (NEVM) para máxima flexibilidad y herramientas existentes.
                </p>
              </div>
            </li>
          </ul>
          <a
            href="https://syscoin.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400"
          >
            Explorar Syscoin <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-bold text-foreground sm:mb-6 sm:text-2xl">Flujo de la votación</h3>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 rounded-xl border ${step.border} ${step.bg} px-4 py-3 transition-all duration-300 hover:scale-105 hover:shadow-md`}>
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                  <span className={`text-sm font-semibold ${step.color}`}>{step.label}</span>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="hidden h-0.5 w-6 bg-gradient-to-r from-foreground/20 to-foreground/5 sm:block" />
                )}
                {i < flowSteps.length - 1 && (
                  <div className="text-muted-foreground sm:hidden">↓</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:mt-8">
            {techSpecs.map((spec) => (
              <Card key={spec.label} variant="bento">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="text-amber-500">{spec.icon}</div>
                  <CardDescription>{spec.label}</CardDescription>
                  <CardTitle className="text-sm">{spec.value}</CardTitle>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
