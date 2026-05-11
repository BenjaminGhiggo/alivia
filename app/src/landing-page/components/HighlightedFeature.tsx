import { cn } from "../../client/utils";

interface FeatureProps {
  name: string;
  description: string | React.ReactNode;
  direction?: "row" | "row-reverse";
  highlightedComponent: React.ReactNode;
  tilt?: "left" | "right";
}

/**
 * A component that highlights a feature with a description and a highlighted component.
 * Shows text description on one side, and whatever component you want to show on the other side to demonstrate the functionality.
 */
const HighlightedFeature = ({
  name,
  description,
  direction = "row",
  highlightedComponent,
  tilt,
}: FeatureProps) => {
  const tiltToClass: Record<Required<FeatureProps>["tilt"], string> = {
    left: "rotate-1",
    right: "-rotate-1",
  };

  return (
    <div
      className={cn(
        "my-16 mx-auto flex max-w-6xl flex-col items-center justify-between gap-x-8 gap-y-6 px-4 transition-all duration-300 ease-in-out sm:my-24 sm:gap-y-8 md:my-32 md:gap-x-16 md:px-8 lg:my-50 lg:gap-x-20 lg:gap-y-10",
        direction === "row" ? "md:flex-row" : "md:flex-row-reverse",
      )}
    >
      <div className="flex-1 flex-col">
        <h2 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">{name}</h2>
        {typeof description === "string" ? (
          <p className="text-muted-foreground">{description}</p>
        ) : (
          description
        )}
      </div>
      <div
        className={cn(
          "my-10 flex w-full flex-1 items-center justify-center transition-transform duration-300 ease-in-out",
          tilt && tiltToClass[tilt],
        )}
      >
        {highlightedComponent}
      </div>
    </div>
  );
};

export default HighlightedFeature;
