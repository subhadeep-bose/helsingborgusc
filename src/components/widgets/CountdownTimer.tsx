import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: string;
  eventName: string;
}

const CountdownTimer = ({ targetDate, eventName }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (expired) return null;
  if (!timeLeft) return null;

  const blocks: { label: string; value: number }[] = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Timer size={18} className="text-primary animate-pulse" />
        <h3 className="font-display text-sm tracking-wider uppercase text-muted-foreground">
          Next Event
        </h3>
      </div>
      <p className="font-display text-lg text-foreground mb-4 gold-accent">{eventName}</p>
      <div className="grid grid-cols-4 gap-2">
        {blocks.map((b) => (
          <div key={b.label} className="text-center">
            <div className="relative bg-primary/10 rounded-lg px-2 py-3 overflow-hidden">
              <span className="font-display text-2xl md:text-3xl text-primary tabular-nums countdown-flip">
                {String(b.value).padStart(2, "0")}
              </span>
              <div className="absolute inset-x-0 top-1/2 h-px bg-primary/5" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 block font-display">
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
