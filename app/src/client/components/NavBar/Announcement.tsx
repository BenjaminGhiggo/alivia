export function Announcement() {
  return (
    <div className="from-accent to-secondary text-primary-foreground relative flex w-full items-center justify-center gap-3 bg-linear-to-r p-3 text-center font-semibold">
      <span className="hidden lg:block">
        🗳️ Transforma tus procesos de votación con Blockchain + IA
      </span>
      <div className="bg-primary-foreground/20 hidden w-0.5 self-stretch lg:block"></div>
      <span className="bg-background/20 rounded-full px-2.5 py-1 text-xs tracking-wider">
        Sin compromiso · Configuración en 24h
      </span>
    </div>
  );
}
