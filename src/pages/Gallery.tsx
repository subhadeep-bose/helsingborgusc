import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

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
  const [images, setImages] = useState<{ src: string; alt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("gallery_images")
      .select("id, alt, storage_path")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = data.map((img) => {
            const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(img.storage_path);
            return { src: urlData.publicUrl, alt: img.alt };
          });
          setImages(mapped);
        } else {
          setImages(fallbackImages);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <SEO title="Gallery" description="Photos and moments from Helsingborg United Sports Club." path="/gallery" />
      <PageHeader title="Gallery" subtitle="Moments from the pitch" />
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg group cursor-pointer">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
