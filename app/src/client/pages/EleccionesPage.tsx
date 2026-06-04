/**
 * Mockup Observatorio Electoral. Spec: 03-use-cases caso 4 (AC4.1, AC4.2).
 * MVP: 2 actas verificadas pre-cargadas. OCR real post-hackathon.
 */

interface ActaMock {
  mesa: string;
  ubicacion: string;
  verificadoPor: string;
  fecha: string;
  estado: "coincide" | "discrepancia";
  nftTxHash: string;
  totalVotos: number;
  discrepanciaDetail?: string;
}

const ACTAS: ActaMock[] = [
  {
    mesa: "Mesa 003421",
    ubicacion: "I.E. Andrés Bello, San Martín de Porres, Lima",
    verificadoPor: "aportante-9c4e",
    fecha: "2026-06-02",
    estado: "coincide",
    nftTxHash: "0x9af3...e201",
    totalVotos: 312,
  },
  {
    mesa: "Mesa 007812",
    ubicacion: "Colegio María Auxiliadora, Cusco",
    verificadoPor: "aportante-4d11",
    fecha: "2026-06-02",
    estado: "discrepancia",
    nftTxHash: "0x1b7c...a8d0",
    totalVotos: 289,
    discrepanciaDetail: "ONPE reporta 289 votos · Acta foto muestra 297 votos en candidato A",
  },
];

export default function EleccionesPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Observatorio Electoral
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Actas verificadas por ciudadanos contra el dataset oficial ONPE. Cada verificación queda
          sellada como NFT-Acta en zkSYS Testnet. <span className="font-semibold">Mockup MVP</span>
          — OCR automático post-hackathon.
        </p>
      </header>

      <ul className="space-y-3">
        {ACTAS.map((a) => (
          <li
            key={a.mesa}
            className={`rounded-lg border bg-white p-4 dark:bg-slate-800 ${
              a.estado === "discrepancia"
                ? "border-red-300 dark:border-red-700"
                : "border-emerald-300 dark:border-emerald-700"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                    {a.mesa}
                  </span>
                  {a.estado === "coincide" ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                      ✓ coincide con ONPE
                    </span>
                  ) : (
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900 dark:text-red-200">
                      ⚠ discrepancia
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{a.ubicacion}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Verificado por {a.verificadoPor} · {a.fecha} · {a.totalVotos} votos
                </p>
                {a.discrepanciaDetail && (
                  <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                    {a.discrepanciaDetail}
                  </p>
                )}
              </div>
              <div className="text-right">
                <a
                  href="https://explorer-test-zk.syscoin.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-blue-600 underline dark:text-blue-400"
                >
                  {a.nftTxHash}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
