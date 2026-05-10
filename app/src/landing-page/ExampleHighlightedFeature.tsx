import { ShieldCheck } from "lucide-react";
import HighlightedFeature from "./components/HighlightedFeature";

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
    <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-purple-50 p-8 dark:border-amber-800 dark:from-amber-950 dark:to-purple-950">
      <ShieldCheck className="h-16 w-16 text-amber-500" />
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          🗳️ Voto emitido
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
          🔒 Cifrado E2E
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
          🔗 Bloque #1,245,892
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded-full bg-green-100 px-3 py-1 text-green-700 dark:bg-green-900 dark:text-green-300">
          ✅ Verificado
        </span>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Flujo de un voto en ALIVIA: desde la emisión hasta la verificación en blockchain
      </p>
    </div>
  );
};
