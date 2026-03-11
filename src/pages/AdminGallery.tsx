import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Upload, ImagePlus, Pencil, Check } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useGalleryImages, useDeleteGalleryImage, useUpdateGalleryImage } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/queries/keys";
import type { GalleryImage } from "@/hooks/queries";

const AdminGallery = () => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: images = [], isLoading: fetching } = useGalleryImages();
  const deleteMutation = useDeleteGalleryImage();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");

  const fetchImages = () => queryClient.invalidateQueries({ queryKey: queryKeys.galleryImages.all });

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const handleUpload = async () => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) {
      toast.error("Please select a file");
      return;
    }

    // Validate each file before uploading
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Invalid file type", { description: `"${file.name}" is not a supported image format. Use JPEG, PNG, WebP, or GIF.` });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large", { description: `"${file.name}" exceeds the 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).` });
        return;
      }
    }

    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
      if (uploadError) {
        toast.error("Upload failed", { description: uploadError.message });
        continue;
      }
      const { error: dbError } = await supabase.from("gallery_images").insert({
        storage_path: path,
        alt: alt.trim() || file.name,
        uploaded_by: user!.id,
        sort_order: images.length,
      });
      if (dbError) {
        toast.error("Error saving", { description: dbError.message });
      }
    }
    toast.success("Uploaded!");
    setAlt("");
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    fetchImages();
  };

  const handleDelete = async (img: GalleryImage) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await deleteMutation.mutateAsync(img);
      toast.success("Deleted");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  return (
    <AdminLayout title="Manage" accent="Gallery" loading={fetching} maxWidth="max-w-4xl">

        {/* Upload form */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <ImagePlus size={20} /> Upload Images
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Alt Text (optional)</label>
              <input value={alt} onChange={e => setAlt(e.target.value)} placeholder="Describe the image" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Image File(s)</label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:brightness-110" />
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP or GIF — max 5 MB per file.</p>
            </div>
            <button onClick={handleUpload} disabled={uploading} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-6 py-2 rounded hover:brightness-110 transition disabled:opacity-50">
              <Upload size={16} /> {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.length === 0 && <p className="col-span-full text-muted-foreground text-center py-8">No gallery images yet.</p>}
          {images.map((img) => (
            <ImageCard key={img.id} img={img} onDelete={handleDelete} onAltUpdate={fetchImages} />
          ))}
        </div>
    </AdminLayout>
  );
};

/* ───── Per-image card with inline alt edit ───── */
const ImageCard = ({
  img,
  onDelete,
  onAltUpdate,
}: {
  img: GalleryImage;
  onDelete: (img: GalleryImage) => void;
  onAltUpdate: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [altValue, setAltValue] = useState(img.alt);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateGalleryImage();

  const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(img.storage_path);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveAlt = async () => {
    const trimmed = altValue.trim();
    if (!trimmed) { setAltValue(img.alt); setEditing(false); return; }
    if (trimmed === img.alt) { setEditing(false); return; }
    try {
      await updateMutation.mutateAsync({ id: img.id, alt: trimmed });
      toast.success("Alt text updated");
    } catch (err: any) {
      toast.error("Error saving alt text", { description: err.message });
      setAltValue(img.alt);
    }
    setEditing(false);
  };

  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden border border-border">
      <img src={urlData.publicUrl} alt={img.alt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition flex items-center justify-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition p-2 bg-primary text-primary-foreground rounded-full"
          aria-label="Edit alt text"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(img)}
          className="opacity-0 group-hover:opacity-100 transition p-2 bg-destructive text-destructive-foreground rounded-full"
          aria-label="Delete image"
        >
          <Trash2 size={18} />
        </button>
      </div>
      {editing ? (
        <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 flex items-center">
          <input
            ref={inputRef}
            value={altValue}
            onChange={e => setAltValue(e.target.value)}
            onBlur={saveAlt}
            onKeyDown={e => { if (e.key === "Enter") saveAlt(); if (e.key === "Escape") { setAltValue(img.alt); setEditing(false); } }}
            className="flex-1 bg-transparent text-background text-xs px-2 py-1.5 outline-none placeholder:text-background/60"
            placeholder="Alt text…"
          />
          <button onClick={saveAlt} className="p-1 text-background/80 hover:text-background shrink-0" aria-label="Save">
            <Check size={14} />
          </button>
        </div>
      ) : (
        <p className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-xs px-2 py-1 truncate">
          {img.alt}
        </p>
      )}
    </div>
  );
};

export default AdminGallery;
