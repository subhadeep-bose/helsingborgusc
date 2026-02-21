/**
 * Cricket API service — powered by CricAPI (https://cricapi.com)
 * Free tier: 100 requests/day.
 * We cache responses in sessionStorage for 5 minutes to minimise calls.
 */

const API_BASE = "https://api.cricapi.com/v1";
const API_KEY = import.meta.env.VITE_CRICAPI_KEY as string | undefined;

/* ── Types ─────────────────────────────────────────────────── */

export interface CricketMatch {
  id: string;
  name: string;           // e.g. "India vs Australia, 3rd ODI"
  matchType: string;      // "odi" | "t20" | "test"
  status: string;         // e.g. "Match not started" | "India won by 5 wickets"
  venue: string;
  date: string;           // ISO date
  dateTimeGMT: string;    // ISO datetime
  teams: string[];        // ["India", "Australia"]
  teamInfo?: TeamInfo[];
  score?: ScoreEntry[];
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

export interface TeamInfo {
  name: string;
  shortname: string;
  img: string;
}

export interface ScoreEntry {
  r: number;   // runs
  w: number;   // wickets
  o: number;   // overs
  inning: string; // e.g. "India Inning 1"
}

interface ApiResponse<T> {
  apikey: string;
  data: T;
  status: string;
  info: {
    hitsToday: number;
    hitsUsed: number;
    hitsLimit: number;
    credits: number;
    server: number;
    offsetRows: number;
    totalRows: number;
    queryTime: number;
    s: number;
    cache: number;
  };
}

/* ── Cache helper ──────────────────────────────────────────── */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // quota exceeded — ignore
  }
}

/* ── Fetch wrapper ─────────────────────────────────────────── */

async function apiFetch<T>(endpoint: string): Promise<T[]> {
  if (!API_KEY) {
    console.warn("[CricketAPI] No VITE_CRICAPI_KEY set — returning empty data");
    return [];
  }

  const cacheKey = `cricket:${endpoint}`;
  const cached = getCached<T[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_BASE}/${endpoint}?apikey=${API_KEY}&offset=0`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<T[]> = await res.json();

    if (json.status !== "success" || !Array.isArray(json.data)) {
      return [];
    }

    setCache(cacheKey, json.data);
    return json.data;
  } catch (err) {
    console.error("[CricketAPI]", err);
    return [];
  }
}

/* ── Public API ────────────────────────────────────────────── */

/** Matches involving India — filters both upcoming & completed */
function isIndiaMatch(match: CricketMatch): boolean {
  return match.teams?.some(
    (t) => t.toLowerCase().includes("india")
  ) ?? false;
}

/** International matches only (skip league/domestic) */
function isInternational(match: CricketMatch): boolean {
  const type = match.matchType?.toLowerCase() ?? "";
  return ["odi", "t20", "test", "t20i"].includes(type);
}

/** Get live / recently-completed matches involving India */
export async function getLiveIndiaMatches(): Promise<CricketMatch[]> {
  const all = await apiFetch<CricketMatch>("currentMatches");
  return all
    .filter((m) => isIndiaMatch(m) && isInternational(m))
    .sort((a, b) => {
      // live first, then recent
      if (a.matchStarted && !a.matchEnded && (!b.matchStarted || b.matchEnded)) return -1;
      if (b.matchStarted && !b.matchEnded && (!a.matchStarted || a.matchEnded)) return 1;
      return new Date(b.dateTimeGMT).getTime() - new Date(a.dateTimeGMT).getTime();
    });
}

/** Get upcoming matches involving India */
export async function getUpcomingIndiaMatches(): Promise<CricketMatch[]> {
  const all = await apiFetch<CricketMatch>("matches");
  return all
    .filter(
      (m) =>
        isIndiaMatch(m) &&
        isInternational(m) &&
        !m.matchStarted
    )
    .sort(
      (a, b) =>
        new Date(a.dateTimeGMT).getTime() - new Date(b.dateTimeGMT).getTime()
    )
    .slice(0, 10);
}

/** Check if the API key is configured */
export function isApiConfigured(): boolean {
  return !!API_KEY;
}
