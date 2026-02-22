import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Types ─── */
export interface Member {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  experience_level: string | null;
  registered_at: string;
  status: string;
  user_id: string | null;
  fee_paid: boolean;
}

export interface MemberProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  experience_level: string | null;
  status: string;
  registered_at: string;
  fee_paid: boolean;
}

/* ─── Queries ─── */
export function useAllMembers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.members.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, first_name, last_name, email, phone, experience_level, registered_at, status, user_id, fee_paid")
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data as Member[];
    },
    enabled,
  });
}

export function useApprovedMembers() {
  return useQuery({
    queryKey: queryKeys.members.approved,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, first_name, last_name, experience_level, registered_at")
        .eq("status", "approved")
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data as Pick<Member, "id" | "first_name" | "last_name" | "experience_level" | "registered_at">[];
    },
  });
}

export function useMyProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.members.byUser(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, first_name, last_name, email, phone, date_of_birth, place_of_birth, experience_level, status, registered_at, fee_paid")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as MemberProfile | null;
    },
    enabled: !!userId,
  });
}

/* ─── Mutations ─── */
export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; [key: string]: unknown }) => {
      const { error } = await supabase.from("members").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members.all });
      qc.invalidateQueries({ queryKey: queryKeys.members.approved });
      qc.invalidateQueries({ queryKey: queryKeys.clubStats.all });
    },
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members.all });
      qc.invalidateQueries({ queryKey: queryKeys.members.approved });
      qc.invalidateQueries({ queryKey: queryKeys.clubStats.all });
    },
  });
}
