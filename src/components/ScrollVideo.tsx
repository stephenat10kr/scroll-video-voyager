import React, { useRef, useState, useEffect } from "react";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoElement from "./ScrollVideoElement";
import ScrollVideoScrollHint from "./ScrollVideoScrollHint";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import { useIsMobile } from "../hooks/use-mobile";

// Increase scroll distance to give more room for scrubbing
const SCROLL_EXTRA_PX = 3000;  // Increased from 2000
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
  
  // Update progress for debugging
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    console.log(`[ScrollVideo] Progress: ${Math.round(newProgress * 100)}%`);
  };
  
  // Log to browser console for debugging iOS issues
  useEffect(() => {
    if (isMobile) {
      console.log("Running on mobile device");
      
      // Force a repaint for iOS Safari which sometimes needs this
      if (videoRef.current) {
        setTimeout(() => {
          if (videoRef.current) {
            const display = videoRef.current.style.display;
            videoRef.current.style.display = 'none';
            // Force a repaint by accessing offsetHeight
            videoRef.current.offsetHeight;
            videoRef.current.style.display = display;
          }
        }, 100);
      }
    }
  }, [videoLoaded, isMobile]);
  
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
        onProgressChange={handleProgressChange}
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
