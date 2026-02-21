import { useState, useEffect } from "react";
import { Radio, Tv } from "lucide-react";
import { CricketBallLoader } from "@/components/widgets";
import type { CricketMatch } from "@/services/cricketApi";
import { getLiveIndiaMatches, isApiConfigured } from "@/services/cricketApi";

const formatMatchType = (type: string) => {
  switch (type?.toLowerCase()) {
    case "t20":
    case "t20i":
      return "T20I";
    case "odi":
      return "ODI";
    case "test":
      return "Test";
    default:
      return type?.toUpperCase() ?? "—";
  }
};

const ScoreCard = ({ match }: { match: CricketMatch }) => {
  const isLive = match.matchStarted && !match.matchEnded;
  const teamA = match.teamInfo?.[0];
  const teamB = match.teamInfo?.[1];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
        <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">
          {formatMatchType(match.matchType)}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-display text-destructive">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
            </span>
            LIVE
          </span>
        ) : (
          <span className="text-xs font-display text-muted-foreground">
            {match.matchEnded ? "Completed" : "—"}
          </span>
        )}
      </div>

      {/* Teams & Scores */}
      <div className="p-4 space-y-3">
        {[teamA, teamB].map((team, i) => {
          if (!team) return null;
          const innings = match.score?.filter((s) =>
            s.inning.toLowerCase().includes(team.name.toLowerCase())
          );
          return (
            <div key={team.shortname ?? i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {team.img ? (
                  <img
                    src={team.img}
                    alt={team.shortname}
                    className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-display text-primary">
                      {team.shortname?.slice(0, 2) ?? "?"}
                    </span>
                  </div>
                )}
                <span className="font-display text-sm text-foreground truncate">
                  {team.shortname || team.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                {innings && innings.length > 0 ? (
                  innings.map((inn, j) => (
                    <div key={j} className="font-display text-sm tabular-nums">
                      <span className="text-foreground">
                        {inn.r}/{inn.w}
                      </span>
                      <span className="text-muted-foreground text-xs ml-1">
                        ({inn.o} ov)
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Yet to bat</span>
                )}
              </div>
            </div>
          );
        })}

        {/* If no teamInfo, show team names from teams array */}
        {!teamA && !teamB && match.teams?.length >= 2 && (
          <>
            {match.teams.map((t, i) => {
              const innings = match.score?.filter((s) =>
                s.inning.toLowerCase().includes(t.toLowerCase())
              );
              return (
                <div key={i} className="flex items-center justify-between gap-3">
                  <span className="font-display text-sm text-foreground">{t}</span>
                  <div className="text-right">
                    {innings && innings.length > 0 ? (
                      innings.map((inn, j) => (
                        <div key={j} className="font-display text-sm tabular-nums">
                          <span className="text-foreground">
                            {inn.r}/{inn.w}
                          </span>
                          <span className="text-muted-foreground text-xs ml-1">
                            ({inn.o} ov)
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Status */}
      <div className="px-4 pb-3">
        <p
          className={`text-xs leading-relaxed ${
            isLive ? "text-primary font-medium" : "text-muted-foreground"
          }`}
        >
          {match.status}
        </p>
        {match.venue && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">
            📍 {match.venue}
          </p>
        )}
      </div>
    </div>
  );
};

interface LiveCricketScoresProps {
  /** Max cards to show */
  limit?: number;
  /** Compact mode for homepage widget */
  compact?: boolean;
}

const LiveCricketScores = ({ limit, compact = false }: LiveCricketScoresProps) => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetch = async () => {
      try {
        const data = await getLiveIndiaMatches();
        if (!cancelled) setMatches(limit ? data.slice(0, limit) : data);
      } catch {
        if (!cancelled) setError("Could not load live scores");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();

    // Auto-refresh every 60 seconds for live scores
    const id = setInterval(fetch, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [limit]);

  if (!isApiConfigured()) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Tv size={24} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Cricket API key not configured. Add <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_CRICAPI_KEY</code> to your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Get a free key at{" "}
          <a
            href="https://cricapi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            cricapi.com
          </a>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <CricketBallLoader size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Radio size={20} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No live or recent India matches right now.
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
      {matches.map((m) => (
        <ScoreCard key={m.id} match={m} />
      ))}
    </div>
  );
};

export default LiveCricketScores;
