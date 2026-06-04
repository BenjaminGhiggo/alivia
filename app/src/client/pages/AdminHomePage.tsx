import { Network, FileText, Key } from "lucide-react";
import { Link } from "react-router";

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground">Panel de administración</h1>
        <p className="mt-2 text-muted-foreground">
          Emisión de NFT-Llave, estadísticas del grafo y casos publicados
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <Link
          to="/admin/llaves"
          className="group rounded-2xl border border-border bg-card p-6 transition hover:border-amber-500 hover:shadow-lg"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
            <Key className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground group-hover:text-amber-600">Emitir NFT-Llave</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Genera y emite una NFT-Llave para clientes B2B con acceso anual al grafo completo.
          </p>
        </Link>

        <Link
          to="/grafo"
          className="group rounded-2xl border border-border bg-card p-6 transition hover:border-purple-500 hover:shadow-lg"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            <Network className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground group-hover:text-purple-600">Estadísticas del grafo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Visualiza el grafo público de personas, cargos, empresas y vínculos.
          </p>
        </Link>

        <Link
          to="/casos"
          className="group rounded-2xl border border-border bg-card p-6 transition hover:border-blue-500 hover:shadow-lg"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground group-hover:text-blue-600">Casos publicados</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisa los casos cerrados con NFT-Acta, scores de corroboración y evidencia.
          </p>
        </Link>
      </div>
    </div>
  );
}
