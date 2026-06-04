import { FileCheck, MessageCircle, Link, SearchCheck } from "lucide-react";
import CrystalIcon from "./CrystalIcon";
import HighlightedFeature from "./components/HighlightedFeature";

const pills = [
  { icon: <MessageCircle className="h-4 w-4" />, label: "Aporte recibido", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { icon: <FileCheck className="h-4 w-4" />, label: "Estructurado por IA", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { icon: <Link className="h-4 w-4" />, label: "Conectado al grafo", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { icon: <SearchCheck className="h-4 w-4" />, label: "NFT-Acta en Syscoin", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
];

export default function AIReady() {
  return (
    <HighlightedFeature
      name="Pista ciudadana → evidencia pública"
      description="Cada aporte que recibe Alivia se estructura, se conecta con el grafo existente y se sella como NFT-Acta en Syscoin Tanenbaum. Cualquier persona puede consultar el caso citando el hash de la transacción. Sin intermediarios, sin filtros, sin posibilidad de borrado."
      highlightedComponent={<BlockchainVisual />}
      direction="row-reverse"
    />
  );
}

const BlockchainVisual = () => {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-purple-50 p-4 sm:gap-4 sm:p-6 md:p-8 dark:border-amber-800 dark:from-amber-950 dark:to-purple-950">
      <CrystalIcon color="#f59e0b" size="lg"><FileCheck className="h-7 w-7 stroke-[var(--color-glow)]" /></CrystalIcon>
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
        Flujo de un aporte en ALIVIA: de la pista ciudadana al NFT-Acta en blockchain
      </p>
    </div>
  );
};
