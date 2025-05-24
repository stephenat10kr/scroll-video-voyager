
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAndroidVideoSmoothing } from "../utils/androidVideoUtils";
import { getScrubValue, detectBrowser } from "../utils/videoUtils";

gsap.registerPlugin(ScrollTrigger);

interface UseVideoScrollTriggerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  onAfterVideoChange: (after: boolean) => void;
  onProgressChange?: (progress: number) => void;
  isMobile: boolean;
  isAndroid: boolean;
}

export const useVideoScrollTrigger = ({
  videoRef,
  containerRef,
  SCROLL_EXTRA_PX,
  onAfterVideoChange,
  onProgressChange,
  isMobile,
  isAndroid,
}: UseVideoScrollTriggerProps) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.0001;
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  const videoEndedRef = useRef(false);
  
  const { isFirefox } = detectBrowser();
  const { smoothlyUpdateVideoTime, cleanup: cleanupAndroidSmoothing } = useAndroidVideoSmoothing();

  const updateVideoFrame = (progress: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    
    if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
      return;
    }
    lastProgressRef.current = progress;
    
    if (onProgressChange) {
      onProgressChange(progress);
    }
    
    const maxAllowedTime = video.duration - 0.01;
    const targetTime = Math.min(progress * video.duration, maxAllowedTime);
    
    const isAtEnd = progress >= 0.999 || targetTime >= maxAllowedTime;
    
    if (isAtEnd && !videoEndedRef.current) {
      videoEndedRef.current = true;
      console.log(`Video reached end: progress=${progress.toFixed(4)}, time=${targetTime.toFixed(3)}/${video.duration.toFixed(3)}`);
      onAfterVideoChange(true);
    } else if (!isAtEnd && videoEndedRef.current) {
      videoEndedRef.current = false;
      onAfterVideoChange(false);
    }
    
    if (progress > 0.9) {
      console.log(`Video progress: ${progress.toFixed(4)}, time: ${targetTime.toFixed(3)}/${video.duration.toFixed(3)}`);
    }
    
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      if (!videoEndedRef.current || progress < 0.999) {
        if (isAndroid) {
          smoothlyUpdateVideoTime(video, targetTime);
          
          if (progress > 0.9) {
            console.log(`Android smooth interpolation: target time = ${targetTime.toFixed(3)}, current = ${video.currentTime.toFixed(3)}`);
          }
        } else {
          video.currentTime = targetTime;
        }
      }
    });
  };

  const setupScrollTrigger = () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || setupCompleted.current) return;
    
    if (isMobile) {
      video.currentTime = 0.001;
    }
    
    if (!video.duration && !isMobile) {
      console.log("Video duration not yet available, waiting...");
      return;
    }
    
    if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
    
    video.pause();
    
    const scrubValue = getScrubValue(isFirefox, isMobile, isAndroid);
    
    console.log(`Using scrub value: ${scrubValue} for ${isFirefox ? 'Firefox' : (isAndroid ? 'Android' : (isMobile ? 'mobile' : 'desktop'))}`);
    
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: `+=${SCROLL_EXTRA_PX}`,
      scrub: scrubValue,
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      onUpdate: (self) => {
        const progress = self.progress;
        if (isNaN(progress)) return;
        updateVideoFrame(progress);
      }
    });
    
    setupCompleted.current = true;
    console.log("ScrollTrigger setup completed with scrub value:", scrubValue);
  };

  const cleanup = () => {
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    cleanupAndroidSmoothing();
    setupCompleted.current = false;
    videoEndedRef.current = false;
  };

  return {
    setupScrollTrigger,
    cleanup,
    setupCompleted: setupCompleted.current,
  };
};
