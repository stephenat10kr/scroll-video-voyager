
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  const lastProgressRef = useRef(0);

  // Initialize ScrollTrigger
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container) return;
    
    logDebugInfo("ScrollTrigger", "Starting ScrollTrigger setup");

    // Set container dimensions
    const updateContainerSize = () => {
      container.style.height = `${window.innerHeight + scrollExtraPx}px`;
      container.style.position = "relative";
      container.style.overflow = "hidden";
    };

    // Update container size initially and on resize
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    // Force video to load and show first frame
    video.load();
    video.currentTime = 0.001;
    
    // Function to update video frames based on scroll position
    const updateVideoFrame = (progress: number) => {
      if (!video) return;
      
      // Skip if the progress change is too small (performance optimization)
      if (Math.abs(progress - lastProgressRef.current) < 0.001) return;
      lastProgressRef.current = progress;
      
      // Call the progress change callback
      onProgressUpdate(progress);
      
      try {
        // Ensure video is loaded
        if (video.readyState === 0) {
          video.load();
          video.currentTime = 0.001;
          return;
        }

        if (isNaN(video.duration) || video.duration <= 0) {
          logDebugInfo("VideoFrame", "Invalid video duration, cannot update frame");
          return;
        }
        
        // Calculate time based on progress
        let targetTime = progress * video.duration;
        
        // Adjust for end frames
        if (progress > 0.95) {
          const stopTime = Math.max(0, video.duration - (FRAMES_BEFORE_END / STANDARD_FRAME_RATE));
          targetTime = Math.min(targetTime, stopTime);
        }
        
        // Set the current time directly
        video.currentTime = targetTime;
        
        // Signal if we're at the end of the video
        onAfterVideoChange(progress > 0.98);
      } catch (err) {
        logDebugInfo("VideoFrame", "Error updating frame:", err);
      }
    };
    
    // Function to set up ScrollTrigger with retry mechanism
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
        
        // Create ScrollTrigger with simplified configuration
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: `+=${scrollExtraPx}`,
          scrub: scrubValue,
          pin: true,
          onUpdate: (self) => {
            updateVideoFrame(self.progress);
          },
          // Prevent ScrollTrigger from dropping its pin if there's not enough scroll space
          pinSpacing: true 
        });
        
        setIsSetupComplete(true);
        logDebugInfo("ScrollTrigger", "Setup completed successfully");
      } catch (error) {
        logDebugInfo("ScrollTrigger", "Error setting up ScrollTrigger:", error);
        // Retry after a short delay
        setTimeout(setupScrollTrigger, 500);
      }
    };
    
    // Set up events to ensure video is ready
    const videoEvents = ['loadedmetadata', 'loadeddata', 'canplay'];
    
    const handleVideoReady = () => {
      setupScrollTrigger();
      // Remove event listeners after successful setup
      videoEvents.forEach(event => video.removeEventListener(event, handleVideoReady));
    };
    
    // Add event listeners
    videoEvents.forEach(event => video.addEventListener(event, handleVideoReady));
    
    // Initial setup attempt
    setupScrollTrigger();
    
    // Clean up function
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      window.removeEventListener('resize', updateContainerSize);
      
      videoEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
    };
  }, [containerRef, videoRef, scrollExtraPx, onAfterVideoChange, onProgressUpdate, isMobile, isIOS, isFirefox]);

  return { 
    isSetupComplete 
  };
};

export const STANDARD_FRAME_RATE = 30;
export const FRAMES_BEFORE_END = 2;
