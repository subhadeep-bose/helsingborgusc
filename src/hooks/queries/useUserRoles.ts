import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Types ─── */
export interface UserRole {
  user_id: string;
  role: string;
}

/* ─── Queries ─── */
export function useUserRoles(enabled = true) {
  return useQuery({
    queryKey: queryKeys.userRoles.all,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data as UserRole[];
    },
    enabled,
  });
}

/* ─── Mutations ─── */
export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { user_id: string; role: "admin" | "moderator" | "user" }) => {
      const { error } = await supabase.from("user_roles").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.userRoles.all }),
  });
}

export function useRemoveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: "admin" | "moderator" | "user" }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.userRoles.all }),
  });
}
