
import { RefObject, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type UseScrollTriggerProps = {
  containerRef: RefObject<HTMLDivElement>;
  videoRef: RefObject<HTMLVideoElement>;
  SCROLL_EXTRA_PX: number;
  isMobile: boolean;
  onProgressUpdate: (progress: number) => void;
  isLoaded: boolean;
};

export const useScrollTrigger = ({
  containerRef,
  videoRef,
  SCROLL_EXTRA_PX,
  isMobile,
  onProgressUpdate,
  isLoaded,
}: UseScrollTriggerProps) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !video.duration) return;

    if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${SCROLL_EXTRA_PX}`,
      scrub: isMobile ? 0.2 : 0.1,
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (isNaN(progress)) return;
        onProgressUpdate(progress);
      }
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [containerRef, videoRef, SCROLL_EXTRA_PX, isMobile, onProgressUpdate, isLoaded]);
};
