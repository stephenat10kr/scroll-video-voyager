
import React, { useEffect, useState } from "react";
import { useScrollTrigger } from "../hooks/useScrollTrigger";
import { setupVideoElement } from "../utils/videoSetup";
import { setupContainerResize } from "../utils/containerResize";
import ScrollVideoSegment from "./ScrollVideoSegment";

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
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
  onTextIndexChange,
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
  const [progress, setProgress] = useState(0);

  // Handle video source and setup
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Segment count:", segmentCount);

    // Set up video element with optimized settings
    setupVideoElement(video, isMobile);

    // Handle video source
    if (!src) {
      console.log("[ScrollVideo] No src provided.");
      return;
    }

    // For mobile or desktop, use the provided source
    if (video.src !== src) {
      video.src = src;
      const extension = src.split(".").pop() || "unknown";
      console.log(`[ScrollVideo] Assigned ${extension.toUpperCase()} video source: ${src}`);
    }

    // Set up container resizing
    const cleanupResize = setupContainerResize(
      container, 
      SCROLL_EXTRA_PX, 
      AFTER_VIDEO_EXTRA_HEIGHT
    );

    setIsLoaded(true);
    
    return cleanupResize;
  }, [src, videoRef, containerRef, isMobile, segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT]);

  // Handle progress updates
  const handleProgress = (newProgress: number) => {
    setProgress(newProgress);
    if (onProgressChange) {
      onProgressChange(newProgress);
    }
  };

  // Use the scroll trigger hook to handle scrolling
  useScrollTrigger({
    videoRef,
    containerRef,
    SCROLL_EXTRA_PX,
    isMobile,
    onProgress: handleProgress,
    isLoaded,
  });

  return (
    <>
      {children}
      <ScrollVideoSegment
        progress={progress}
        segmentCount={segmentCount}
        onTextIndexChange={onTextIndexChange}
        onAfterVideoChange={onAfterVideoChange}
      />
    </>
  );
};

export default ScrollVideoPlayer;
