import { useRef, type ReactNode, type MouseEvent } from "react";

interface PlasmaCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  accentColor?: string;
  className?: string;
}

export default function PlasmaCard({
  icon,
  title,
  description,
  href,
  accentColor = "from-cyan-400 to-purple-500",
  className = "",
}: PlasmaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  function handleMove(e: MouseEvent) {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glare.style.setProperty("--x", `${x}px`);
    glare.style.setProperty("--y", `${y}px`);
  }

  function handleLeave() {
    const glare = glareRef.current;
    if (glare) {
      glare.style.setProperty("--x", "50%");
      glare.style.setProperty("--y", "50%");
    }
  }

  const content = (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`group relative overflow-hidden rounded-2xl p-[1px] transition-transform duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Animated border gradient */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${accentColor} opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-30`} />
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${accentColor} opacity-5 transition-opacity duration-300 group-hover:opacity-20 dark:opacity-10 dark:group-hover:opacity-30`} />

      {/* Inner card */}
      <div className="relative z-10 flex h-full flex-col rounded-2xl bg-card p-7">
        {/* Glare effect */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
          style={{
            background: "radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Icon sphere */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted/30 transition-transform duration-500 group-hover:scale-110 group-hover:border-amber-400/50">
          {icon}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-extrabold tracking-tight text-foreground">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
