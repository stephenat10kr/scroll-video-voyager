
import React, { useRef, useEffect } from "react";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import VideoElement from "./video/VideoElement";
import { useIsMobile } from "../hooks/use-mobile";
import { useIsIOS } from "@/hooks/use-ios";
import { useVideoIntersection } from "@/hooks/use-video-intersection";
import { useVideoInitialization } from "@/hooks/use-video-initialization";
import { useVideoProgress } from "@/hooks/use-video-progress";
import {
  DEFAULT_SCROLL_EXTRA_PX,
  IOS_SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
  DEFAULT_SEGMENT_COUNT
} from "@/config/scroll-video-config";

const ScrollVideo: React.FC<{
  src?: string;
}> = ({
  src
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Detect device types
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();
  
  // Process video source
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;
  
  // Always use IOS_SCROLL_EXTRA_PX for iOS devices to ensure consistent 600% scroll
  const SCROLL_EXTRA_PX = isIOS ? IOS_SCROLL_EXTRA_PX : DEFAULT_SCROLL_EXTRA_PX;
  
  // Initialize hooks
  const isInViewport = useVideoIntersection(containerRef);
  const { videoVisible } = useVideoInitialization(videoRef, secureVideoSrc);
  const { 
    progress, 
    isAfterVideo,
    lastProgress,
    handleProgressChange,
    handleAfterVideoChange,
    setLastProgress
  } = useVideoProgress();
  
  // Update video transition effects based on scroll direction
  useEffect(() => {
    if (progress > lastProgress) {
      // Scrolling down - set immediate transition
      if (videoRef.current) {
        videoRef.current.style.transition = "opacity 0s";
      }
    } else {
      // Scrolling up - set smooth transition
      if (videoRef.current) {
        videoRef.current.style.transition = "opacity 0.3s ease-in-out";
      }
    }
    setLastProgress(progress);
  }, [progress, lastProgress, setLastProgress]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen overflow-hidden bg-black" 
      style={{ zIndex: 1 }}
    >
      <ScrollVideoPlayer 
        src={secureVideoSrc} 
        segmentCount={DEFAULT_SEGMENT_COUNT} 
        onAfterVideoChange={handleAfterVideoChange}
        onProgressChange={handleProgressChange}
        videoRef={videoRef} 
        containerRef={containerRef} 
        SCROLL_EXTRA_PX={SCROLL_EXTRA_PX} 
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT} 
        isMobile={isMobile}
      >
        <VideoElement
          videoRef={videoRef}
          src={secureVideoSrc}
          videoVisible={videoVisible}
          isInViewport={isInViewport}
        />
      </ScrollVideoPlayer>
    </div>
  );
};

export default ScrollVideo;
