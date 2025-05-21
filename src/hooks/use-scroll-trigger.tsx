
import { useRef, useEffect, useState } from "react";
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
  const [isSetupComplete, setIsSetupComplete] = useState(false);

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
    
    logDebugInfo("ScrollTrigger", "Starting ScrollTrigger setup");

    // Force video to load and show first frame
    video.load();
    video.currentTime = 0.001;
    
    // Function to set up ScrollTrigger
    const setupScrollTrigger = () => {
      // Kill any existing ScrollTrigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      
      // Ensure video is paused
      video.pause();
      
      // Get scrub value based on device
      const scrubValue = getScrubValue(isFirefox, isMobile, isIOS);
      logDebugInfo("ScrollTrigger", `Using scrub value: ${scrubValue}`);
      
      // Create ScrollTrigger with simple configuration
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollExtraPx}`,
        scrub: scrubValue,
        pin: true,
        onUpdate: (self) => {
          updateVideoFrame(self.progress);
        }
      });
      
      setIsSetupComplete(true);
      logDebugInfo("ScrollTrigger", "Setup completed successfully");
    };
    
    // Try to set up on various video events
    const videoEvents = ['loadedmetadata', 'loadeddata', 'canplay'];
    
    const handleVideoReady = () => {
      setupScrollTrigger();
      // Remove event listeners after first successful setup
      videoEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
    };
    
    // Add event listeners
    videoEvents.forEach(event => {
      video.addEventListener(event, handleVideoReady);
    });
    
    // Initial setup attempt
    setupScrollTrigger();
    
    // Clean up function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      cleanupFrameUpdate();
      
      videoEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
    };
  }, [containerRef, videoRef, scrollExtraPx, onAfterVideoChange, onProgressUpdate, isMobile, isIOS, isFirefox, updateVideoFrame, cleanupFrameUpdate]);

  return { 
    isSetupComplete 
  };
};
