import { type ReactNode } from "react";

interface CrystalIconProps {
  children: ReactNode;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

export default function CrystalIcon({ children, color = "#00d2ff", size = "md" }: CrystalIconProps) {
  return (
    <div
      className="group relative flex items-center justify-center"
      style={{ "--color-glow": color, "--color-glow-soft": `${color}33` } as React.CSSProperties}
    >
      <div
        className={`${sizeClasses[size]} rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] backdrop-blur-lg border flex items-center justify-center transition-all duration-500
          bg-gradient-to-br from-white/80 to-white/40 border-black/5 shadow-[inset_0_0_15px_rgba(255,255,255,0.9),0_10px_25px_rgba(0,0,0,0.05)]
          dark:bg-gradient-to-br dark:from-white/5 dark:to-white/[0.01] dark:border-white/10 dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)]
          hover:rounded-full hover:rotate-[15deg] hover:border-[var(--color-glow)] hover:shadow-[0_0_30px_var(--color-glow-soft)]`}
      >
        <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] rounded-full bg-gradient-to-br from-white/60 to-transparent dark:from-white/40 pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
