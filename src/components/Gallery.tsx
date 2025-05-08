import React, { useState, useCallback, useEffect } from "react";
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
  
  const scrollPrev = useCallback(() => {
    api.current?.scrollPrev();
    // Wait briefly for the scroll to complete, then manually update the current index
    setTimeout(() => {
      if (api.current) {
        const index = api.current.selectedScrollSnap();
        console.log("scrollPrev - new index:", index);
        setCurrentIndex(index);
      }
    }, 50);
  }, []);
  
  const scrollNext = useCallback(() => {
    api.current?.scrollNext();
    // Wait briefly for the scroll to complete, then manually update the current index
    setTimeout(() => {
      if (api.current) {
        const index = api.current.selectedScrollSnap();
        console.log("scrollNext - new index:", index);
        setCurrentIndex(index);
      }
    }, 50);
  }, []);

  // Update the current index when the carousel changes
  const onSelect = useCallback(() => {
    if (!api.current) return;
    const newIndex = api.current.selectedScrollSnap();
    console.log("onSelect triggered, new index:", newIndex);
    setCurrentIndex(newIndex);
  }, []);

  // Set up event listeners for the carousel
  useEffect(() => {
    if (!api.current) return;
    
    console.log("Setting up carousel event listeners");
    const onSelectHandler = () => {
      console.log("Select event triggered");
      onSelect();
    };
    
    api.current.on("select", onSelectHandler);
    api.current.on("reInit", onSelectHandler);
    
    return () => {
      if (!api.current) return;
      console.log("Removing carousel event listeners");
      api.current.off("select", onSelectHandler);
      api.current.off("reInit", onSelectHandler);
    };
  }, [api, onSelect]);

  // For debugging
  useEffect(() => {
    if (mediaItems && mediaItems.length > 0) {
      console.log("Current index:", currentIndex);
      console.log("Current media item:", mediaItems[currentIndex]);
      console.log("Current caption:", mediaItems[currentIndex]?.caption);
    }
  }, [currentIndex, mediaItems]);

  if (isLoading) {
    return (
      <div className="w-full bg-[#203435] py-24">
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
      <div className="w-full bg-[#203435] py-24">
        <div className="max-w-[90%] mx-auto">
          <h2 className="text-white text-2xl mb-12">{title}</h2>
          <p className="text-white/70 text-sm">Failed to load gallery images</p>
        </div>
      </div>
    );
  }

  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="w-full bg-[#203435] py-24">
        <div className="max-w-[90%] mx-auto">
          <h2 className="text-white text-2xl mb-12">{title}</h2>
          <p className="text-white/70 text-sm">No media available</p>
        </div>
      </div>
    );
  }

  // Make sure we're getting the caption for the current item
  const currentCaption = mediaItems[currentIndex]?.caption || '';
  console.log("Rendering with currentCaption:", currentCaption);

  return (
    <div className="w-full bg-[#203435] py-24">
      <div className="max-w-[90%] mx-auto">
        <h2 className="text-white text-2xl mb-12">{title}</h2>
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12">
            <Carousel
              setApi={(carouselApi) => {
                api.current = carouselApi;
                // Force an initial selection event
                if (carouselApi) {
                  console.log("Carousel API initialized");
                  setTimeout(() => {
                    console.log("Forcing initial selection");
                    onSelect();
                  }, 100); 
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
              <div className="text-white font-sans text-sm">
                {currentCaption}
              </div>
              <div className="flex gap-4">
                <CustomPrevButton onClick={scrollPrev} className="bg-transparent hover:bg-transparent" />
                <CustomNextButton onClick={scrollNext} className="bg-transparent hover:bg-transparent" />
              </div>
            </div>
          </div>
          <div className="col-start-5 col-end-13 space-y-6 text-white">
            <p className="text-sm">{description}</p>
            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm underline hover:text-gray-300 transition-colors"
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
