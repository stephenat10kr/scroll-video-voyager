
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoScrollHint from "./ScrollVideoScrollHint";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import { useIsMobile } from "../hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

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
  const [videoVisible, setVideoVisible] = useState(false);
  const [textIndex, setTextIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;
  
  // Empty array for text overlay (effectively removing it)
  const textArray: string[] = [];
  
  // Calculate segment count (keeping this for ScrollVideoPlayer functionality)
  const segmentCount = 5;
  
  useEffect(() => {
    const video = videoRef.current;
    if (video && secureVideoSrc) {
      const handleCanPlay = () => {
        console.log("Video can play now");
        setVideoLoaded(true);
        setVideoVisible(true);
        
        // Always pause the video when it can play
        video.pause();
        console.log("Video paused on load");
        
        // For mobile, we still need to attempt play first to prepare the video
        // then immediately pause it to ensure it's ready for scrubbing
        if (isMobile) {
          video.play().then(() => {
            video.pause();
            console.log("Mobile video played then paused");
          }).catch(err => {
            console.error("Mobile video play error:", err);
            // Even if play fails, ensure video is visible
            setVideoVisible(true);
          });
        }
      };
      
      // Add loadeddata event to ensure video is fully loaded before showing
      const handleLoadedData = () => {
        console.log("Video data loaded");
        setVideoVisible(true);
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleLoadedData);
      
      // Set a timeout to ensure video appears even if events don't fire
      const timeoutId = setTimeout(() => {
        setVideoVisible(true);
      }, 300);
      
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", handleLoadedData);
        clearTimeout(timeoutId);
      };
    }
  }, [secureVideoSrc, isMobile]);

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
        videoRef={videoRef} 
        containerRef={containerRef} 
        SCROLL_EXTRA_PX={SCROLL_EXTRA_PX} 
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT} 
        isMobile={isMobile}
      >
        <video 
          ref={videoRef} 
          src={secureVideoSrc} 
          playsInline 
          preload="auto" 
          loop={false} 
          muted 
          tabIndex={-1} 
          className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black" 
          style={{
            minHeight: "100vh",
            opacity: videoVisible ? 1 : 0,
            transition: "opacity 0.3s ease-in-out"
          }} 
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
