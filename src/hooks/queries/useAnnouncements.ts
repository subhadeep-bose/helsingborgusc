import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Types ─── */
export interface Announcement {
  id: string;
  title: string;
  summary: string;
  tag: string;
  published_at: string;
}

/* ─── Queries ─── */
export function useAnnouncements() {
  return useQuery({
    queryKey: queryKeys.announcements.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, summary, tag, published_at")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useLatestAnnouncements(limit: number) {
  return useQuery({
    queryKey: queryKeys.announcements.latest(limit),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, summary, tag, published_at")
        .order("published_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

/* ─── Mutations ─── */
export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; summary: string; tag: string; created_by: string }) => {
      const { error } = await supabase.from("announcements").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.announcements.all }),
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; title: string; summary: string; tag: string }) => {
      const { error } = await supabase.from("announcements").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.announcements.all }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.announcements.all }),
  });
}
