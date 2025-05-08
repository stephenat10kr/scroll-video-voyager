
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type UseScrollTriggerProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  isMobile: boolean;
  onProgress: (progress: number) => void;
  isLoaded: boolean;
};

export const useScrollTrigger = ({
  videoRef,
  containerRef,
  SCROLL_EXTRA_PX,
  isMobile,
  onProgress,
  isLoaded,
}: UseScrollTriggerProps) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const lastProgressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  // Setting the progressThreshold to 0.002 as in the original
  const progressThreshold = 0.002;

  // Create a function to update the video frame based on scroll progress
  const updateVideoFrame = (progress: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    
    if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
      return;
    }
    lastProgressRef.current = progress;
    
    // Call the progress change callback
    onProgress(progress);
    
    const newTime = progress * video.duration;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      if (video) video.currentTime = newTime;
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !video.duration) return;

    // Setup scroll trigger
    const setupScrollTrigger = () => {
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      // Ensure video is paused before setting up ScrollTrigger
      video.pause();
      
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
      
      // For mobile, attempt to trigger video playback after scroll
      if (isMobile) {
        const touchStart = () => {
          video.play().then(() => {
            // Immediately pause after play to ensure it's ready for scrubbing
            video.pause();
            console.log("Mobile video played then paused on touch");
          }).catch(err => console.log("Mobile play attempt:", err));
        };
        document.addEventListener('touchstart', touchStart, { once: true });
        return () => document.removeEventListener('touchstart', touchStart);
      }
    };

    if (video.readyState >= 2 && isLoaded) {
      setupScrollTrigger();
    } else {
      const onMetadataLoaded = () => setupScrollTrigger();
      video.addEventListener("loadedmetadata", onMetadataLoaded);
      
      // Safety timeout - if metadata doesn't load in a reasonable time
      const timeoutId = setTimeout(() => {
        if (video.readyState >= 1) {
          console.log("Setting up ScrollTrigger after timeout");
          setupScrollTrigger();
        }
      }, 1000);
      
      return () => {
        video.removeEventListener("loadedmetadata", onMetadataLoaded);
        clearTimeout(timeoutId);
      };
    }
    
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [videoRef, containerRef, SCROLL_EXTRA_PX, isMobile, isLoaded, onProgress]);

  return null;
};
