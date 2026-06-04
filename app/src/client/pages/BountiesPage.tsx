import { Link } from "react-router";
import { useQuery } from "wasp/client/operations";
import { getBounties } from "wasp/client/operations";

/**
 * Lista de Bounties activos. Spec: 03-use-cases caso 3 + 04-nfts §5.
 * Carga real desde DB. Si está vacío muestra CTA a /bounties/new.
 */

const STATE_BADGE: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  claimed: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  expired: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
};

export default function BountiesPage() {
  const { data: bounties, isLoading, error } = useQuery(getBounties);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Cazarrecompensas</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            TSYS bloqueados en Syscoin como recompensa por evidencia específica.
            El smart contract custodia hasta que Alivia valide el claim o expire.
          </p>
        </div>
        <Link
          to={"/bounties/new" as any}
          className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
        >
          + Nuevo bounty
        </Link>
      </header>

      {error && <div className="rounded bg-red-50 p-4 text-red-700">Error: {String(error)}</div>}
      {isLoading && <div className="text-slate-500">Cargando...</div>}

      {bounties && bounties.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-slate-500">Aún no hay bounties activos.</p>
          <Link
            to={"/bounties/new" as any}
            className="mt-3 inline-block text-blue-600 underline dark:text-blue-400"
          >
            Sé el primero en publicar uno →
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {bounties?.map((b) => (
          <li
            key={b.id}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{b.id}</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${STATE_BADGE[b.status] ?? ""}`}>
                    {b.status}
                  </span>
                  {b.nftBountyTokenId && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      NFT #{b.nftBountyTokenId}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{b.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Caso objetivo: <span className="font-mono">{b.targetNodeId}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">Postor: {b.postedBy}</p>
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
    </div>
  );
}
