
import React from "react";
import { useScrollVideoPlayer } from "../hooks/useScrollVideoPlayer";

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
  // Use our custom hook to handle all the scroll video player logic
  const { isLoaded } = useScrollVideoPlayer({
    videoRef,
    containerRef,
    src,
    segmentCount,
    onTextIndexChange,
    onAfterVideoChange,
    onProgressChange,
    SCROLL_EXTRA_PX,
    AFTER_VIDEO_EXTRA_HEIGHT,
    isMobile
  });

  return <>{children}</>;
};

export default ScrollVideoPlayer;
