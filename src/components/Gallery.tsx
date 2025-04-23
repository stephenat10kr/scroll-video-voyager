
import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

interface GalleryProps {
  title: string;
  images: string[];
  description: string;
  address: string;
  mapUrl: string;
}

const Gallery: React.FC<GalleryProps> = ({ title, images, description, address, mapUrl }) => {
  return (
    <div className="w-full bg-black py-24">
      <div className="grid grid-cols-12 max-w-[90%] mx-auto">
        <div className="col-span-3">
          <h2 className="text-white text-2xl">{title}</h2>
        </div>
        <div className="col-span-9">
          <div className="mb-12">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[16/9]">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="text-white" />
              <CarouselNext className="text-white" />
            </Carousel>
          </div>
          <div className="space-y-6 text-white">
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
