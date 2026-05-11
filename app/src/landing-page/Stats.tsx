import { useEffect, useRef, useState } from "react";
import { Vote, Timer, DollarSign, ShieldCheck } from "lucide-react";
import SectionTitle from "./components/SectionTitle";

const stats = [
  { label: "Votos procesados", value: 100000, suffix: "+", icon: Vote, color: "text-amber-500" },
  { label: "Uptime", value: 99.99, suffix: "%", icon: ShieldCheck, color: "text-emerald-500", decimals: 2 },
  { label: "Costo por voto", value: 0.01, prefix: "< $", icon: DollarSign, color: "text-cyan-500", decimals: 2 },
  { label: "Tiempo promedio", value: 2, suffix: " min", icon: Timer, color: "text-purple-500" },
];

function AnimatedCounter({ value, suffix, prefix, decimals }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const duration = 1800;
        const start = performance.now();
        function tick(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(+(eased * value).toFixed(decimals ?? 0));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, decimals]);

  return (
    <span ref={ref}>
      {prefix}{display.toLocaleString("en-US", { minimumFractionDigits: decimals ?? 0, maximumFractionDigits: decimals ?? 0 })}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <div className="mx-auto my-24 max-w-7xl px-6 lg:px-8" id="stats">
      <SectionTitle
        title="ALIVIA en números"
        description="Métricas que respaldan nuestra plataforma"
      />
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} decimals={stat.decimals} />
            </span>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
