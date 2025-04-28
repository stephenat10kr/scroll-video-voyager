
import React, { useRef, useEffect, useState } from "react";
import { useScrollVideoTrigger } from "../hooks/useScrollVideoTrigger";
import { 
  setupVideoElement, 
  setupContainerHeight, 
  assignVideoSource, 
  requestHighPriorityLoading, 
  tryLoadLowerResVersion 
} from "../utils/ScrollVideoController";

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
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
  onTextIndexChange,
  onAfterVideoChange,
  children,
  videoRef,
  containerRef,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
  isMobile,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { isLoaded: triggerLoaded, setupScrollTrigger, cleanup } = useScrollVideoTrigger({
    videoRef,
    containerRef,
    segmentCount,
    SCROLL_EXTRA_PX,
    isMobile,
    onTextIndexChange,
    onAfterVideoChange
  });

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !src) return;

    console.log("Mobile detection:", isMobile);
    console.log("Segment count:", segmentCount);

    // Set up video element
    setupVideoElement(video, isMobile);
    
    // Set up container height
    const resizeSection = () => {
      if (container) {
        setupContainerHeight(container, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT);
      }
    };
    
    resizeSection();
    window.addEventListener("resize", resizeSection);

    // Assign video source
    const loadVideo = async () => {
      await assignVideoSource(video, src, isMobile);
    };
    
    loadVideo();
    
    // Request high priority loading
    requestHighPriorityLoading(video);

    // Try lower resolution version for non-mobile
    if (!isMobile) {
      tryLoadLowerResVersion(src, video, isLoaded);
    }

    // Set up scroll trigger
    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      video.addEventListener("loadedmetadata", setupScrollTrigger);
      
      // Safety timeout - if metadata doesn't load in a reasonable time
      const timeoutId = setTimeout(() => {
        if (!triggerLoaded && video.readyState >= 1) {
          console.log("Setting up ScrollTrigger after timeout");
          setupScrollTrigger();
        }
      }, 1000);
      return () => clearTimeout(timeoutId);
    }

    // For mobile, attempt to trigger video playback after scroll
    if (isMobile) {
      const touchStart = () => {
        video.play().catch(err => console.log("Mobile play attempt:", err));
      };
      document.addEventListener('touchstart', touchStart, { once: true });
      return () => document.removeEventListener('touchstart', touchStart);
    }

    return () => {
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", setupScrollTrigger);
      cleanup();
    };
  }, [
    segmentCount, 
    SCROLL_EXTRA_PX, 
    AFTER_VIDEO_EXTRA_HEIGHT, 
    containerRef, 
    videoRef, 
    onTextIndexChange, 
    onAfterVideoChange, 
    src, 
    isLoaded, 
    isMobile, 
    setupScrollTrigger, 
    cleanup, 
    triggerLoaded
  ]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
