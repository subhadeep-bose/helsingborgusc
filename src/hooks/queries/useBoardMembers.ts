import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Types ─── */
export interface BoardMember {
  id: string;
  name: string;
  role: string;
  sort_order: number;
  member_id: string | null;
  user_id: string | null;
}

/* ─── Queries ─── */
export function useBoardMembers() {
  return useQuery({
    queryKey: queryKeys.boardMembers.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("board_members")
        .select("id, name, role, sort_order, member_id, user_id")
        .order("sort_order");
      if (error) throw error;
      return data as BoardMember[];
    },
  });
}

/* ─── Mutations ─── */
export function useCreateBoardMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; role: string; sort_order: number; member_id: string | null }) => {
      const { error } = await supabase.from("board_members").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardMembers.all }),
  });
}

export function useUpdateBoardMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; role: string; sort_order: number; member_id: string | null }) => {
      const { error } = await supabase.from("board_members").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardMembers.all }),
  });
}

export function useDeleteBoardMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("board_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boardMembers.all }),
  });
}
