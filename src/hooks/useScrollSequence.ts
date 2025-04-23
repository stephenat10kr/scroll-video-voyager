
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseScrollSequenceProps {
  containerRef: React.RefObject<HTMLDivElement>;
  totalFrames: number;
  scrollExtraPx: number;
  onProgressChange: (frameIndex: number) => void;
  onScrollComplete: (isComplete: boolean) => void;
}

export const useScrollSequence = ({
  containerRef,
  totalFrames,
  scrollExtraPx,
  onProgressChange,
  onScrollComplete,
}: UseScrollSequenceProps) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    console.log("Setting up scroll sequence");
    
    const container = containerRef.current;
    if (!container) {
      console.error("Container ref is null");
      return;
    }

    const updateScroll = (progress: number) => {
      if (Math.abs(progress - lastProgressRef.current) < 0.01) return;
      
      lastProgressRef.current = progress;
      const frameIndex = Math.min(Math.floor(progress * totalFrames) + 1, totalFrames);
      onProgressChange(frameIndex);
      onScrollComplete(progress >= 1);
    };
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${scrollExtraPx}`,
      scrub: 0.1,
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (isNaN(progress)) {
          console.warn("Progress is NaN");
          return;
        }
        updateScroll(progress);
      }
    });
    
    return () => {
      console.log("Cleaning up scroll sequence");
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [totalFrames, scrollExtraPx, containerRef, onProgressChange, onScrollComplete]);
};
