
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { determineTextIndex } from "../utils/ScrollVideoController";

gsap.registerPlugin(ScrollTrigger);

interface ScrollTriggerConfig {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  segmentCount: number;
  SCROLL_EXTRA_PX: number;
  isMobile: boolean;
  onTextIndexChange: (index: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
}

export const useScrollVideoTrigger = ({
  videoRef,
  containerRef,
  segmentCount,
  SCROLL_EXTRA_PX,
  isMobile,
  onTextIndexChange,
  onAfterVideoChange
}: ScrollTriggerConfig) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.015;
  const frameRef = useRef<number | null>(null);

  const updateVideoFrame = (progress: number) => {
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
      if (!video) return;
      video.currentTime = newTime;
      
      // Calculate which text should be showing based on current progress
      const textIdx = determineTextIndex(progress, segmentCount);
      
      onTextIndexChange(textIdx);
      onAfterVideoChange(progress >= 1);
    });
  };

  const setupScrollTrigger = () => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container || !video.duration) return;
    
    if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${SCROLL_EXTRA_PX}`,
      scrub: isMobile ? 0.5 : 0.4, // Increased scrub values for smoother scrolling
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (isNaN(progress)) return;
        updateVideoFrame(progress);
      }
    });
    
    setIsLoaded(true);
  };

  // Clean up function
  const cleanup = () => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  };

  return { isLoaded, setupScrollTrigger, cleanup };
};
