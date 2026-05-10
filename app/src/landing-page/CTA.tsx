import { ContactUrl } from "../shared/common";

export default function CTA() {
  return (
    <div className="mx-auto my-32 max-w-7xl px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 px-6 py-16 text-center shadow-2xl sm:px-16">
        <div className="absolute -top-24 right-0 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          ¿Listo para transformar tus procesos de votación?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Sin compromiso. Configuración en 24 horas.
        </p>
        <div className="mt-8 flex items-center justify-center gap-x-4">
          <a
            href={ContactUrl}
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-50 transition-colors"
          >
            Solicitar Demo Gratuita
          </a>
        </div>
      </div>
    </div>
  );
}
