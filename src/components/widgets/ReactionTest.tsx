import { useState, useEffect, useRef, useCallback } from "react";
import { Gauge, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Reaction Time Test — test your reflexes!
 * Wait for the screen to turn green, then tap as fast as you can.
 */
type Phase = "waiting" | "ready" | "go" | "result" | "too-early";

const ReactionTest = () => {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [reactionTime, setReactionTime] = useState(0);
  const [best, setBest] = useState(() => {
    const stored = localStorage.getItem("reaction-best");
    return stored ? parseInt(stored, 10) : Infinity;
  });
  const [attempts, setAttempts] = useState<number[]>([]);
  const goTime = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const startRound = useCallback(() => {
    setPhase("ready");
    const delay = 1500 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      goTime.current = Date.now();
      setPhase("go");
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    switch (phase) {
      case "waiting":
        startRound();
        break;
      case "ready":
        clearTimeout(timeoutRef.current);
        setPhase("too-early");
        break;
      case "go": {
        const ms = Date.now() - goTime.current;
        setReactionTime(ms);
        setAttempts((prev) => [...prev.slice(-4), ms]);
        if (ms < best) {
          setBest(ms);
          localStorage.setItem("reaction-best", String(ms));
        }
        setPhase("result");
        break;
      }
      case "result":
      case "too-early":
        startRound();
        break;
    }
  }, [phase, startRound, best]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const rating = (ms: number) => {
    if (ms < 200) return { text: "Lightning! ⚡", color: "text-primary" };
    if (ms < 300) return { text: "Great reflexes! 🏏", color: "text-primary" };
    if (ms < 400) return { text: "Nice catch! 👏", color: "text-foreground" };
    return { text: "Keep practising! 💪", color: "text-muted-foreground" };
  };

  const bgMap: Record<Phase, string> = {
    waiting: "bg-card",
    ready: "bg-destructive/80",
    go: "bg-cricket-green",
    result: "bg-card",
    "too-early": "bg-destructive/60",
  };

  return (
    <div className="border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border bg-card">
        <Gauge size={18} className="text-primary" />
        <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
          Reaction Test
        </h3>
        {best < Infinity && (
          <span className="ml-auto text-xs text-muted-foreground font-display">
            Best: <span className="text-primary tabular-nums">{best}ms</span>
          </span>
        )}
      </div>

      <div
        className={`${bgMap[phase]} cursor-pointer transition-colors duration-200 select-none`}
        style={{ height: 200 }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Reaction test area"
        onKeyDown={(e) => e.key === " " && handleClick()}
      >
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          {phase === "waiting" && (
            <>
              <p className="font-display text-lg text-foreground">🏏 Test Your Reflexes</p>
              <p className="text-sm text-muted-foreground mt-1">Click to start</p>
            </>
          )}
          {phase === "ready" && (
            <p className="font-display text-lg text-white">Wait for green…</p>
          )}
          {phase === "go" && (
            <p className="font-display text-2xl text-white font-bold">TAP NOW!</p>
          )}
          {phase === "too-early" && (
            <>
              <p className="font-display text-lg text-white">Too early! 😬</p>
              <p className="text-sm text-white/70 mt-1">Click to try again</p>
            </>
          )}
          {phase === "result" && (
            <>
              <p className="font-display text-4xl text-primary tabular-nums">
                {reactionTime}
                <span className="text-lg text-muted-foreground">ms</span>
              </p>
              <p className={`text-sm font-display mt-1 ${rating(reactionTime).color}`}>
                {rating(reactionTime).text}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Click to try again</p>
            </>
          )}
        </div>
      </div>

      {/* Recent attempts */}
      {attempts.length > 0 && (
        <div className="p-3 border-t border-border bg-card flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-muted-foreground font-display shrink-0">Recent:</span>
          {attempts.map((ms, i) => (
            <span
              key={i}
              className="text-xs bg-muted px-2 py-0.5 rounded-full font-display tabular-nums"
            >
              {ms}ms
            </span>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setAttempts([]);
              setBest(Infinity);
              localStorage.removeItem("reaction-best");
              setPhase("waiting");
            }}
            title="Reset"
          >
            <RotateCcw size={12} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReactionTest;
