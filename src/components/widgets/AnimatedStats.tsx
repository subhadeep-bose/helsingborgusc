import { useEffect, useRef, useState } from "react";

interface AnimatedStatsProps {
  stats: { label: string; value: number; suffix?: string }[];
}

const AnimatedStats = ({ stats }: AnimatedStatsProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setCounts(stats.map((s) => s.value));
      return;
    }

    const duration = 2000;
    const fps = 60;
    const frames = duration / (1000 / fps);
    let frame = 0;

    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const id = setInterval(() => {
      frame++;
      const progress = ease(Math.min(frame / frames, 1));
      setCounts(stats.map((s) => Math.round(s.value * progress)));
      if (frame >= frames) clearInterval(id);
    }, 1000 / fps);

    return () => clearInterval(id);
  }, [visible, stats]);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="font-display text-3xl md:text-4xl text-primary tabular-nums">
            {counts[i]}
            {stat.suffix && <span className="text-xl text-primary/70">{stat.suffix}</span>}
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2 font-display">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedStats;
