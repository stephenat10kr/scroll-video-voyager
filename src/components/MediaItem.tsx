
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface MediaItemProps {
  url: string;
  type: string;
}

const MediaItem = ({ url, type }: MediaItemProps) => {
  const isVideo = type.startsWith('video/');

  if (isVideo) {
    return (
      <AspectRatio ratio={16 / 9} className="bg-black">
        <video
          src={url}
          controls
          playsInline
          autoPlay
          muted
          loop
          className="object-cover w-full h-full"
        />
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={16 / 9} className="bg-black">
      <img
        src={url}
        alt="Gallery media"
        className="object-cover w-full h-full"
      />
    </AspectRatio>
  );
};

export default MediaItem;
