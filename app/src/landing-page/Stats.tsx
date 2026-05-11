import { useEffect, useRef, useState } from "react";
import SectionTitle from "./components/SectionTitle";

const stats = [
  { label: "Votos procesados", value: "—" },
  { label: "Uptime", value: "—" },
  { label: "Costo por voto", value: "—" },
  { label: "Tiempo promedio", value: "—" },
];

export default function StatsSection() {
  return (
    <div className="mx-auto my-24 max-w-7xl px-6 lg:px-8">
      <SectionTitle
        title="Próximamente"
        description="Estadísticas en vivo estarán disponibles cuando la plataforma esté operativa"
      />
      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
            <span className="text-4xl font-bold tracking-tight text-muted-foreground sm:text-5xl">
              {stat.value}
            </span>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
