import { ContactUrl } from "../shared/common";

export default function CTA() {
  return (
    <div className="mx-auto my-16 max-w-7xl px-4 sm:my-24 sm:px-6 md:my-32 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 px-4 py-10 text-center shadow-2xl sm:px-10 sm:py-14 md:px-16 md:py-16">
        <div className="absolute -top-24 right-0 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
          ¿Listo para transformar tus procesos de votación?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:mt-4 sm:text-base md:text-lg">
          Sin compromiso. Configuración en 24 horas.
        </p>
        <div className="mt-6 sm:mt-8">
          <a
            href={ContactUrl}
            className="inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-50 sm:px-8 sm:py-3"
          >
            Solicitar Demo Gratuita
          </a>
        </div>
      </div>
    </div>
  );
}
