
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
  pauseOnLoad?: boolean;
}> = ({
  src,
  pauseOnLoad = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
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
        
        // Always pause the video on load if pauseOnLoad is true
        if (pauseOnLoad) {
          console.log("Explicitly pausing video on load");
          video.pause();
        } else if (isMobile) {
          // For mobile with pauseOnLoad false, we still try to play
          video.play().catch(err => {
            console.error("Mobile video play error:", err);
            // If play fails, make sure to pause
            video.pause();
          });
        }
      };
      
      video.addEventListener("canplay", handleCanPlay);
      
      // Also pause immediately after setting the source
      if (pauseOnLoad && video.readyState >= 2) {
        console.log("Video already loaded, pausing immediately");
        video.pause();
      }
      
      return () => video.removeEventListener("canplay", handleCanPlay);
    }
  }, [secureVideoSrc, isMobile, pauseOnLoad]);

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
        pauseOnLoad={pauseOnLoad}
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
            opacity: videoLoaded ? 1 : 0
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
