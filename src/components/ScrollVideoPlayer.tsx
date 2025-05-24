
import React, { useRef, useEffect, useState } from "react";
import { useIsAndroid } from "../hooks/use-android";
import { useVideoScrollTrigger } from "../hooks/useVideoScrollTrigger";
import { optimizeVideoElement } from "../utils/videoUtils";

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onAfterVideoChange: (after: boolean) => void;
  onProgressChange?: (progress: number) => void;
  children?: React.ReactNode;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  AFTER_VIDEO_EXTRA_HEIGHT: number;
  isMobile: boolean;
};

const ScrollVideoPlayer: React.FC<ScrollVideoPlayerProps> = ({
  src,
  segmentCount,
  onAfterVideoChange,
  onProgressChange,
  children,
  videoRef,
  containerRef,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
  isMobile,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isAndroid = useIsAndroid();
  
  const { setupScrollTrigger, cleanup } = useVideoScrollTrigger({
    videoRef,
    containerRef,
    SCROLL_EXTRA_PX,
    onAfterVideoChange,
    onProgressChange,
    isMobile,
    isAndroid,
  });

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Android detection:", isAndroid);
    console.log("Segment count:", segmentCount);

    // Optimize video element
    const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    optimizeVideoElement(video, isMobile, isAndroid, isFirefox);
    console.log("Video paused during initialization");

    // Set video source
    if (!src) {
      console.log("[ScrollVideo] No src provided.");
      return;
    }

    if (video.src !== src) {
      video.src = src;
      const extension = src.split(".").pop() || "unknown";
      console.log(`[ScrollVideo] Assigned ${extension.toUpperCase()} video source: ${src}`);
    }

    // Setup container height
    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

    // Setup video loading handlers
    const setupEvents = ['loadedmetadata', 'canplay', 'loadeddata'];
      
    const handleVideoReady = () => {
      console.log("Setting up ScrollTrigger after video event");
      setupScrollTrigger();
      setIsLoaded(true);
      
      // Clean up event listeners after setup
      setupEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
    };
    
    setupEvents.forEach(event => {
      video.addEventListener(event, handleVideoReady);
    });

    // For mobile devices, set up ScrollTrigger even without duration
    if (isMobile) {
      setupScrollTrigger();
      setIsLoaded(true);
    } else if (video.readyState >= 2) {
      setupScrollTrigger();
      setIsLoaded(true);
    }
    
    // Safety timeout to ensure ScrollTrigger gets set up
    const timeoutId = setTimeout(() => {
      console.log("Setting up ScrollTrigger after timeout");
      setupScrollTrigger();
      setIsLoaded(true);
    }, 300);
    
    return () => {
      window.removeEventListener("resize", resizeSection);
      setupEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, onProgressChange, src, isLoaded, isMobile, isAndroid, setupScrollTrigger, cleanup]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
