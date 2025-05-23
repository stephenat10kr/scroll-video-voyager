
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsAndroid } from "@/hooks/use-android";

interface MediaItemProps {
  url: string;
  type: string;
  caption?: string;
}

const MediaItem = ({ url, type, caption }: MediaItemProps) => {
  const isVideo = type.startsWith('video/');
  const isAndroid = useIsAndroid();

  return (
    <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden">
      {isVideo ? (
        <video
          src={url}
          controls={false} // Never show controls
          playsInline
          autoPlay={isAndroid} // Auto play on Android
          muted={!isAndroid} // Only mute on non-Android
          loop
          preload="auto"
          className="object-cover w-full h-full rounded-lg"
        />
      ) : (
        <img
          src={url}
          alt={caption || "Gallery media"}
          className="object-cover w-full h-full rounded-lg"
        />
      )}
    </AspectRatio>
  );
};

export default MediaItem;
