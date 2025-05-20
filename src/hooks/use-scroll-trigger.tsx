
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useVideoFrameUpdate } from "./scroll-video/use-video-frame-update";
import { useScrollContainer } from "./scroll-video/use-scroll-container";
import { getScrubValue, logDebugInfo } from "./scroll-video/scroll-utils";

gsap.registerPlugin(ScrollTrigger);

interface UseScrollTriggerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  onProgressUpdate: (progress: number) => void;
  onAfterVideoChange: (after: boolean) => void;
  scrollExtraPx: number;
  isMobile: boolean;
  isIOS: boolean;
  isFirefox: boolean;
}

/**
 * Hook for managing ScrollTrigger setup and video frame updates
 */
export const useScrollTrigger = ({
  containerRef,
  videoRef,
  onProgressUpdate,
  onAfterVideoChange,
  scrollExtraPx,
  isMobile,
  isIOS,
  isFirefox,
}: UseScrollTriggerProps) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const setupCompleted = useRef(false);

  // Use the container setup hook
  useScrollContainer({
    containerRef,
    scrollExtraPx,
    isMobile,
    isIOS,
    isFirefox
  });
  
  // Use the video frame update hook
  const { updateVideoFrame, cleanup: cleanupFrameUpdate } = useVideoFrameUpdate({
    videoRef,
    onProgressUpdate,
    onAfterVideoChange,
    isIOS
  });

  // Initialize ScrollTrigger
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container) return;

    const setupScrollTrigger = () => {
      if (setupCompleted.current) return;
      
      // For mobile, try to render a frame immediately without waiting for duration
      if (isMobile) {
        video.currentTime = 0.001;
      }
      
      // Check if video duration is available
      if (!video.duration && !isMobile) {
        logDebugInfo("ScrollTrigger", "Video duration not yet available, waiting...");
        return;
      }
      
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      // Ensure video is paused before setting up ScrollTrigger
      video.pause();
      
      // Get the appropriate scrub value based on browser and device
      const scrubValue = getScrubValue(isFirefox, isMobile, isIOS);
      
      if (isIOS) {
        logDebugInfo("ScrollTrigger", "Using iOS-specific scrub value:", scrubValue);
      }
      
      logDebugInfo("ScrollTrigger", `Using scrub value: ${scrubValue} for ${isFirefox ? 'Firefox' : (isIOS ? 'iOS' : (isMobile ? 'mobile' : 'desktop'))}`);
      
      // Clear any existing ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === container) {
          trigger.kill();
        }
      });
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollExtraPx}`,
        scrub: scrubValue,
        pin: true,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        markers: false,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          updateVideoFrame(progress);
          
          // Log scroll position for debugging
          if (isIOS && self.progress > 0.9) {
            logDebugInfo("ScrollTrigger", `iOS scroll position: ${self.progress.toFixed(4)}, pixels: ${window.scrollY}`);
          }
        }
      });
      
      setupCompleted.current = true;
      logDebugInfo("ScrollTrigger", "Setup completed with scrub value:", scrubValue);
    };

    // For mobile devices, we'll set up ScrollTrigger even without duration
    if (isMobile) {
      setupScrollTrigger();
    } else if (video.readyState >= 2) {
      setupScrollTrigger();
    }

    // Set up event listeners regardless of initial state
    const setupEvents = ['loadedmetadata', 'canplay', 'loadeddata'];
      
    const handleVideoReady = () => {
      if (!setupCompleted.current) {
        logDebugInfo("ScrollTrigger", "Setting up after video event");
        setupScrollTrigger();
      }
      
      // Clean up event listeners after setup
      if (setupCompleted.current) {
        setupEvents.forEach(event => {
          video.removeEventListener(event, handleVideoReady);
        });
      }
    };
    
    setupEvents.forEach(event => {
      video.addEventListener(event, handleVideoReady);
    });
    
    // Safety timeout to ensure ScrollTrigger gets set up
    const timeoutId = setTimeout(() => {
      if (!setupCompleted.current) {
        logDebugInfo("ScrollTrigger", "Setting up after timeout");
        setupScrollTrigger();
      }
    }, 300);
    
    // Clean up function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      cleanupFrameUpdate();
      
      setupEvents.forEach(event => {
        if (video) {
          video.removeEventListener(event, handleVideoReady);
        }
      });
      
      clearTimeout(timeoutId);
      setupCompleted.current = false;
    };
  }, [containerRef, videoRef, scrollExtraPx, onAfterVideoChange, onProgressUpdate, isMobile, isIOS, isFirefox, updateVideoFrame, cleanupFrameUpdate]);

  return { 
    isSetupComplete: setupCompleted.current 
  };
};
