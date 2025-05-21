
import React, { useRef } from "react";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import Spinner from "./Spinner";
import { useIsIOS } from "@/hooks/useIsIOS";
import { useIsAndroid } from "@/hooks/use-android";
import { useVideoInitialization } from "@/hooks/useVideoInitialization";
import { useVideoScrollAnimation } from "@/hooks/useVideoScrollAnimation";

interface ImprovedScrollVideoProps {
  src?: string; // Make the src prop optional
  onReady?: () => void; // Add onReady callback
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({ 
  src: externalSrc, 
  onReady 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isIOS = useIsIOS();
  const isAndroid = useIsAndroid();
  
  // Use our custom hooks
  const { 
    videoRef, 
    isVideoLoaded, 
    handleVideoLoaded 
  } = useVideoInitialization({ onReady });
  
  // For debugging
  React.useEffect(() => {
    if (isIOS) {
      console.log("iOS device detected in ImprovedScrollVideo component");
    }
    if (isAndroid) {
      console.log("Android device detected in ImprovedScrollVideo component");
    }
  }, [isIOS, isAndroid]);
  
  const { data: heroVideoAsset, isLoading } = useContentfulAsset(HERO_VIDEO_ASSET_ID);
  
  // Use external src if provided, otherwise use the one from Contentful
  const videoSrc = externalSrc || (heroVideoAsset?.fields?.file?.url 
    ? (heroVideoAsset.fields.file.url.startsWith('//') 
        ? 'https:' + heroVideoAsset.fields.file.url 
        : heroVideoAsset.fields.file.url)
    : undefined);

  // Use the scroll animation hook
  useVideoScrollAnimation({
    videoRef,
    containerRef,
    isVideoLoaded
  });

  return (
    <div ref={containerRef} className="video-container w-full h-screen">
      {/* Show loading state if video is still loading */}
      {(isLoading || !isVideoLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Spinner />
        </div>
      )}
      
      {videoSrc && (
        <video 
          ref={videoRef}
          className="w-full h-full object-cover pointer-events-none"
          style={{ 
            backgroundColor: 'black',
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
          playsInline={true}
          webkit-playsinline="true" 
          preload="auto"
          muted={true}
          autoPlay={isIOS ? true : false}
          controls={false}
          onLoadedData={handleVideoLoaded}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      )}
    </div>
  );
};

export default ImprovedScrollVideo;
