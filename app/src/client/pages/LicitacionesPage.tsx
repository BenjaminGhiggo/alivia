/**
 * Mockup Monitor de Licitaciones. Spec: 03-use-cases caso 5 (AC5.1, AC5.2).
 * MVP: 3 alertas pre-generadas con heurísticas H1-H5. Scraping SEACE real
 * post-hackathon.
 */

interface AlertaLicitacion {
  id: string;
  titulo: string;
  entidad: string;
  monto: number;
  fecha: string;
  riskFlags: string[];
  heuristicas: string[];
  estado: "alerta" | "validada" | "descartada";
}

const ALERTAS: AlertaLicitacion[] = [
  {
    id: "LIC-2026-06-03-0001",
    titulo: "Pavimentación av. Túpac Amaru - Tramo 4",
    entidad: "Municipalidad de Lima Norte",
    monto: 4_800_000,
    fecha: "2026-05-30",
    riskFlags: ["postor_unico", "vinculo_previo_en_grafo"],
    heuristicas: [
      "H1 · postor único en la convocatoria",
      "H4 · adjudicatario tiene vínculo previo en el grafo con la entidad",
    ],
    estado: "alerta",
  },
  {
    id: "LIC-2026-06-01-0002",
    titulo: "Suministro hospitalario regional",
    entidad: "Gobierno Regional Arequipa",
    monto: 2_100_000,
    fecha: "2026-05-28",
    riskFlags: ["misma_empresa_recurrente"],
    heuristicas: ["H5 · misma empresa adjudicada 4 veces en 12 meses por esta entidad"],
    estado: "validada",
  },
  {
    id: "LIC-2026-05-30-0003",
    titulo: "Servicios de consultoría legal",
    entidad: "Gobierno Regional de Junín",
    monto: 380_000,
    fecha: "2026-05-25",
    riskFlags: ["plazo_corto", "monto_anomalo"],
    heuristicas: [
      "H2 · plazo de postulación 5 días (< 7)",
      "H3 · monto en percentil 96 del histórico de esta categoría",
    ],
    estado: "alerta",
  },
];

const STATE_STYLE: Record<AlertaLicitacion["estado"], string> = {
  alerta: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30",
  validada: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30",
  descartada: "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
};

const STATE_BADGE: Record<AlertaLicitacion["estado"], string> = {
  alerta: "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100",
  validada: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
  descartada: "bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200",
};

export default function LicitacionesPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Monitor de Licitaciones
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Alertas generadas por heurísticas H1–H5 sobre licitaciones públicas.
          <span className="font-semibold"> Mockup MVP</span> — scraping SEACE en vivo
          post-hackathon.
        </p>
      </header>

      <ul className="space-y-3">
        {ALERTAS.map((a) => (
          <li key={a.id} className={`rounded-lg border p-4 ${STATE_STYLE[a.estado]}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{a.id}</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${STATE_BADGE[a.estado]}`}>
                    {a.estado}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                  {a.titulo}
                </h3>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{a.entidad}</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {a.heuristicas.map((h, i) => (
                    <li key={i} className="font-mono text-xs">· {h}</li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  S/ {a.monto.toLocaleString("es-PE")}
                </div>
                <div className="text-xs text-slate-500">{a.fecha}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
