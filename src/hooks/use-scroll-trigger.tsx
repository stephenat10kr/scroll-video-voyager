
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useVideoFrameUpdate } from "./scroll-video/use-video-frame-update";
import { useScrollContainer } from "./scroll-video/use-scroll-container";
import { getScrubValue, logDebugInfo, isVideoDurationValid } from "./scroll-video/scroll-utils";

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
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const setupAttemptsRef = useRef(0);
  const maxSetupAttempts = 5;

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

    // Force initial video loading
    if (video.readyState === 0) {
      video.load();
    }

    // Function to set up ScrollTrigger
    const setupScrollTrigger = () => {
      if (setupCompleted.current) return;
      
      // For mobile, try to render a frame immediately
      if (isMobile && video.readyState === 0) {
        video.currentTime = 0.001;
      }
      
      // For non-mobile, check if video duration is available
      if (!isMobile && !isVideoDurationValid(video)) {
        setupAttemptsRef.current += 1;
        logDebugInfo("ScrollTrigger", `Video not ready, attempt ${setupAttemptsRef.current}/${maxSetupAttempts}`);
        
        // If we've tried enough times, set up anyway
        if (setupAttemptsRef.current >= maxSetupAttempts) {
          logDebugInfo("ScrollTrigger", "Proceeding with setup despite video not ready");
        } else {
          return; // Try again later
        }
      }
      
      // Kill any existing ScrollTrigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      
      // Ensure video is paused before setting up ScrollTrigger
      video.pause();
      
      // Get the appropriate scrub value based on browser and device
      const scrubValue = getScrubValue(isFirefox, isMobile, isIOS);
      
      // Log the scrub value being used
      logDebugInfo("ScrollTrigger", `Using scrub value: ${scrubValue} for ${isFirefox ? 'Firefox' : (isIOS ? 'iOS' : (isMobile ? 'mobile' : 'desktop'))}`);
      
      // Clear any existing ScrollTrigger instances for this container
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === container) {
          trigger.kill();
        }
      });
      
      // Create new ScrollTrigger
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
          
          // Call update with current progress
          updateVideoFrame(progress);
          
          // Log progress periodically (first time and then every 10%)
          if (progress === 0 || Math.abs(progress - Math.round(progress * 10) / 10) < 0.01) {
            logDebugInfo("ScrollTrigger", `Progress: ${(progress * 100).toFixed(1)}%`);
          }
        },
        onRefresh: () => {
          logDebugInfo("ScrollTrigger", "Refreshed");
          // Force an update to ensure video position matches scroll
          if (scrollTriggerRef.current) {
            updateVideoFrame(scrollTriggerRef.current.progress);
          }
        }
      });
      
      // Mark setup as completed
      setupCompleted.current = true;
      setIsSetupComplete(true);
      logDebugInfo("ScrollTrigger", "Setup completed successfully with scrub value:", scrubValue);
    };

    // Initial setup attempt
    setupScrollTrigger();

    // Set up event listeners for video metadata
    const setupEvents = ['loadedmetadata', 'canplay', 'loadeddata'];
      
    const handleVideoReady = () => {
      logDebugInfo("ScrollTrigger", `Video event triggered, ready state: ${video.readyState}`);
      if (!setupCompleted.current) {
        setupScrollTrigger();
      } else {
        // If already set up, make sure the video position is correct
        if (scrollTriggerRef.current) {
          updateVideoFrame(scrollTriggerRef.current.progress);
        }
      }
    };
    
    // Add event listeners
    setupEvents.forEach(event => {
      video.addEventListener(event, handleVideoReady);
    });
    
    // Safety interval to ensure ScrollTrigger gets set up
    const intervalId = setInterval(() => {
      if (!setupCompleted.current && setupAttemptsRef.current < maxSetupAttempts) {
        logDebugInfo("ScrollTrigger", "Attempting setup from interval");
        setupScrollTrigger();
      } else if (setupAttemptsRef.current >= maxSetupAttempts) {
        clearInterval(intervalId);
      }
    }, 300);
    
    // Clean up function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      
      cleanupFrameUpdate();
      
      setupEvents.forEach(event => {
        if (video) {
          video.removeEventListener(event, handleVideoReady);
        }
      });
      
      clearInterval(intervalId);
    };
  }, [containerRef, videoRef, scrollExtraPx, onAfterVideoChange, onProgressUpdate, isMobile, isIOS, isFirefox, updateVideoFrame, cleanupFrameUpdate]);

  return { 
    isSetupComplete 
  };
};
