import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import SEO from "@/components/SEO";
import { useGalleryImages } from "@/hooks/queries";

// Static fallback images
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

const fallbackImages = [
  { src: gallery1, alt: "Cricket pitch overhead view" },
  { src: gallery2, alt: "Team celebration on the field" },
  { src: gallery3, alt: "Bat hitting the ball" },
  { src: gallery4, alt: "Training in the nets" },
  { src: gallery5, alt: "Team photo" },
  { src: gallery6, alt: "Stumps at sunset" },
];

const Gallery = () => {
  const { data: dbImages, isLoading: loading } = useGalleryImages();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const images = useMemo(() => {
    if (!dbImages || dbImages.length === 0) return fallbackImages;
    return dbImages.map((img) => {
      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(img.storage_path);
      return { src: urlData.publicUrl, alt: img.alt };
    });
  }, [dbImages]);

  const filtered = search.trim()
    ? images.filter((img) => img.alt.toLowerCase().includes(search.toLowerCase()))
    : images;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  }, [lightboxIndex, filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxIndex, goNext, goPrev, closeLightbox]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  return (
    <div>
      <SEO title="Gallery" description="Photos and moments from Helsingborg United Sports Club." path="/gallery" />
      <PageHeader title="Gallery" subtitle="Moments from the pitch" />
      <div className="container mx-auto px-4 py-16">
        {/* Search filter */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by description…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {search ? "No images match your search." : "No gallery images yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((img, i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-lg group cursor-pointer relative"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition flex items-end">
                  <p className="w-full bg-foreground/50 text-background text-xs px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    {img.alt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10" onClick={closeLightbox} aria-label="Close lightbox">
            <X size={24} />
          </button>
          <div className="absolute top-4 left-4 text-white/70 text-sm font-display">{lightboxIndex + 1} / {filtered.length}</div>
          {filtered.length > 1 && (
            <button className="absolute left-2 md:left-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10" onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous image">
              <ChevronLeft size={28} />
            </button>
          )}
          <img src={filtered[lightboxIndex].src} alt={filtered[lightboxIndex].alt} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          {filtered.length > 1 && (
            <button className="absolute right-2 md:right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10" onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next image">
              <ChevronRight size={28} />
            </button>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm text-center max-w-lg px-4">{filtered[lightboxIndex].alt}</div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
