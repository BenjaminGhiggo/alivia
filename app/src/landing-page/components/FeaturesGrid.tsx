import type { FeatureItem } from "../contentSections";
import SectionTitle from "./SectionTitle";
import PlasmaCard from "./PlasmaCard";

interface FeaturesGridProps {
  features: FeatureItem[];
  className?: string;
}

export default function FeaturesGrid({ features, className = "" }: FeaturesGridProps) {
  return (
    <div
      className="mx-auto my-16 flex max-w-7xl flex-col gap-4 md:my-24 lg:my-40"
      id="features"
    >
      <SectionTitle
        title="Características"
        description="Todo lo que necesitas para una votación digital segura"
      />
      <div className={`mx-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mx-6 lg:mx-8 lg:grid-cols-3 ${className}`}>
        {features.map((feature) => (
          <PlasmaCard
            key={feature.name}
            icon={feature.icon}
            title={feature.name}
            description={feature.description}
            href={feature.href}
            accentColor={feature.accent}
          />
        ))}
      </div>
    </div>
  );
}
