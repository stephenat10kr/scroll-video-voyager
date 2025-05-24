
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import { useIsMobile } from "../hooks/use-mobile";
import { useIsAndroid } from "../hooks/use-android";

gsap.registerPlugin(ScrollTrigger);

// Increase scroll distance from 2000 to 4000
const SCROLL_EXTRA_PX = 4000;
const AFTER_VIDEO_EXTRA_HEIGHT = 0;

const ScrollVideo: React.FC<{
  src?: string;
  onReady?: () => void;
}> = ({
  src,
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const isMobile = useIsMobile();
  const isAndroid = useIsAndroid();
  
  // Ensure the src is secure (https) but don't provide a fallback URL
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;
  
  // Calculate segment count - increase for Android for smoother transitions
  const segmentCount = isAndroid ? 8 : 5;

  // Add intersection observer to detect when video exits viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { 
        threshold: 0.01,
        rootMargin: "0px"
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Handle video ready callback
  const handleVideoReady = () => {
    console.log("ScrollVideo: Video is ready");
    if (onReady) {
      onReady();
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen overflow-hidden bg-black"
    >
      <ScrollVideoPlayer 
        src={secureVideoSrc} 
        segmentCount={segmentCount} 
        onAfterVideoChange={setIsAfterVideo}
        onProgressChange={setProgress}
        videoRef={videoRef} 
        containerRef={containerRef} 
        SCROLL_EXTRA_PX={SCROLL_EXTRA_PX} 
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT} 
        isMobile={isMobile}
        onVideoReady={handleVideoReady}
      >
        <video 
          ref={videoRef} 
          src={secureVideoSrc} 
          playsInline 
          preload="auto" 
          loop={false} 
          muted 
          tabIndex={-1} 
          className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none bg-black" 
          style={{
            minHeight: "100vh",
            backgroundColor: "black",
            display: "block",
            visibility: "visible"
          }} 
        />
      </ScrollVideoPlayer>
    </div>
  );
};

export default ScrollVideo;
