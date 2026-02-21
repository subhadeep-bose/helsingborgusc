import { useState, useEffect } from "react";
import { CalendarDays, MapPin, Tv } from "lucide-react";
import { CricketBallLoader } from "@/components/widgets";
import type { CricketMatch } from "@/services/cricketApi";
import { getUpcomingIndiaMatches, isApiConfigured, getTrackedSeriesNames } from "@/services/cricketApi";

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

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
};

interface UpcomingMatchesProps {
  limit?: number;
  compact?: boolean;
}

const UpcomingMatches = ({ limit = 10, compact = false }: UpcomingMatchesProps) => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getUpcomingIndiaMatches();
        if (!cancelled) setMatches(data.slice(0, limit));
      } catch {
        if (!cancelled) setError("Could not load upcoming matches");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
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
    const seriesNames = getTrackedSeriesNames();
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <CalendarDays size={20} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No upcoming India matches found in the API at the moment.
        </p>
        {seriesNames.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Tracking: <span className="text-primary font-medium">{seriesNames.join(", ")}</span>.
            <br />
            Match data may appear closer to the scheduled dates.
          </p>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {matches.map((m) => {
          const teamA = m.teamInfo?.[0];
          const teamB = m.teamInfo?.[1];
          return (
            <div
              key={m.id}
              className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {teamA?.img && (
                    <img src={teamA.img} alt="" className="w-5 h-5 rounded-full" loading="lazy" />
                  )}
                  <span className="font-display text-xs text-foreground truncate">
                    {teamA?.shortname ?? m.teams?.[0] ?? "TBA"}
                  </span>
                  <span className="text-muted-foreground text-[10px]">vs</span>
                  {teamB?.img && (
                    <img src={teamB.img} alt="" className="w-5 h-5 rounded-full" loading="lazy" />
                  )}
                  <span className="font-display text-xs text-foreground truncate">
                    {teamB?.shortname ?? m.teams?.[1] ?? "TBA"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {formatDate(m.dateTimeGMT)}
                </p>
              </div>
              <span className="text-[10px] font-display uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
                {formatMatchType(m.matchType)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((m) => {
        const teamA = m.teamInfo?.[0];
        const teamB = m.teamInfo?.[1];
        return (
          <div
            key={m.id}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded">
                {formatMatchType(m.matchType)}
              </span>
              <span className="text-xs text-muted-foreground font-display">
                {formatDate(m.dateTimeGMT)}
              </span>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="text-center">
                {teamA?.img ? (
                  <img
                    src={teamA.img}
                    alt={teamA.shortname}
                    className="w-12 h-12 rounded-full mx-auto border border-border object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="font-display text-sm text-primary">
                      {(teamA?.shortname ?? m.teams?.[0] ?? "?").slice(0, 3)}
                    </span>
                  </div>
                )}
                <p className="font-display text-sm text-foreground mt-2">
                  {teamA?.shortname ?? m.teams?.[0] ?? "TBA"}
                </p>
              </div>

              <span className="font-display text-lg text-muted-foreground">vs</span>

              <div className="text-center">
                {teamB?.img ? (
                  <img
                    src={teamB.img}
                    alt={teamB.shortname}
                    className="w-12 h-12 rounded-full mx-auto border border-border object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="font-display text-sm text-primary">
                      {(teamB?.shortname ?? m.teams?.[1] ?? "?").slice(0, 3)}
                    </span>
                  </div>
                )}
                <p className="font-display text-sm text-foreground mt-2">
                  {teamB?.shortname ?? m.teams?.[1] ?? "TBA"}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} />
                {formatTime(m.dateTimeGMT)}
              </span>
              {m.venue && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={12} />
                  {m.venue}
                </span>
              )}
              {m.series && (
                <span className="text-[10px] font-display text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {m.series}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingMatches;
