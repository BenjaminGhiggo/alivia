import { Link } from "react-router";
import { useQuery } from "wasp/client/operations";
import { getRecentCases } from "wasp/client/operations";

/**
 * Feed de casos publicados. Spec: 03-use-cases caso 2 (consulta) + 05 §3.8.
 */

const SCORE_COLOR = (score: number) =>
  score >= 0.7 ? "bg-red-500" : score >= 0.4 ? "bg-amber-500" : "bg-slate-400";

export default function CasosPage() {
  const { data: cases, isLoading, error } = useQuery(getRecentCases, { limit: 30 });

  if (error) return <div className="p-8 text-red-500">Error: {String(error)}</div>;

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Casos publicados
      </h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400">
        Aportes ciudadanos con corroboración mínima 0.40. Cada caso queda anclado como NFT-Acta en
        zkSYS Testnet.
      </p>

      {isLoading && <div className="text-slate-500">Cargando...</div>}

      {cases && cases.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
          Todavía no hay casos publicados.
        </div>
      )}

      <ul className="space-y-3">
        {cases?.map((c) => (
          <li key={c.id}>
            <Link
              to={`/casos/${c.id}` as any}
              className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{c.id}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {c.caseType}
                    </span>
                    {c.nftTokenId && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                        NFT #{c.nftTokenId}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm text-slate-700 dark:text-slate-300">
                    {Array.isArray(c.facts) && c.facts.length > 0
                      ? String(c.facts[0]).slice(0, 140)
                      : "(sin hechos)"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Aportante: {c.reporterPseudonym} ·{" "}
                    {c.publishedAt ? new Date(c.publishedAt).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${SCORE_COLOR(c.corroborationScore)}`}
                    />
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                      {c.corroborationScore.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
