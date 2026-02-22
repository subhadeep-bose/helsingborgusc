import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Club Stats ─── */
export function useClubStats() {
  return useQuery({
    queryKey: queryKeys.clubStats.all,
    queryFn: async () => {
      const [membersRes, sessionsRes, matchesRes] = await Promise.all([
        supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("schedule_entries").select("id", { count: "exact", head: true }).eq("category", "weekly"),
        supabase.from("schedule_entries").select("id", { count: "exact", head: true }).eq("category", "event"),
      ]);
      const events = matchesRes.count ?? 0;
      return {
        members: membersRes.count ?? 0,
        sessions: sessionsRes.count ?? 0,
        matches: events * 2, // ~2 matches played per session on average
      };
    },
  });
}

/* ─── Next Event ─── */
export function useNextEvent() {
  return useQuery({
    queryKey: queryKeys.nextEvent.all,
    queryFn: async () => {
      // Try upcoming events first
      const { data: events } = await supabase
        .from("schedule_entries")
        .select("type, event_date")
        .eq("category", "event")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date")
        .limit(1);

      if (events && events.length > 0 && events[0].event_date) {
        return {
          title: events[0].type,
          date: new Date(events[0].event_date + "T10:00:00").toISOString(),
        };
      }

      // Fallback: next weekly training (Sunday 3–5 PM CET)
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      let daysUntilSunday = (7 - dayOfWeek) % 7;
      if (daysUntilSunday === 0) {
        const cutoffToday = new Date(now);
        cutoffToday.setUTCHours(16, 0, 0, 0);
        if (now > cutoffToday) daysUntilSunday = 7;
      }
      const nextSunday = new Date(now);
      nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
      nextSunday.setUTCHours(14, 0, 0, 0);
      return {
        title: "Training Session — Sunday 3–5 PM CET",
        date: nextSunday.toISOString(),
      };
    },
  });
}
