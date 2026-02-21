/**
 * Cricket API service — powered by CricAPI (https://cricapi.com)
 * Free tier: 100 requests/day.
 * We cache responses in sessionStorage for 5 minutes to minimise calls.
 *
 * Strategy:
 *  - `currentMatches` → live / recently-completed (single page, no pagination needed)
 *  - `matches`        → upcoming; we paginate up to MAX_PAGES to find India matches
 *  - `series_info`    → fetch matches from tracked series (e.g. T20 World Cup)
 */

const API_BASE = "https://api.cricapi.com/v1";
const API_KEY = import.meta.env.VITE_CRICAPI_KEY as string | undefined;

/** Maximum pages to scan in the `matches` endpoint (25 results each). */
const MAX_PAGES = 4;
const PAGE_SIZE = 25;

/** Series IDs we actively track for India schedule.
 *  These are refreshed occasionally — update when new tournaments are announced. */
const TRACKED_SERIES: { id: string; name: string }[] = [
  { id: "d04dd658-efe6-4e7c-8330-c741468610da", name: "ICC Men's T20 World Cup 2026" },
];

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
  /** Added by our code to indicate the source series */
  series?: string;
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

interface SeriesInfoResponse {
  info: {
    id: string;
    name: string;
    startdate: string;
    enddate: string;
    odi: number;
    t20: number;
    test: number;
    squads: number;
    matches: number;
  };
  matchList: CricketMatch[];
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

/* ── Fetch helpers ─────────────────────────────────────────── */

/** Fetch a single page from an endpoint. */
async function apiFetchPage<T>(endpoint: string, offset = 0): Promise<{ data: T[]; totalRows: number }> {
  if (!API_KEY) {
    console.warn("[CricketAPI] No VITE_CRICAPI_KEY set — returning empty data");
    return { data: [], totalRows: 0 };
  }

  try {
    const res = await fetch(`${API_BASE}/${endpoint}?apikey=${API_KEY}&offset=${offset}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<T[]> = await res.json();

    if (json.status !== "success" || !Array.isArray(json.data)) {
      return { data: [], totalRows: 0 };
    }
    return { data: json.data, totalRows: json.info?.totalRows ?? 0 };
  } catch (err) {
    console.error("[CricketAPI]", err);
    return { data: [], totalRows: 0 };
  }
}

/** Fetch a single-page endpoint (currentMatches). */
async function apiFetch<T>(endpoint: string): Promise<T[]> {
  const cacheKey = `cricket:${endpoint}`;
  const cached = getCached<T[]>(cacheKey);
  if (cached) return cached;

  const { data } = await apiFetchPage<T>(endpoint);
  if (data.length) setCache(cacheKey, data);
  return data;
}

/**
 * Paginated fetch — scans up to MAX_PAGES (default 4, i.e. 100 results).
 * Early-exits once all results have been scanned or enough India matches found.
 */
async function apiFetchPaginated<T extends CricketMatch>(
  endpoint: string,
  filterFn: (item: T) => boolean,
  targetCount = 10,
): Promise<T[]> {
  const cacheKey = `cricket:${endpoint}:paginated`;
  const cached = getCached<T[]>(cacheKey);
  if (cached) return cached;

  const collected: T[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const { data, totalRows } = await apiFetchPage<T>(endpoint, offset);

    for (const item of data) {
      if (filterFn(item)) collected.push(item);
    }

    // Stop early if we've seen all rows or have enough results
    if (offset + PAGE_SIZE >= totalRows || collected.length >= targetCount) break;
  }

  if (collected.length) setCache(cacheKey, collected);
  return collected;
}

/** Fetch matches from a tracked series (e.g. T20 World Cup). */
async function fetchSeriesMatches(seriesId: string): Promise<CricketMatch[]> {
  if (!API_KEY) return [];

  const cacheKey = `cricket:series:${seriesId}`;
  const cached = getCached<CricketMatch[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_BASE}/series_info?apikey=${API_KEY}&id=${seriesId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: ApiResponse<SeriesInfoResponse> = await res.json();

    if (json.status !== "success") return [];

    const matchList = json.data?.matchList ?? [];
    if (matchList.length) setCache(cacheKey, matchList);
    return matchList;
  } catch (err) {
    console.error("[CricketAPI] series_info error:", err);
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

/** De-duplicate matches by id. */
function dedup(matches: CricketMatch[]): CricketMatch[] {
  const seen = new Set<string>();
  return matches.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
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

/** Get upcoming matches involving India — merges paginated matches + tracked series. */
export async function getUpcomingIndiaMatches(): Promise<CricketMatch[]> {
  // 1. Paginated search through the general matches endpoint
  const fromMatches = await apiFetchPaginated<CricketMatch>(
    "matches",
    (m) => isIndiaMatch(m) && isInternational(m) && !m.matchStarted,
    10,
  );

  // 2. Fetch from tracked series (T20 WC, etc.)
  const seriesPromises = TRACKED_SERIES.map(async (s) => {
    const matches = await fetchSeriesMatches(s.id);
    return matches
      .filter((m) => isIndiaMatch(m) && !m.matchStarted && !m.matchEnded)
      .map((m) => ({ ...m, series: s.name }));
  });
  const fromSeries = (await Promise.all(seriesPromises)).flat();

  // 3. Merge & deduplicate
  const all = dedup([...fromMatches, ...fromSeries]);

  return all
    .sort(
      (a, b) =>
        new Date(a.dateTimeGMT).getTime() - new Date(b.dateTimeGMT).getTime()
    )
    .slice(0, 10);
}

/** Names of tracked series (for UI display). */
export function getTrackedSeriesNames(): string[] {
  return TRACKED_SERIES.map((s) => s.name);
}

/** Check if the API key is configured */
export function isApiConfigured(): boolean {
  return !!API_KEY;
}
