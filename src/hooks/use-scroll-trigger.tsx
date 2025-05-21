
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
  const setupAttemptsRef = useRef(0);

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

    // Immediately try to load video and show first frame
    video.load();
    video.currentTime = 0.001;
    
    // Function to set up ScrollTrigger
    const setupScrollTrigger = () => {
      try {
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
        
        // Create ScrollTrigger
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: `+=${scrollExtraPx}`,
          scrub: scrubValue,
          pin: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          onUpdate: (self) => {
            const progress = self.progress;
            if (isNaN(progress)) return;
            
            updateVideoFrame(progress);
            
            // Log progress at key points
            if (progress === 0 || Math.round(progress * 10) / 10 === Math.floor(progress * 10) / 10) {
              logDebugInfo("ScrollTrigger", `Progress: ${(progress * 100).toFixed(1)}%`);
            }
          },
          onRefresh: () => {
            if (scrollTriggerRef.current) {
              updateVideoFrame(scrollTriggerRef.current.progress);
            }
          }
        });
        
        setIsSetupComplete(true);
        logDebugInfo("ScrollTrigger", "Setup completed successfully");
        return true;
      } catch (err) {
        logDebugInfo("ScrollTrigger", "Error during setup:", err);
        return false;
      }
    };
    
    // Setup events to trigger on video readiness
    const setupEvents = ['loadedmetadata', 'canplay', 'loadeddata', 'canplaythrough'];
    
    const handleVideoReady = () => {
      if (!isSetupComplete) {
        setupScrollTrigger();
      }
    };
    
    // Add event listeners
    setupEvents.forEach(event => {
      video.addEventListener(event, handleVideoReady);
    });
    
    // Initial setup attempt
    const initialSetupSuccess = setupScrollTrigger();
    
    // Retry mechanism
    if (!initialSetupSuccess) {
      const setupInterval = setInterval(() => {
        if (setupAttemptsRef.current < 5) {
          setupAttemptsRef.current++;
          logDebugInfo("ScrollTrigger", `Retry attempt ${setupAttemptsRef.current}`);
          const success = setupScrollTrigger();
          if (success) {
            clearInterval(setupInterval);
          }
        } else {
          clearInterval(setupInterval);
        }
      }, 500);
      
      return () => clearInterval(setupInterval);
    }
    
    // Clean up function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      cleanupFrameUpdate();
      
      setupEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
    };
  }, [containerRef, videoRef, scrollExtraPx, onAfterVideoChange, onProgressUpdate, isMobile, isIOS, isFirefox, updateVideoFrame, cleanupFrameUpdate]);

  return { 
    isSetupComplete 
  };
};
