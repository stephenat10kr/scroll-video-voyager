
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

  // For Android devices, check if this is a hero video that should be replaced with image sequence
  const shouldUseImageSequence = isAndroid && isVideo && url.includes('HeroTest');

  return (
    <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden">
      {isVideo && !shouldUseImageSequence ? (
        <video
          src={url}
          controls
          playsInline
          autoPlay
          muted
          loop
          preload="auto"
          className="object-cover w-full h-full rounded-lg"
        />
      ) : (
        <img
          src={shouldUseImageSequence ? '/image-sequence/LS_HeroSequence000.jpg' : url}
          alt={caption || "Gallery media"}
          className="object-cover w-full h-full rounded-lg"
        />
      )}
    </AspectRatio>
  );
};

export default MediaItem;
