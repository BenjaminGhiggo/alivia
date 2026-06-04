import { Link, useParams } from "react-router";
import { useQuery } from "wasp/client/operations";
import { getAportante } from "wasp/client/operations";

/**
 * Perfil público del aportante (seudónimo). Muestra:
 * - Level + label (Testigo / Vigilante / Investigador / Cronista / Guardiana)
 * - Estadísticas
 * - NFT-Aportante soulbound (link al contrato)
 * - Últimos aportes
 *
 * Spec: 04-nfts §4.
 */

const APORTANTE_CONTRACT =
  (typeof window !== "undefined" && (window as any).ALIVIA_APORTANTE_CONTRACT) ||
  "0x9ea09d2e384ee379f4ad8eedbb0b58048fcc2605";
const EXPLORER = "https://tanenbaum.io";

const LEVEL_COLOR = ["bg-slate-400", "bg-amber-600", "bg-slate-300", "bg-yellow-500", "bg-yellow-300"];
const LEVEL_RING = ["ring-slate-300", "ring-amber-400", "ring-slate-200", "ring-yellow-400", "ring-yellow-200"];

export default function AportantePage() {
  const { pseudonym } = useParams();
  const { data: a, isLoading, error } = useQuery(getAportante, { pseudonym: pseudonym ?? "" });

  if (error) return <div className="p-8 text-red-500">Error: {String(error)}</div>;
  if (isLoading) return <div className="p-8 text-slate-500">Cargando...</div>;
  if (!a) return <div className="p-8 text-slate-500">Aportante no encontrado.</div>;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <header className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${LEVEL_COLOR[a.level]} text-xl font-bold text-slate-900 ring-4 ${LEVEL_RING[a.level]}`}
          >
            {a.levelLabel.charAt(0)}
          </div>
          <div>
            <h1 className="font-mono text-xl text-slate-700 dark:text-slate-200">{a.pseudonym}</h1>
            <p className="text-sm text-slate-500">
              {a.levelLabel} · activo desde {new Date(a.firstSeenAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-3 gap-4">
        <Stat label="Aportes totales" value={a.totalContributions} />
        <Stat label="Corroborados" value={a.totalCorroborated} />
        <Stat
          label="Trust score"
          value={a.trustScore.toFixed(2)}
        />
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
          NFT-Aportante (soulbound)
        </h2>
        {a.soulboundTokenId ? (
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="font-mono text-sm">Token ID: {a.soulboundTokenId}</div>
            <div className="mt-2 text-sm">
              <a
                href={`${EXPLORER}/token/${APORTANTE_CONTRACT}?a=${a.soulboundTokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                Ver en explorer Tanenbaum
              </a>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              No transferible (soulbound). Acumula reputación con cada aporte corroborado.
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
            Aún se está minteando en Syscoin... vuelve en unos segundos.
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Últimos aportes</h2>
        {a.recentCases.length === 0 ? (
          <div className="text-sm text-slate-500">Aún no hay aportes registrados.</div>
        ) : (
          <ul className="space-y-2">
            {a.recentCases.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/casos/${c.id}` as any}
                  className="block rounded border border-slate-200 p-3 text-sm hover:border-slate-400 dark:border-slate-700"
                >
                  <span className="font-mono">{c.id}</span> ·{" "}
                  <span>score {c.corroborationScore.toFixed(2)}</span> ·{" "}
                  <span>{c.status}</span> ·{" "}
                  <span className="text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
