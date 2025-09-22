import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { useState } from "react";
import Image from "next/image";

const EventPhotoGallery = () => {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample event photos data - using Unsplash for demo
  const eventPhotos = [
    {
      src: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=1200&h=800&fit=crop&q=80',
      alt: 'Mineral Water Event',
      title: 'MINERAL WATER ON US',
      thumbnail: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=300&h=200&fit=crop&q=80'
    },
    {
      src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=800&fit=crop&q=80',
      alt: 'Photo Memories',
      title: 'PHOTO MEMORIES OF US',
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop&q=80'
    },
    {
      src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=800&fit=crop&q=80',
      alt: 'Gourmet Food',
      title: 'GOURMET FOOD ON US',
      thumbnail: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop&q=80'
    },
    {
      src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&h=800&fit=crop&q=80',
      alt: 'Specialty Coffee',
      title: 'SPECIALTY COFFEE ON US',
      thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop&q=80'
    },
    {
      src: 'https://images.unsplash.com/photo-1571167384394-8d4b2d4d5a18?w=1200&h=800&fit=crop&q=80',
      alt: 'Evening Drinks',
      title: 'EVENING DRINKS ON US',
      thumbnail: 'https://images.unsplash.com/photo-1571167384394-8d4b2d4d5a18?w=300&h=200&fit=crop&q=80'
    },
    {
      src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop&q=80',
      alt: 'Live Music',
      title: 'LIVE MUSIC ON US',
      thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop&q=80'
    },
    {
      src: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&h=800&fit=crop&q=80',
      alt: 'Networking Event',
      title: 'NETWORKING ON US',
      thumbnail: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=200&fit=crop&q=80'
    },
    {
      src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop&q=80',
      alt: 'Entertainment',
      title: 'ENTERTAINMENT ON US',
      thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop&q=80'
    }
  ];

  // Convert to YARL format
  const slides = eventPhotos.map(photo => ({
    src: photo.src,
    alt: photo.alt,
    title: photo.title
  }));

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const displayPhotos = eventPhotos.slice(0, 4); // Show first 4 photos
  const remainingCount = eventPhotos.length - 4;


  return (
    <div className="container py-5">
      <div className="row">
        <div className="col">
          <h2 className="section-title mb-4">Event photos</h2>
          
          {/* Photo Grid using Bootstrap Grid */}
          <div className="row g-4">
            {displayPhotos.map((photo, index) => (
              <div key={index} className="col-6 col-md-3">
                <div 
                  className="photo-thumbnail-card card border-0 h-100"
                  onClick={() => handleThumbnailClick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleThumbnailClick(index);
                    }
                  }}
              >
                  <div className="position-relative overflow-hidden rounded">
                    <Image 
                      src={photo.thumbnail} 
                      alt={photo.alt}
                      width={300}
                      height={200}
                      className="card-img-top photo-thumbnail-img rounded-4"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                    
                    {/* Photo Title Overlay */}
                    <div className="photo-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end p-3">
                      <div className="text-white fw-bold small">
                        {photo.title.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                    
                    {/* +Count Overlay for last image */}
                    {index === 3 && remainingCount > 0 && (
                      <div 
                        className="photo-count-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          zIndex: 10
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
        </div>
      </div>

      {/* YARL Lightbox */}
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
          imageFit: "cover"
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true
        }}
        carousel={{
          padding: 0,
          spacing: 30,
          imageFit: "contain"
        }}
        controller={{
          closeOnPullDown: true,
          closeOnBackdropClick: true
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
          thumbnailsContainer: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
          thumbnail: { 
            border: "2px solid transparent",
            borderRadius: "8px",
            overflow: "hidden"
          },
          thumbnailCurrent: { 
            border: "2px solid #ffffff"
          }
        }}
        render={{
          iconClose: () => (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ),
          iconPrev: () => (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          ),
          iconNext: () => (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          )
        }}
      />
    </div>
  );
};

export default EventPhotoGallery;