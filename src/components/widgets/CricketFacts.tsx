import { useState, useEffect, useCallback } from "react";
import { Quote } from "lucide-react";

const FACTS = [
  "Cricket is the 2nd most popular sport in the world with 2.5 billion fans.",
  "The longest cricket match lasted 14 days — England vs South Africa in 1939.",
  "The fastest recorded ball in cricket was 161.3 km/h by Shoaib Akhtar.",
  "A cricket ball weighs between 155.9g and 163g — about the same as a phone.",
  "The first ever international cricket match was between USA and Canada in 1844.",
  "The word 'cricket' may come from the Old French 'criquet', meaning a stick.",
  "Sachin Tendulkar holds the record for most runs in international cricket.",
  "The Ashes urn is only 15 cm tall — one of the smallest trophies in sport!",
  "In Sweden, cricket is one of the fastest-growing sports.",
  "Helsingborg has been home to cricket for over a decade!",
  "A cricket pitch is 22 yards (20.12 m) long — the same as a chain.",
  "The ball must bounce at least once before reaching the batsman in most deliveries.",
];

const CricketFacts = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const advance = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % FACTS.length);
      setFade(true);
    }, 400);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, 6000);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <div
      role="marquee"
      aria-live="polite"
      className="bg-primary/5 border border-primary/10 rounded-xl p-5 cursor-pointer select-none"
      onClick={advance}
      title="Click for another fact"
    >
      <div className="flex items-start gap-3">
        <Quote size={18} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-display uppercase tracking-wider text-primary mb-2">
            Did You Know? 🏏
          </p>
          <p
            className={`text-sm text-foreground leading-relaxed transition-opacity duration-400 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            {FACTS[index]}
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-1 mt-3">
        {FACTS.map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === index ? "bg-primary" : "bg-primary/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CricketFacts;
