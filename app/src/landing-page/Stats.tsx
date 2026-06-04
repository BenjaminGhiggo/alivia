import SectionTitle from "./components/SectionTitle";

const stats = [
  { label: "Comparable Sayari Labs", value: "USD $29M" },
  { label: "Nodos sembrados", value: "30+" },
  { label: "NFT-Acta en Tanenbaum", value: "1" },
  { label: "Score de corroboración", value: "R1–R10" },
];

export default function StatsSection() {
  return (
    <div className="mx-auto my-12 max-w-7xl px-4 sm:my-16 sm:px-6 md:my-24 lg:px-8">
      <SectionTitle
        title="En cifras"
        description="El mercado de inteligencia de riesgo en LatAm está servido. Alivia construye desde la ciudadanía lo que las plataformas tradicionales no cubren."
      />
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-4 sm:mt-12 sm:gap-6 md:mt-16 md:grid-cols-4 md:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              {stat.value}
            </span>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
