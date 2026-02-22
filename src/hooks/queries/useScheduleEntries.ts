import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Types ─── */
export interface ScheduleEntry {
  id: string;
  day: string;
  time: string;
  type: string;
  location: string;
  category: string;
  event_date: string | null;
  sort_order: number;
}

/* ─── Queries ─── */
export function useScheduleEntries() {
  return useQuery({
    queryKey: queryKeys.scheduleEntries.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_entries")
        .select("id, day, time, type, location, category, event_date, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data as ScheduleEntry[];
    },
  });
}

/* ─── Mutations ─── */
export function useCreateScheduleEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<ScheduleEntry, "id">) => {
      const { error } = await supabase.from("schedule_entries").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduleEntries.all });
      qc.invalidateQueries({ queryKey: queryKeys.clubStats.all });
      qc.invalidateQueries({ queryKey: queryKeys.nextEvent.all });
    },
  });
}

export function useUpdateScheduleEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<ScheduleEntry>) => {
      const { error } = await supabase.from("schedule_entries").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduleEntries.all });
      qc.invalidateQueries({ queryKey: queryKeys.nextEvent.all });
    },
  });
}

export function useDeleteScheduleEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduleEntries.all });
      qc.invalidateQueries({ queryKey: queryKeys.clubStats.all });
      qc.invalidateQueries({ queryKey: queryKeys.nextEvent.all });
    },
  });
}
