import { useEffect, useRef, useState } from "react";
import type { ExampleItem } from "../contentSections";
import PlasmaCard from "./PlasmaCard";

const CAROUSEL_INTERVAL = 3000;
const SCROLL_TIMEOUT = 200;

export default function ExamplesCarousel({ examples }: { examples: ExampleItem[] }) {
  const [current, setCurrent] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5, rootMargin: "-200px 0px -100px 0px" },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isInView && examples.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % examples.length);
      }, CAROUSEL_INTERVAL);
    }

    const timeout = setTimeout(() => {
      if (!scrollRef.current) return;
      const target = scrollRef.current.children[current] as HTMLElement | undefined;
      if (target) {
        const containerRect = scrollRef.current.getBoundingClientRect();
        const cardRect = target.getBoundingClientRect();
        scrollRef.current.scrollTo({
          left: target.offsetLeft - scrollRef.current.offsetLeft - containerRect.width / 2 + cardRect.width / 2,
          behavior: "smooth",
        });
      }
    }, SCROLL_TIMEOUT);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timeout);
    };
  }, [isInView, examples.length, current]);

  function handleHover(index: number) {
    setCurrent(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isInView && examples.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % examples.length);
      }, CAROUSEL_INTERVAL);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 my-16 flex w-screen -translate-x-1/2 flex-col items-center"
    >
      <h2 className="text-muted-foreground mb-6 text-center font-semibold tracking-wide">
        Casos de uso
      </h2>
      <div className="w-full max-w-full overflow-hidden">
        <div
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-4 pb-10"
          ref={scrollRef}
        >
          {examples.map((example, index) => (
            <div
              key={example.name}
              className={`shrink-0 snap-center transition-opacity duration-300 ${
                index === current ? "opacity-100" : "opacity-60"
              }`}
              onMouseEnter={() => handleHover(index)}
            >
              <div className="w-[280px] sm:w-[320px] md:w-[350px]">
                <PlasmaCard
                  icon={example.icon}
                  title={example.name}
                  description={example.description}
                  accentColor={example.accent}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
