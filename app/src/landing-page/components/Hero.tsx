import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../../client/components/ui/button";

export default function Hero() {
  return (
    <div className="relative w-full pt-14" id="hero">
      <TopGradient />
      <BottomGradient />
      <div className="md:p-24">
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="lg:mb-18 mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Votación digital sobre Blockchain
            </div>
            <h1 className="text-foreground text-5xl font-bold sm:text-6xl">
              El futuro del voto digital,{" "}
              <span className="text-gradient-primary">seguro y transparente</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8">
              Plataforma de votación digital con Blockchain e Inteligencia Artificial.
              Cada voto es inmutable, verificable y auditable en tiempo real.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="default" asChild>
                <a href="/contact">
                  Solicitar Demo <span aria-hidden="true">→</span>
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">
                  Ver cómo funciona
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-14 flow-root sm:mt-14">
            <div className="m-2 flex justify-center rounded-xl md:flex lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="flex h-80 w-full max-w-4xl items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-purple-100 dark:from-amber-950 dark:to-purple-950">
                <div className="text-center">
                  <span className="text-6xl">🗳️</span>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Tu imagen de ALIVIA aquí
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className="absolute right-0 top-0 -z-10 w-full transform-gpu overflow-hidden blur-3xl sm:top-0"
      aria-hidden="true"
    >
      <div
        className="aspect-1020/880 w-280 flex-none bg-linear-to-tr from-amber-400 to-purple-300 opacity-10 sm:right-1/4 sm:translate-x-1/2 dark:hidden"
        style={{
          clipPath:
            "polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)",
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className="absolute inset-x-0 top-[calc(100%-40rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-65rem)]"
      aria-hidden="true"
    >
      <div
        className="relative aspect-1020/880 w-360 bg-linear-to-br from-amber-400 to-purple-300 opacity-10 sm:-left-3/4 sm:translate-x-1/4 dark:hidden"
        style={{
          clipPath: "ellipse(80% 30% at 80% 50%)",
        }}
      />
    </div>
  );
}
