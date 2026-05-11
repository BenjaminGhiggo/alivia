export default function AliviaLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        className={className}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="90" className="stroke-amber-500" strokeWidth="4" fill="none" />
        <path
          d="M100 40c-8 0-14.5 6.5-14.5 14.5v14.5H71c-7.5 0-13.5 6-13.5 13.5s6 13.5 13.5 13.5h14.5V160c0 8 6.5 14.5 14.5 14.5s14.5-6.5 14.5-14.5V96h14.5c7.5 0 13.5-6 13.5-13.5S136 69 128.5 69H114V54.5c0-8-6.5-14.5-14.5-14.5z"
          className="fill-amber-500"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight text-foreground">
        ALIVIA
      </span>
    </div>
  );
}
