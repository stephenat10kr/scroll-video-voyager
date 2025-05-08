
import React from "react";
import MediaItem from "./MediaItem";
import { useGallery } from "@/hooks/useGallery";
import colors from "@/lib/theme";

interface GalleryProps {
  title: string;
  description: string;
  address?: string;
  mapUrl?: string;
}

const Gallery = ({ title, description, address, mapUrl }: GalleryProps) => {
  const { data: galleryItems, isLoading, error } = useGallery();

  return (
    <div className="py-24 w-full" style={{ backgroundColor: colors.darkGreen }}>
      <div className="max-w-[90%] mx-auto">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-3">
            <h2 className="title-sm" style={{ color: colors.roseWhite }}>
              {title}
            </h2>
          </div>

          <div className="col-span-12 md:col-span-6">
            <p className="mb-6" style={{ color: colors.roseWhite }}>
              {description}
            </p>

            {address && (
              <div className="mb-8">
                <p className="text-sm mb-2" style={{ color: colors.roseWhite }}>
                  {address}
                </p>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                    style={{ color: colors.roseWhite }}
                  >
                    View Map
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-gray-800 rounded"></div>
            <div className="h-48 bg-gray-800 rounded"></div>
          </div>
        )}

        {error && (
          <p className="text-center" style={{ color: colors.roseWhite }}>
            Failed to load gallery images
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems?.map((item) => (
            <MediaItem 
              key={item.id} 
              item={item} 
              textColor={colors.roseWhite}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
