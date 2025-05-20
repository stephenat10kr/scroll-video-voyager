
import React from "react";
import VideoPlayer from "./video/VideoPlayer";
import { useIsIOS } from "../hooks/use-ios";

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
  // Detect if we're on iOS for specialized handling
  const isIOS = useIsIOS();
  
  console.log("ScrollVideoPlayer - Video source:", src);
  console.log("ScrollVideoPlayer - Segment count:", segmentCount);
  console.log("ScrollVideoPlayer - Extra scroll pixels:", SCROLL_EXTRA_PX);

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
