export default function CTA() {
  return (
    <div className="mx-auto my-16 max-w-7xl px-4 sm:my-24 sm:px-6 md:my-32 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 px-4 py-10 text-center shadow-2xl sm:px-10 sm:py-14 md:px-16 md:py-16">
        <div className="absolute -top-24 right-0 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 -z-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
          ¿Viste algo que no debería pasar?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:mt-4 sm:text-base md:text-lg">
          Háblale a Alivia en Telegram. En minutos tu pista queda conectada al grafo público y sellada en Syscoin.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-x-4">
          <a
            href="https://t.me/alivia_sbs_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-50 sm:px-8 sm:py-3"
          >
            Hablar con Alivia en Telegram
          </a>
          <a
            href="/grafo"
            className="inline-block rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white/10 sm:px-8 sm:py-3"
          >
            Ver el grafo en vivo
          </a>
        </div>
      </div>
    </div>
  );
}
