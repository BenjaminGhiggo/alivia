/**
 * Mockup de Cazarrecompensas. Spec: 03-use-cases caso 3 + 04-nfts §5.
 * MVP: 3 bounties pre-cargados (AC3.2). Minteo real en testnet post-MVP.
 */

interface BountyMock {
  id: string;
  targetName: string;
  description: string;
  amountTsys: number;
  daysLeft: number;
  postedBy: string;
  status: "open" | "claimed";
}

const BOUNTIES: BountyMock[] = [
  {
    id: "BNT-2026-06-04-0001",
    targetName: "Caso alv-2026-05-30-0042 (contrato municipal Lima Norte)",
    description: "Copia del contrato firmado N° 123-2026 entre Municipalidad Lima Norte y Constructora Norte S.A.C.",
    amountTsys: 100,
    daysLeft: 22,
    postedBy: "aportante-cc41",
    status: "open",
  },
  {
    id: "BNT-2026-06-02-0003",
    targetName: "Pedro Quispe Huamán",
    description: "Resolución oficial de designación como gerente, fecha y monto del cargo.",
    amountTsys: 50,
    daysLeft: 8,
    postedBy: "aportante-d2f1",
    status: "open",
  },
  {
    id: "BNT-2026-05-28-0007",
    targetName: "Suministros del Sur S.A.",
    description: "Estados financieros 2023-2025 públicos.",
    amountTsys: 75,
    daysLeft: 0,
    postedBy: "aportante-bb19",
    status: "claimed",
  },
];

export default function BountiesPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Cazarrecompensas</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          TSYS bloqueados como recompensa pública por evidencia específica. El primer aportante que
          cumpla los criterios reclama. <span className="font-semibold">Mockup MVP</span> —
          minteo on-chain post-hackathon.
        </p>
      </header>

      <ul className="space-y-3">
        {BOUNTIES.map((b) => (
          <li
            key={b.id}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{b.id}</span>
                  {b.status === "open" ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                      abierto
                    </span>
                  ) : (
                    <span className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      reclamado
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                  {b.targetName}
                </h3>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{b.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Postor: {b.postedBy} ·{" "}
                  {b.status === "open" ? `${b.daysLeft} días restantes` : "cerrado"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {b.amountTsys}
                </div>
                <div className="text-xs text-slate-500">TSYS</div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <footer className="mt-8 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
        En producción, crear bounty requiere wallet conectada con TSYS suficientes. El contrato
        bloquea los fondos hasta el claim o vencimiento (30 días por defecto).
      </footer>
    </div>
  );
}
