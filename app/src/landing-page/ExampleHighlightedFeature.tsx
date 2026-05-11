import { ShieldCheck, Vote, Lock, Link2, CheckCircle2 } from "lucide-react";
import CrystalIcon from "./CrystalIcon";
import HighlightedFeature from "./components/HighlightedFeature";

const pills = [
  { icon: <Vote className="h-4 w-4" />, label: "Voto emitido", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { icon: <Lock className="h-4 w-4" />, label: "Cifrado E2E", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { icon: <Link2 className="h-4 w-4" />, label: "Bloque #1,245,892", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { icon: <CheckCircle2 className="h-4 w-4" />, label: "Verificado", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
];

export default function AIReady() {
  return (
    <HighlightedFeature
      name="Votación transparente y auditable"
      description="Cada voto emitido en ALIVIA se registra como una transacción inmutable en Syscoin NEVM. Cualquier ciudadano puede verificar los resultados en el explorador de bloques sin necesidad de permisos especiales. La combinación de cifrado de extremo a extremo y verificación biométrica con IA garantiza un voto por persona."
      highlightedComponent={<BlockchainVisual />}
      direction="row-reverse"
    />
  );
}

const BlockchainVisual = () => {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-purple-50 p-4 sm:gap-4 sm:p-6 md:p-8 dark:border-amber-800 dark:from-amber-950 dark:to-purple-950">
      <CrystalIcon color="#f59e0b" size="lg"><ShieldCheck className="h-7 w-7 stroke-[var(--color-glow)]" /></CrystalIcon>
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
        {pills.map((pill, i) => (
          <span key={pill.label} className="contents">
            {i > 0 && <span className="text-muted-foreground">→</span>}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 sm:gap-1.5 sm:px-3 sm:py-1 ${pill.color}`}>
              {pill.icon}
              {pill.label}
            </span>
          </span>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Flujo de un voto en ALIVIA: desde la emisión hasta la verificación en blockchain
      </p>
    </div>
  );
};
