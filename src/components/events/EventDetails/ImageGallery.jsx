"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

const normalizeUrl = (url) => {
  return url.replace(/\\\//g, "/");
};

const fileNameFromUrl = (url) => {
  try {
    const pathname = url.split("/").pop() || "";
    const nameWithoutExt = pathname.split(".")[0];
    return decodeURIComponent(nameWithoutExt.replace(/_/g, " "));
  } catch {
    return "Event photo";
  }
};

const EventPhotoGallery = ({ eventPhotos = [] }) => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const photos = useMemo(() => {
    let photosArray = eventPhotos;

    // Parse if it's a JSON string
    if (typeof eventPhotos === "string") {
      try {
        photosArray = JSON.parse(eventPhotos);
      } catch (error) {
        console.error("Failed to parse eventPhotos:", error);
        return [];
      }
    }

    // Ensure it's an array after parsing
    if (!Array.isArray(photosArray)) {
      console.warn("eventPhotos is not an array:", photosArray);
      return [];
    }

    return photosArray.map((url, i) => {
      const normalizedUrl = normalizeUrl(url);
      const title = fileNameFromUrl(normalizedUrl);

      return {
        src: normalizedUrl,
        alt: `Event photo ${i + 1}`,
        title,
      };
    });
  }, [eventPhotos]);

  const slides = useMemo(
    () =>
      photos.map((p) => ({
        src: p.src,
        alt: p.alt,
        title: p.title,
      })),
    [photos]
  );

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  if (photos.length === 0) {
    return null;
  }

  const displayPhotos = photos.slice(0, 4);
  const remainingCount = Math.max(0, photos.length - 4);

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col">
          <h2 className="section-title mb-4">Event photos</h2>

          <div className="row g-4">
            {displayPhotos.map((photo, index) => (
              <div key={photo.src} className="col-6 col-md-3">
                <div
                  className="photo-thumbnail-card card border-0 h-100"
                  onClick={() => handleThumbnailClick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleThumbnailClick(index);
                    }
                  }}
                >
                  <div className="position-relative overflow-hidden rounded">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={300}
                      height={200}
                      className="card-img-top photo-thumbnail-img rounded-4"
                      loading={index < 2 ? "eager" : "lazy"}
                      unoptimized
                    />

                    <div className="photo-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end p-3">
                      <div className="text-white fw-bold" style={{ fontSize: '14px' }}>
                        {photo.title}
                      </div>
                    </div>

                    {index === 3 && remainingCount > 0 && (
                      <div
                        className="photo-count-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          zIndex: 10,
                        }}
                      >
                        <span className="text-white display-4 fw-bold">
                          +{remainingCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Lightbox
            open={open}
            close={() => setOpen(false)}
            slides={slides}
            index={currentIndex}
            plugins={[Thumbnails, Zoom]}
            thumbnails={{
              position: "bottom",
              width: 80,
              height: 60,
              border: 2,
              borderRadius: 8,
              padding: 4,
              gap: 8,
              imageFit: "cover",
            }}
            zoom={{
              maxZoomPixelRatio: 3,
              zoomInMultiplier: 2,
              scrollToZoom: true,
            }}
            carousel={{
              padding: 0,
              spacing: 30,
              imageFit: "contain",
            }}
            controller={{
              closeOnPullDown: true,
              closeOnBackdropClick: true,
            }}
            styles={{
              container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
              thumbnailsContainer: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EventPhotoGallery;
