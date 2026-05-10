import { useEffect, useRef, useState } from "react";
import SectionTitle from "./components/SectionTitle";

interface Stat {
  label: string;
  value: string;
  suffix: string;
}

const stats: Stat[] = [
  { label: "Votos procesados", value: "100000", suffix: "+" },
  { label: "Uptime", value: "99.99", suffix: "%" },
  { label: "Costo por voto", value: "< $0.01", suffix: " USD" },
  { label: "Tiempo promedio", value: "< 2", suffix: " min" },
];

function AnimatedCounter({ value, suffix, enabled }: { value: string; suffix: string; enabled: boolean }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!enabled) return;
    const target = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(target)) {
      setDisplay(value);
      return;
    }
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(Math.floor(current).toString());
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [enabled, value]);

  return (
    <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
      {display}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto my-24 max-w-7xl px-6 lg:px-8">
      <SectionTitle
        title="ALIVIA en números"
        description="Métricas que respaldan nuestra plataforma"
      />
      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} enabled={isVisible} />
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
