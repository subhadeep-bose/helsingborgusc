import PageHeader from "@/components/PageHeader";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

const images = [
  { src: gallery1, alt: "Cricket pitch overhead view" },
  { src: gallery2, alt: "Team celebration on the field" },
  { src: gallery3, alt: "Bat hitting the ball" },
  { src: gallery4, alt: "Training in the nets" },
  { src: gallery5, alt: "Team photo" },
  { src: gallery6, alt: "Stumps at sunset" },
];

const Gallery = () => (
  <div>
    <PageHeader title="Gallery" subtitle="Moments from the pitch" />
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="aspect-square overflow-hidden rounded-lg group cursor-pointer"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Gallery;
