
import React, { useRef, useState, useCallback } from "react";
import { useScrollVideoSetup } from "../hooks/useScrollVideoSetup";
import { useVideoSource } from "../hooks/useVideoSource";
import { useScrollTrigger } from "../hooks/useScrollTrigger";

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
  const lastProgressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const progressThreshold = 0.01;

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
    }
  }, [SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT]);

  useScrollVideoSetup({
    videoRef,
    containerRef,
    SCROLL_EXTRA_PX,
    AFTER_VIDEO_EXTRA_HEIGHT,
    isMobile,
    onResize: handleResize,
  });

  useVideoSource(videoRef, src, isMobile);

  const handleProgressUpdate = useCallback((progress: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    
    if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
      return;
    }
    
    lastProgressRef.current = progress;
    const newTime = progress * video.duration;
    
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      video.currentTime = newTime;
      const segLen = 1 / (segmentCount + 1);
      
      let textIdx: number | null = null;
      for (let i = 0; i < segmentCount; ++i) {
        if (progress >= segLen * i && progress < segLen * (i + 1)) {
          textIdx = i;
          break;
        }
      }
      if (progress >= segLen * segmentCount) {
        textIdx = null;
      }
      onTextIndexChange(textIdx);
      onAfterVideoChange(progress >= 1);
    });
  }, [segmentCount, onTextIndexChange, onAfterVideoChange, videoRef]);

  useScrollTrigger({
    containerRef,
    videoRef,
    SCROLL_EXTRA_PX,
    isMobile,
    onProgressUpdate: handleProgressUpdate,
    isLoaded,
  });

  return <>{children}</>;
};

export default ScrollVideoPlayer;
