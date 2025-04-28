
import React, { useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { CustomPrevButton, CustomNextButton } from "./CarouselCustomButtons";
import { useGallery } from "@/hooks/useGallery";
import MediaItem from "./MediaItem";

interface GalleryProps {
  title: string;
  description: string;
  address: string;
  mapUrl: string;
}

const Gallery: React.FC<GalleryProps> = ({ title, description, address, mapUrl }) => {
  const { data: mediaItems, isLoading, error } = useGallery();
  const api = React.useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const scrollPrev = React.useCallback(() => {
    api.current?.scrollPrev();
  }, []);
  
  const scrollNext = React.useCallback(() => {
    api.current?.scrollNext();
  }, []);

  // Update the current index when the carousel changes
  const onSelect = React.useCallback(() => {
    if (!api.current) return;
    setCurrentIndex(api.current.selectedScrollSnap());
  }, []);

  // Set up event listeners for the carousel
  React.useEffect(() => {
    if (!api.current) return;
    
    api.current.on("select", onSelect);
    api.current.on("reInit", onSelect);
    
    return () => {
      if (!api.current) return;
      api.current.off("select", onSelect);
    };
  }, [api, onSelect]);

  // For debugging
  React.useEffect(() => {
    if (mediaItems && mediaItems.length > 0) {
      console.log("Current index:", currentIndex);
      console.log("Current caption:", mediaItems[currentIndex]?.caption);
    }
  }, [currentIndex, mediaItems]);

  if (isLoading) {
    return (
      <div className="w-full bg-black py-24">
        <div className="max-w-[90%] mx-auto">
          <h2 className="text-white text-2xl mb-12">{title}</h2>
          <div className="w-full h-64 bg-gray-900 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error in Gallery component:', error);
    return (
      <div className="w-full bg-black py-24">
        <div className="max-w-[90%] mx-auto">
          <h2 className="text-white text-2xl mb-12">{title}</h2>
          <p className="text-white/70">Failed to load gallery images</p>
        </div>
      </div>
    );
  }

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="w-full bg-black py-24">
        <div className="max-w-[90%] mx-auto">
          <h2 className="text-white text-2xl mb-12">{title}</h2>
          <p className="text-white/70">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black py-24">
      <div className="max-w-[90%] mx-auto">
        <h2 className="text-white text-2xl mb-12">{title}</h2>
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12">
            <Carousel
              setApi={(carouselApi) => {
                api.current = carouselApi;
                // Force an initial selection event
                if (carouselApi) {
                  setTimeout(() => {
                    onSelect();
                  }, 0);
                }
              }}
              className="w-full"
            >
              <CarouselContent>
                {mediaItems?.map((item, index) => (
                  <CarouselItem key={index}>
                    <MediaItem url={item.url} type={item.type} caption={item.caption} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="flex justify-between items-center mt-4">
              <p className="text-white font-sans text-base">
                {mediaItems && currentIndex < mediaItems.length ? mediaItems[currentIndex]?.caption || '' : ''}
              </p>
              <div className="flex gap-4">
                <CustomPrevButton onClick={scrollPrev} />
                <CustomNextButton onClick={scrollNext} />
              </div>
            </div>
          </div>
          <div className="col-start-5 col-end-13 space-y-6 text-white">
            <p className="text-xl">{description}</p>
            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xl underline hover:text-gray-300 transition-colors"
            >
              {address}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
