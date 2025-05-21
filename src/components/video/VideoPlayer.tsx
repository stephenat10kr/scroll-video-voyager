
import React, { useState, useEffect } from "react";
import { useScrollTrigger } from "../../hooks/use-scroll-trigger";
import { useVideoOptimization } from "../../hooks/use-video-optimization";
import { useIsIOS } from "@/hooks/use-ios";
import { logDebugInfo } from "@/hooks/scroll-video/scroll-utils";

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
      logDebugInfo("VideoPlayer", "Video playback system fully loaded");
    }
  }, [isSetupComplete, isLoaded]);

  // Handle video source assignment - simplified approach
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Only update if source changed
    if (video.src !== src) {
      logDebugInfo("VideoPlayer", `Setting video source: ${src}`);
      
      // Set src and force loading
      video.src = src;
      video.load();
      
      // Ensure first frame is shown
      video.currentTime = 0.001;
      
      // Add error handling
      const handleError = () => {
        logDebugInfo("VideoPlayer", "Error loading video source");
      };
      
      video.addEventListener('error', handleError);
      
      return () => {
        video.removeEventListener('error', handleError);
      };
    }
  }, [src, videoRef]);

  return <>{children}</>;
};

export default VideoPlayer;
