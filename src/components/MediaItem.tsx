
import React from "react";
import { AspectRatio } from "./ui/aspect-ratio";
import colors from "@/lib/theme";

interface MediaItemProps {
  item: {
    id: string;
    mediaUrl: string;
    caption?: string;
    type?: string;
  };
  textColor?: string;
}

const MediaItem = ({ item, textColor = colors.darkGreen }: MediaItemProps) => {
  const isVideo = item.type?.includes('video');
  
  return (
    <div className="mb-8">
      <AspectRatio ratio={3 / 2} className="rounded-lg overflow-hidden mb-2">
        {isVideo ? (
          <video 
            src={item.mediaUrl} 
            controls
            className="object-cover w-full h-full"
          />
        ) : (
          <img 
            src={item.mediaUrl} 
            alt={item.caption || "Gallery image"} 
            className="object-cover w-full h-full" 
          />
        )}
      </AspectRatio>
      {item.caption && (
        <p className="text-sm" style={{ color: textColor }}>
          {item.caption}
        </p>
      )}
    </div>
  );
};

export default MediaItem;
