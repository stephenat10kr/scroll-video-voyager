
import React, { useRef, useState } from "react";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoElement from "./ScrollVideoElement";
import ScrollVideoScrollHint from "./ScrollVideoScrollHint";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import { useIsMobile } from "../hooks/use-mobile";

// Increase scroll distance
const SCROLL_EXTRA_PX = 2000;
const AFTER_VIDEO_EXTRA_HEIGHT = 0;

const ScrollVideo: React.FC<{
  src?: string;
}> = ({
  src
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [textIndex, setTextIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();
  
  // Ensure the src URL has the correct protocol for iOS
  let secureVideoSrc = undefined;
  if (src) {
    secureVideoSrc = src.replace(/^\/\//, 'https://');
    secureVideoSrc = secureVideoSrc.replace(/^http:/, 'https:');
    console.log("Video source URL:", secureVideoSrc);
  }
  
  // Empty array for text overlay (effectively removing it)
  const textArray: string[] = [];
  
  // Calculate segment count (keeping this for ScrollVideoPlayer functionality)
  const segmentCount = 5;

  // Handle video loaded state change
  const handleVideoLoadedChange = (loaded: boolean) => {
    console.log("[ScrollVideo] Video loaded state changed:", loaded);
    setVideoLoaded(loaded);
  };
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen overflow-hidden bg-black" 
      style={{ zIndex: 1 }}
    >
      <ScrollVideoPlayer 
        src={secureVideoSrc} 
        segmentCount={segmentCount} 
        onTextIndexChange={setTextIndex} 
        onAfterVideoChange={setIsAfterVideo}
        onProgressChange={setProgress}
        onLoadedChange={handleVideoLoadedChange}
        videoRef={videoRef} 
        containerRef={containerRef} 
        SCROLL_EXTRA_PX={SCROLL_EXTRA_PX} 
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT} 
        isMobile={isMobile}
      >
        <ScrollVideoElement
          videoRef={videoRef}
          src={secureVideoSrc}
          videoLoaded={videoLoaded}
        />
      </ScrollVideoPlayer>

      <ScrollVideoTextOverlay 
        texts={textArray}
        currentTextIndex={textIndex}
        progress={progress}
        containerRef={containerRef}
      />

      {!isAfterVideo && <ScrollVideoScrollHint />}
    </div>
  );
};

export default ScrollVideo;
