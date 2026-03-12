import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Types ─── */
export interface EventRsvp {
  id: string;
  schedule_entry_id: string;
  user_id: string;
  created_at: string;
}

export interface RsvpCount {
  schedule_entry_id: string;
  count: number;
}

/* ─── Queries ─── */

/** Fetch all RSVPs for a list of schedule entry IDs */
export function useEventRsvpCounts(entryIds: string[]) {
  return useQuery({
    queryKey: queryKeys.eventRsvps.counts(entryIds),
    queryFn: async () => {
      if (entryIds.length === 0) return [] as EventRsvp[];
      const { data, error } = await supabase
        .from("event_rsvps" as any)
        .select("id, schedule_entry_id, user_id, created_at")
        .in("schedule_entry_id", entryIds);
      if (error) throw error;
      return (data ?? []) as EventRsvp[];
    },
    enabled: entryIds.length > 0,
  });
}

/** Check if current user has RSVPed for specific entries */
export function useMyRsvps(userId: string | undefined, entryIds: string[]) {
  return useQuery({
    queryKey: queryKeys.eventRsvps.mine(userId ?? "", entryIds),
    queryFn: async () => {
      if (!userId || entryIds.length === 0) return [] as EventRsvp[];
      const { data, error } = await supabase
        .from("event_rsvps" as any)
        .select("id, schedule_entry_id, user_id, created_at")
        .eq("user_id", userId)
        .in("schedule_entry_id", entryIds);
      if (error) throw error;
      return (data ?? []) as EventRsvp[];
    },
    enabled: !!userId && entryIds.length > 0,
  });
}

/* ─── Mutations ─── */

export function useToggleRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      scheduleEntryId,
      userId,
      isRsvped,
    }: {
      scheduleEntryId: string;
      userId: string;
      isRsvped: boolean;
    }) => {
      if (isRsvped) {
        // Remove RSVP
        const { error } = await supabase
          .from("event_rsvps")
          .delete()
          .eq("schedule_entry_id", scheduleEntryId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Add RSVP
        const { error } = await supabase
          .from("event_rsvps")
          .insert({ schedule_entry_id: scheduleEntryId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event-rsvps"] });
    },
  });
}
