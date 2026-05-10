import AliviaLogo from "../logos/AliviaLogo";
import SyscoinLogo from "../logos/SyscoinLogo";

export default function Clients() {
  return (
    <div className="items-between mx-auto mt-12 flex max-w-7xl flex-col gap-y-6 px-6 lg:px-8">
      <h2 className="text-muted-foreground mb-6 text-center font-semibold tracking-wide">
        Tecnología
      </h2>

      <div className="mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:gap-x-10 sm:gap-y-14 md:grid-cols-3 lg:mx-0 lg:max-w-none">
        {[
          <AliviaLogo />,
          <SyscoinLogo />,
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl">✅</span>
            <span className="text-xs font-semibold text-muted-foreground">AI Verified</span>
          </div>,
        ].map((logo, index) => (
          <div
            key={index}
            className="col-span-1 flex max-h-12 w-full justify-center object-contain opacity-80 transition-opacity hover:opacity-100"
          >
            {logo}
          </div>
        ))}
      </div>
    </div>
  );
}
