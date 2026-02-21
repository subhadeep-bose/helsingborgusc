import { useState, useEffect, useCallback } from "react";
import { Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Difficulty = "easy" | "medium" | "hard";

interface Question {
  q: string;
  options: string[];
  answer: number; // index
}

const QUESTIONS: Question[] = [
  { q: "How many players are on a cricket team?", options: ["9", "11", "13", "15"], answer: 1 },
  { q: "What is the length of a cricket pitch?", options: ["18 yards", "20 yards", "22 yards", "24 yards"], answer: 2 },
  { q: "Which country won the first Cricket World Cup in 1975?", options: ["Australia", "England", "India", "West Indies"], answer: 3 },
  { q: "What is a score of 0 called in cricket?", options: ["Zero", "Nil", "Duck", "Blank"], answer: 2 },
  { q: "How many stumps are in a wicket?", options: ["2", "3", "4", "5"], answer: 1 },
  { q: "What does 'LBW' stand for?", options: ["Left Bat Wing", "Leg Before Wicket", "Long Ball Wide", "Low Bat Wield"], answer: 1 },
  { q: "How many runs is a 'century'?", options: ["50", "75", "100", "150"], answer: 2 },
  { q: "Which format has 20 overs per side?", options: ["Test", "ODI", "T20", "The Hundred"], answer: 2 },
  { q: "An over consists of how many legal deliveries?", options: ["4", "5", "6", "8"], answer: 2 },
  { q: "Which country is known as the birthplace of cricket?", options: ["Australia", "India", "England", "South Africa"], answer: 2 },
  { q: "What is hitting the ball over the boundary without bouncing called?", options: ["Four", "Six", "Century", "Wicket"], answer: 1 },
  { q: "Who holds the record for most ODI centuries?", options: ["Virat Kohli", "Sachin Tendulkar", "Ricky Ponting", "Kumar Sangakkara"], answer: 1 },
];

const TIMER_MAP: Record<Difficulty, number> = { easy: 20, medium: 12, hard: 7 };

const CricketQuiz = () => {
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [done, setDone] = useState(false);

  const shuffle = useCallback(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
  }, []);

  const start = (d: Difficulty) => {
    setDifficulty(d);
    shuffle();
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setDone(false);
    setTimer(TIMER_MAP[d]);
    setStarted(true);
  };

  const pick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].answer) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTimer(TIMER_MAP[difficulty]);
      }
    }, 1000);
  };

  // Countdown
  useEffect(() => {
    if (!started || done || selected !== null) return;

    const id = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Time up — treat as wrong
          setSelected(-1);
          setTimeout(() => {
            if (current + 1 >= questions.length) {
              setDone(true);
            } else {
              setCurrent((c) => c + 1);
              setSelected(null);
              setTimer(TIMER_MAP[difficulty]);
            }
          }, 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [started, done, selected, current, questions.length, difficulty]);

  // Menu
  if (!started) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-primary" />
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
            Cricket Quiz
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Test your cricket knowledge! Pick a difficulty:
        </p>
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <Button
              key={d}
              variant={d === "medium" ? "default" : "outline"}
              size="sm"
              className="font-display capitalize flex-1"
              onClick={() => start(d)}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Done
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "👏" : "💪";
    return (
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
        <div className="text-4xl mb-3">{emoji}</div>
        <p className="font-display text-xl text-foreground">
          {score}/{questions.length} Correct
        </p>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{difficulty} mode</p>
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2 font-display"
          onClick={() => setStarted(false)}
        >
          <RotateCcw size={14} />
          Play Again
        </Button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-1 bg-primary transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-display text-muted-foreground uppercase">
            Q{current + 1}/{questions.length}
          </span>
          <span
            className={`text-xs font-display tabular-nums px-2 py-0.5 rounded-full ${
              timer <= 3
                ? "bg-destructive/10 text-destructive animate-pulse"
                : "bg-primary/10 text-primary"
            }`}
          >
            ⏱ {timer}s
          </span>
        </div>

        {/* Question */}
        <p className="text-sm font-medium text-foreground mb-4">{q.q}</p>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2">
          {q.options.map((opt, idx) => {
            let cls = "border-border hover:border-primary/50 bg-background";
            if (selected !== null) {
              if (idx === q.answer) cls = "border-primary bg-primary/10 text-primary";
              else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive";
            }
            return (
              <button
                key={idx}
                className={`p-3 border rounded-lg text-left text-sm transition-all ${cls} ${
                  selected !== null ? "pointer-events-none" : "cursor-pointer"
                }`}
                onClick={() => pick(idx)}
                disabled={selected !== null}
              >
                <span className="font-display text-xs mr-2 opacity-50">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Score */}
        <div className="mt-3 text-right">
          <span className="text-xs text-muted-foreground font-display">
            Score: <span className="text-primary tabular-nums">{score}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CricketQuiz;
