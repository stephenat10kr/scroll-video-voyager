
import React, { useEffect } from "react";
import VideoPlayer from "./video/VideoPlayer";
import { useIsIOS } from "../hooks/use-ios";
import { logDebugInfo } from "../hooks/scroll-video/scroll-utils";

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

/**
 * Component that handles scroll-controlled video playback
 */
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
  const isIOS = useIsIOS();
  
  // Log important details for debugging
  useEffect(() => {
    logDebugInfo("ScrollVideoPlayer", "Initializing with configuration:", {
      source: src,
      segments: segmentCount,
      scrollExtra: SCROLL_EXTRA_PX,
      mobile: isMobile,
      iOS: isIOS
    });
    
    if (videoRef.current) {
      // Apply essential video attributes
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.preload = "auto";
      
      // iOS-specific attributes
      if (isIOS) {
        videoRef.current.setAttribute('webkit-playsinline', '');
        videoRef.current.setAttribute('x-webkit-airplay', 'allow');
      }
      
      // Force initial frame to show
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0.001;
        }
      }, 100);
    }
  }, [src, segmentCount, SCROLL_EXTRA_PX, isMobile, isIOS, videoRef]);

  return (
    <VideoPlayer 
      src={src} 
      segmentCount={segmentCount}
      onAfterVideoChange={onAfterVideoChange}
      onProgressChange={onProgressChange}
      videoRef={videoRef} 
      containerRef={containerRef} 
      scrollExtraPx={SCROLL_EXTRA_PX}
      afterVideoExtraHeight={AFTER_VIDEO_EXTRA_HEIGHT}
      isMobile={isMobile}
    >
      {children}
    </VideoPlayer>
  );
};

export default ScrollVideoPlayer;
