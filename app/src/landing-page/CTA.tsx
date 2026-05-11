import { ContactUrl } from "../shared/common";

export default function CTA() {
  return (
    <div className="mx-auto my-24 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-purple-700 px-4 py-14 text-center shadow-2xl sm:px-10 sm:py-16 md:px-16 md:py-20">
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-40 w-40 animate-pulse rounded-full bg-amber-300/10 blur-2xl" style={{ animationDuration: "4s" }} />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-32 w-32 animate-pulse rounded-full bg-white/5 blur-2xl" style={{ animationDuration: "3s" }} />
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
          ¿Listo para transformar tus procesos de votación?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:mt-4 sm:text-base md:text-lg">
          Sin compromiso. Configuración en 24 horas.
        </p>
        <div className="mt-6 sm:mt-8">
          <a
            href={ContactUrl}
            className="inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-amber-50 hover:shadow-xl sm:px-8 sm:py-3"
          >
            Solicitar Demo Gratuita
          </a>
        </div>
      </div>
    </div>
  );
}
