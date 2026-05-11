import { Link2, Bot, Lock } from "lucide-react";
import CrystalIcon from "../CrystalIcon";
import { SyscoinUrl } from "../../shared/common";
import AliviaLogo from "../logos/AliviaLogo";
import SyscoinLogo from "../logos/SyscoinLogo";

export default function Clients() {
  return (
    <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center gap-y-6 px-6 lg:px-8">
      <h2 className="text-muted-foreground text-center text-sm font-semibold tracking-wide">
        Tecnología que respalda cada voto
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
        <div className="opacity-80 transition-opacity hover:opacity-100">
          <AliviaLogo className="h-10 w-auto" />
        </div>
        <a
          href={SyscoinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 transition-opacity hover:opacity-100"
        >
          <SyscoinLogo className="h-10 w-10" />
        </a>
        <div className="flex items-center gap-2 opacity-80">
          <CrystalIcon color="#f59e0b" size="sm"><Link2 className="h-4 w-4 stroke-[var(--color-glow)]" /></CrystalIcon>
          <span className="text-sm font-semibold text-muted-foreground">Blockchain NEVM</span>
        </div>
        <div className="flex items-center gap-2 opacity-80">
          <CrystalIcon color="#a855f7" size="sm"><Bot className="h-4 w-4 stroke-[var(--color-glow)]" /></CrystalIcon>
          <span className="text-sm font-semibold text-muted-foreground">AI Verified</span>
        </div>
        <div className="flex items-center gap-2 opacity-80">
          <CrystalIcon color="#00d2ff" size="sm"><Lock className="h-4 w-4 stroke-[var(--color-glow)]" /></CrystalIcon>
          <span className="text-sm font-semibold text-muted-foreground">E2E Encrypted</span>
        </div>
      </div>
    </div>
  );
}
