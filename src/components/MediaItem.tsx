
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MediaItemProps {
  url: string;
  type: string;
  caption?: string;
}

const MediaItem = ({ url, type, caption }: MediaItemProps) => {
  const isVideo = type.startsWith('video/');

  return (
    <AspectRatio ratio={16 / 9} className="bg-black">
      {isVideo ? (
        <video
          src={url}
          controls
          playsInline
          autoPlay
          muted
          loop
          className="object-cover w-full h-full"
        />
      ) : (
        <img
          src={url}
          alt={caption || "Gallery media"}
          className="object-cover w-full h-full"
        />
      )}
    </AspectRatio>
  );
};

export default MediaItem;
