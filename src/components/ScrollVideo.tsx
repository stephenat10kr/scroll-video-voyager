
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
  
  // Setup tap/touch simulation for mobile
  useEffect(() => {
    if (isMobile) {
      const simulateTouchInteraction = () => {
        console.log("Simulating touch interaction for mobile video activation");
        
        // Create and dispatch touch events to simulate user interaction
        const touchStartEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        const touchEndEvent = new TouchEvent('touchend', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        // Also create a click event as fallback
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        // Target both the document and video element
        document.dispatchEvent(touchStartEvent);
        document.dispatchEvent(touchEndEvent);
        document.dispatchEvent(clickEvent);
        
        // Also specifically target the video if it exists
        if (videoRef.current) {
          videoRef.current.dispatchEvent(touchStartEvent);
          videoRef.current.dispatchEvent(touchEndEvent);
          videoRef.current.dispatchEvent(clickEvent);
          
          // Force visibility through direct style manipulation
          videoRef.current.style.opacity = "1";
          videoRef.current.style.visibility = "visible";
          videoRef.current.style.display = "block";
        }
      };
      
      // Run the simulation after a short delay to ensure the page is ready
      const simulationTimeoutId = setTimeout(simulateTouchInteraction, 500);
      
      // Run it again after a slightly longer delay as backup
      const backupSimulationTimeoutId = setTimeout(simulateTouchInteraction, 1500);
      
      return () => {
        clearTimeout(simulationTimeoutId);
        clearTimeout(backupSimulationTimeoutId);
      };
    }
  }, [isMobile]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (video && secureVideoSrc) {
      // Immediately make video visible for mobile
      if (isMobile) {
        setVideoVisible(true);
        video.style.opacity = "1";
        video.style.visibility = "visible";
        video.style.display = "block";
      }
      
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
            video.style.opacity = "1";
          });
        }
      };
      
      // Add loadeddata event to ensure video is fully loaded before showing
      const handleLoadedData = () => {
        console.log("Video data loaded");
        setVideoVisible(true);
        // Ensure visibility on mobile
        if (isMobile) {
          video.style.opacity = "1";
          video.style.visibility = "visible";
        }
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleLoadedData);
      
      // Set a shorter timeout for mobile to ensure video appears quickly
      const timeoutId = setTimeout(() => {
        setVideoVisible(true);
        if (isMobile) {
          video.style.opacity = "1";
          video.style.visibility = "visible";
        }
      }, isMobile ? 100 : 300);
      
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
            transition: isMobile ? "none" : "opacity 0.3s ease-in-out",
            display: "block", // Ensure it's always displayed
            visibility: "visible" // Ensure it's always visible
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
