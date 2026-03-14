import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Types ─── */
export interface GalleryImage {
  id: string;
  alt: string;
  storage_path: string;
  sort_order: number;
  status: "pending" | "approved" | "rejected";
  uploaded_by: string | null;
  created_at: string;
}

/* ─── Queries ─── */
export function useGalleryImages() {
  return useQuery({
    queryKey: queryKeys.galleryImages.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, alt, storage_path, sort_order, status, uploaded_by, created_at")
        .eq("status", "approved" as any)
        .order("sort_order");
      if (error) throw error;
      return data as unknown as GalleryImage[];
    },
  });
}

export function usePendingGalleryImages() {
  return useQuery({
    queryKey: queryKeys.galleryImages.pending,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, alt, storage_path, sort_order, status, uploaded_by, created_at")
        .eq("status", "pending" as any)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as GalleryImage[];
    },
  });
}

/* ─── Mutations ─── */
export function useCreateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { storage_path: string; alt: string; uploaded_by: string; sort_order: number; status?: string }) => {
      const { error } = await supabase.from("gallery_images").insert(payload as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.galleryImages.all });
      qc.invalidateQueries({ queryKey: queryKeys.galleryImages.pending });
    },
  });
}

export function useUpdateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; alt?: string; sort_order?: number; status?: string }) => {
      const { error } = await supabase.from("gallery_images").update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.galleryImages.all });
      qc.invalidateQueries({ queryKey: queryKeys.galleryImages.pending });
    },
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (img: GalleryImage) => {
      await supabase.storage.from("gallery").remove([img.storage_path]);
      const { error } = await supabase.from("gallery_images").delete().eq("id", img.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.galleryImages.all });
      qc.invalidateQueries({ queryKey: queryKeys.galleryImages.pending });
    },
  });
}
