import { Link } from "react-router";

/**
 * Sección del landing que linkea las páginas del producto MVP.
 * Spec: 06-demo-acceptance §2 minuto 3:30 ("tour de casos de uso").
 * OCP: este componente se agrega al LandingPage sin modificar las
 * secciones existentes.
 */

interface ProductLink {
  to: string;
  title: string;
  description: string;
  status: "live" | "mockup";
  emoji: string;
}

const PRODUCT_LINKS: ProductLink[] = [
  {
    to: "/grafo",
    title: "Grafo público",
    description:
      "Mapa vivo de personas, cargos, empresas y vínculos. Crece con cada aporte ciudadano.",
    status: "live",
    emoji: "🕸️",
  },
  {
    to: "/casos",
    title: "Casos publicados",
    description:
      "Feed de aportes con score de corroboración y NFT-Acta en Syscoin.",
    status: "live",
    emoji: "📋",
  },
  {
    to: "/chat",
    title: "Conversa con Alivia",
    description:
      "Reporta o consulta directo desde la web. También en Telegram @alivia_sbs_bot.",
    status: "live",
    emoji: "💬",
  },
  {
    to: "/bounties",
    title: "Cazarrecompensas",
    description: "TSYS bloqueados por evidencia específica.",
    status: "mockup",
    emoji: "🎯",
  },
  {
    to: "/elecciones",
    title: "Observatorio Electoral",
    description: "Actas verificadas mesa por mesa, discrepancias visibles.",
    status: "mockup",
    emoji: "🗳️",
  },
  {
    to: "/licitaciones",
    title: "Monitor de Licitaciones",
    description: "Alertas automáticas por heurísticas de riesgo H1–H5.",
    status: "mockup",
    emoji: "📊",
  },
];

export default function AliviaProductSections() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8" id="producto">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-base font-semibold leading-7 text-blue-600">El producto</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Tres canales. Un agente. Un grafo público.
        </p>
        <p className="mt-4 text-lg text-muted-foreground">
          Telegram, Discord y la web invocan a la misma Alivia. Cada aporte cierra como
          NFT-Acta en Syscoin (Tanenbaum testnet).
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to as any}
            className="group relative rounded-2xl border border-border bg-card p-6 transition hover:border-blue-500 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-3xl">{link.emoji}</span>
              {link.status === "live" ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                  en vivo
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                  mockup
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600">
              {link.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{link.description}</p>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
              Entrar →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
