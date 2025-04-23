
import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
      <div className="max-w-[90%] mx-auto">
        <h2 className="text-white text-2xl mb-12">{title}</h2>
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12">
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <AspectRatio ratio={16 / 9} className="bg-black">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-end gap-1 mt-4 w-full">
                <CarouselPrevious className="static relative h-8 w-8 rounded-full text-white translate-y-0 translate-x-0" />
                <CarouselNext className="static relative h-8 w-8 rounded-full text-white translate-y-0 translate-x-0" />
              </div>
            </Carousel>
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
