import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const LiveClock = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const helsingborg = new Intl.DateTimeFormat("en-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(time);

  const date = new Intl.DateTimeFormat("en-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(time);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-primary" />
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">
          Helsingborg, Sweden
        </span>
      </div>
      <div className="font-display text-3xl md:text-4xl text-foreground tabular-nums tracking-tight">
        {helsingborg}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{date}</div>
    </div>
  );
};

export default LiveClock;
