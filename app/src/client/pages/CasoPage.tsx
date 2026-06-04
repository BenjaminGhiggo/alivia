import { useParams } from "react-router";
import { useQuery } from "wasp/client/operations";
import { getCaseById } from "wasp/client/operations";

/**
 * Detalle de un caso. Muestra evidencia, score, vínculos detectados y el
 * link al explorer del NFT-Acta (cuando esté minteado).
 * Spec: 03-use-cases caso 2 + 04-nfts §3.5.
 */

const EXPLORER_URL =
  (typeof window !== "undefined" && (window as any).ZKSYS_EXPLORER_URL) ||
  "https://explorer-test-zk.syscoin.org";

export default function CasoPage() {
  const { id } = useParams();
  const { data: caso, isLoading, error } = useQuery(getCaseById, { id: id ?? "" });

  if (error) return <div className="p-8 text-red-500">Error: {String(error)}</div>;
  if (isLoading) return <div className="p-8 text-slate-500">Cargando...</div>;
  if (!caso) return <div className="p-8 text-slate-500">Caso no encontrado.</div>;

  const facts = Array.isArray(caso.facts) ? (caso.facts as string[]) : [];
  const evidence = Array.isArray(caso.evidence)
    ? (caso.evidence as { type: string; value: string }[])
    : [];
  const connections = Array.isArray(caso.graphConnections)
    ? (caso.graphConnections as { node_id: string; relation: string; confidence: number }[])
    : [];

  return (
    <div className="mx-auto max-w-3xl p-8">
      <header className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-700">
        <div className="font-mono text-sm text-slate-500">{caso.id}</div>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Aporte tipo {caso.caseType}
        </h1>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
          <span>Aportante: <span className="font-mono">{caso.reporterPseudonym}</span></span>
          <span>Score: <span className="font-mono">{caso.corroborationScore.toFixed(2)}</span></span>
          <span>Estado: {caso.status}</span>
          {caso.publishedAt && (
            <span>Publicado: {new Date(caso.publishedAt).toLocaleDateString()}</span>
          )}
        </div>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Hechos</h2>
        <ul className="list-disc space-y-1 pl-6 text-slate-700 dark:text-slate-300">
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </section>

      {evidence.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Evidencias</h2>
          <ul className="space-y-2">
            {evidence.map((e, i) => (
              <li key={i} className="rounded border border-slate-200 p-2 text-sm dark:border-slate-700">
                <span className="font-mono text-xs text-slate-500">{e.type}</span>
                <div className="break-all text-slate-700 dark:text-slate-300">{e.value}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {connections.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
            Vínculos en el grafo
          </h2>
          <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
            {connections.map((c, i) => (
              <li key={i} className="font-mono">
                · {c.relation} → {c.node_id} (conf {c.confidence.toFixed(2)})
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-700">
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">NFT-Acta</h2>
        {caso.nftTokenId && caso.nftTxHash ? (
          <div className="space-y-1 text-sm">
            <div>Token ID: <span className="font-mono">{caso.nftTokenId}</span></div>
            <div className="break-all">
              Tx:{" "}
              <a
                href={`${EXPLORER_URL.replace(/\/$/, "")}/tx/${caso.nftTxHash}`}
                className="text-blue-600 underline dark:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                {caso.nftTxHash}
              </a>
            </div>
            <div className="break-all text-xs text-slate-500">
              Evidence hash: <span className="font-mono">{caso.evidenceHash}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Pendiente de minteo en zkSYS Testnet.</div>
        )}
      </section>
    </div>
  );
}
