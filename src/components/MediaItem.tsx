
import React, { useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use effect to ensure video plays on Android
  useEffect(() => {
    if (isVideo && isAndroid && videoRef.current) {
      console.log("Android MediaItem - attempting to play video");
      
      // Set loop on Android
      videoRef.current.loop = true;
      
      // Force play on Android
      const playPromise = videoRef.current.play();
      
      // Handle play promise
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Android video play failed in MediaItem:", error);
          
          // Try again after a short delay
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play().catch(e => 
                console.log("Second play attempt failed:", e)
              );
            }
          }, 300);
        });
      }
    }
  }, [isVideo, isAndroid, url]);

  return (
    <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden">
      {isVideo ? (
        <video
          ref={videoRef}
          src={url}
          controls={false} // Never show controls
          playsInline
          autoPlay={isAndroid} // Auto play on Android
          muted={!isAndroid} // Only mute on non-Android
          loop={true} // Always loop videos
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
