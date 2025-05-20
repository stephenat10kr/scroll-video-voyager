
import React, { useState, useEffect } from "react";
import { useScrollTrigger } from "../../hooks/use-scroll-trigger";
import { useVideoOptimization } from "../../hooks/use-video-optimization";
import { useIsIOS } from "@/hooks/use-ios";

// Check if browser is Firefox
const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

interface VideoPlayerProps {
  src?: string;
  segmentCount: number;
  onAfterVideoChange: (after: boolean) => void;
  onProgressChange?: (progress: number) => void;
  children?: React.ReactNode;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  scrollExtraPx: number;
  afterVideoExtraHeight: number;
  isMobile: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  onAfterVideoChange,
  onProgressChange,
  children,
  videoRef,
  containerRef,
  scrollExtraPx,
  afterVideoExtraHeight,
  isMobile,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Check if we're on iOS using our custom hook
  const isIOS = useIsIOS();
  
  // Apply device-specific video optimizations
  useVideoOptimization({ 
    videoRef, 
    isMobile, 
    isIOS, 
    isFirefox 
  });

  // Set up scroll trigger for video scrubbing
  const { isSetupComplete } = useScrollTrigger({
    containerRef,
    videoRef,
    onProgressUpdate: (progress) => {
      if (onProgressChange) {
        onProgressChange(progress);
      }
    },
    onAfterVideoChange,
    scrollExtraPx,
    isMobile,
    isIOS,
    isFirefox,
  });

  // Mark video as loaded when scroll trigger setup is complete
  useEffect(() => {
    if (isSetupComplete && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isSetupComplete, isLoaded]);

  // Handle video source assignment
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (video.src !== src) {
      video.src = src;
      const extension = src.split(".").pop() || "unknown";
      console.log(`[VideoPlayer] Assigned ${extension.toUpperCase()} video source: ${src}`);
    }
  }, [src, videoRef]);

  return <>{children}</>;
};

export default VideoPlayer;
