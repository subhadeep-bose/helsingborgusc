import { useState, useCallback, useRef, useEffect } from "react";
import { Trophy, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

type GameState = "idle" | "playing" | "over";

interface Ball {
  id: number;
  x: number;
  y: number;
  speed: number;
  hit: boolean;
}

const GAME_DURATION = 30; // seconds

const CricketHitGame = () => {
  const [state, setState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    const stored = localStorage.getItem("cricket-hit-best");
    return stored ? parseInt(stored, 10) : 0;
  });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [balls, setBalls] = useState<Ball[]>([]);
  const nextId = useRef(0);
  const gameRef = useRef<HTMLDivElement>(null);

  const spawnBall = useCallback(() => {
    const ball: Ball = {
      id: nextId.current++,
      x: 10 + Math.random() * 80,
      y: -5,
      speed: 1.2 + Math.random() * 2,
      hit: false,
    };
    setBalls((prev) => [...prev.slice(-12), ball]);
  }, []);

  const hitBall = useCallback((id: number) => {
    setBalls((prev) =>
      prev.map((b) => (b.id === id && !b.hit ? { ...b, hit: true } : b))
    );
    setScore((prev) => prev + 1);
  }, []);

  // Game loop
  useEffect(() => {
    if (state !== "playing") return;

    const spawnInterval = setInterval(spawnBall, 600);
    const moveInterval = setInterval(() => {
      setBalls((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y + b.speed }))
          .filter((b) => b.y < 105 || b.hit)
      );
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [state, spawnBall]);

  // Timer
  useEffect(() => {
    if (state !== "playing") return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setState("over");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [state]);

  // Update best score
  useEffect(() => {
    if (state === "over" && score > best) {
      setBest(score);
      localStorage.setItem("cricket-hit-best", String(score));
    }
  }, [state, score, best]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBalls([]);
    nextId.current = 0;
    setState("playing");
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary" />
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
            Cricket Hit!
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-display">
          <span className="text-muted-foreground">
            Best: <span className="text-primary tabular-nums">{best}</span>
          </span>
          {state === "playing" && (
            <span className="text-muted-foreground">
              ⏱ <span className="text-foreground tabular-nums">{timeLeft}s</span>
            </span>
          )}
        </div>
      </div>

      {/* Game area */}
      <div
        ref={gameRef}
        className="relative bg-gradient-to-b from-cricket-green/20 to-cricket-pitch/20 dark:from-cricket-green/10 dark:to-cricket-pitch/10 overflow-hidden select-none"
        style={{ height: 280 }}
      >
        {/* Pitch lines */}
        <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-primary/10" />
        <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-primary/10" />

        {state === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">🏏</div>
            <p className="text-sm text-muted-foreground text-center max-w-[200px]">
              Tap the cricket balls before they leave the pitch!
            </p>
            <Button onClick={startGame} className="font-display">
              Start Game
            </Button>
          </div>
        )}

        {state === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm z-20">
            <Trophy size={36} className="text-primary" />
            <div className="text-center">
              <p className="font-display text-2xl text-foreground">{score} Hits!</p>
              {score >= best && score > 0 && (
                <p className="text-xs text-primary font-display mt-1">🎉 New Best!</p>
              )}
            </div>
            <Button onClick={startGame} variant="outline" className="gap-2 font-display">
              <RotateCcw size={14} />
              Play Again
            </Button>
          </div>
        )}

        {state === "playing" && (
          <>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-4 py-1 text-lg font-display tabular-nums z-10">
              {score}
            </div>
            {balls
              .filter((b) => !b.hit)
              .map((ball) => (
                <button
                  key={ball.id}
                  className="absolute w-10 h-10 -ml-5 -mt-5 cursor-pointer transition-transform active:scale-90 focus:outline-none z-10"
                  style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
                  onClick={() => hitBall(ball.id)}
                  aria-label="Hit the ball"
                >
                  <span className="text-3xl select-none drop-shadow-md block cricket-ball-spin">🏏</span>
                </button>
              ))}
            {balls
              .filter((b) => b.hit)
              .map((ball) => (
                <div
                  key={`hit-${ball.id}`}
                  className="absolute text-primary font-display text-lg font-bold pointer-events-none animate-hit-burst z-10"
                  style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
                >
                  +1
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CricketHitGame;
