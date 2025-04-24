
import { useRef, useState } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useScrollVideo = (
  videoElement: HTMLVideoElement | null,
  containerElement: HTMLElement | null,
  isMobile: boolean,
  scrollExtraPx: number,
  onTextIndexChange: (idx: number | null) => void,
  onAfterVideoChange: (after: boolean) => void,
  segmentCount: number
) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.015;
  const frameRef = useRef<number | null>(null);

  const calculateSegmentLength = (segments: number) => {
    return 1 / (segments + 1);
  };

  const updateVideoFrame = (progress: number) => {
    if (!videoElement?.duration) return;
    if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
      return;
    }
    lastProgressRef.current = progress;
    const newTime = progress * videoElement.duration;
    
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      if (!videoElement) return;
      videoElement.currentTime = newTime;
      const segLen = calculateSegmentLength(segmentCount);
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
  };

  const setupScrollTrigger = () => {
    if (!videoElement?.duration || !containerElement) return;
    
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: containerElement,
      start: "top top",
      end: `+=${scrollExtraPx}`,
      scrub: isMobile ? 0.5 : 0.4,
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

  const cleanup = () => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  };

  return {
    setupScrollTrigger,
    cleanup,
    isLoaded,
  };
};
