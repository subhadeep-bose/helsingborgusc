import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./keys";

/* ─── Types ─── */
export interface GalleryImage {
  id: string;
  alt: string;
  storage_path: string;
  sort_order: number;
}

/* ─── Queries ─── */
export function useGalleryImages() {
  return useQuery({
    queryKey: queryKeys.galleryImages.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, alt, storage_path, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data as GalleryImage[];
    },
  });
}

/* ─── Mutations ─── */
export function useCreateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { storage_path: string; alt: string; uploaded_by: string; sort_order: number }) => {
      const { error } = await supabase.from("gallery_images").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.galleryImages.all }),
  });
}

export function useUpdateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; alt?: string; sort_order?: number }) => {
      const { error } = await supabase.from("gallery_images").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.galleryImages.all }),
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (img: GalleryImage) => {
      // Delete from storage first
      await supabase.storage.from("gallery").remove([img.storage_path]);
      const { error } = await supabase.from("gallery_images").delete().eq("id", img.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.galleryImages.all }),
  });
}
