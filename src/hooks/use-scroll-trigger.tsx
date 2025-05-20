
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.002;

  // Constants for video playback
  const FRAMES_BEFORE_END = 2; // Reduced from 5 to 2 frames for better iOS experience
  const STANDARD_FRAME_RATE = 30;

  // Function to update video frames based on scroll position
  const updateVideoFrame = (progress: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
      return;
    }
    lastProgressRef.current = progress;
    
    // Call the progress change callback
    onProgressUpdate(progress);
    
    // iOS specific handling with extensive logging
    if (isIOS) {
      console.log(`iOS video progress: ${progress.toFixed(4)}, duration: ${video.duration.toFixed(2)}`);
    }
    
    // Calculate time to stop before the end of the video
    // For iOS, use a smaller value to ensure we get closer to the end of the video
    const framesBeforeEnd = isIOS ? 1 : FRAMES_BEFORE_END;
    const stopTimeBeforeEnd = framesBeforeEnd / STANDARD_FRAME_RATE;
    
    // Adjust progress to stop frames before the end
    let adjustedProgress = progress;
    if (progress > 0.95) {  // Start adjusting earlier at 95% instead of 97%
      // Scale progress to end at (duration - stopTimeBeforeEnd)
      const maxTime = video.duration - stopTimeBeforeEnd;
      adjustedProgress = Math.min(progress, maxTime / video.duration);
      
      // For iOS, let the progress go very near the end (special handling)
      if (isIOS && progress > 0.99) {
        // Let iOS go much closer to the end
        adjustedProgress = Math.min(1, progress);
      }
      
      // Additional logging for end of video behavior
      if (isIOS || progress > 0.98) {
        console.log(`Near end: progress=${progress.toFixed(4)}, adjusted=${adjustedProgress.toFixed(4)}, time=${(adjustedProgress * video.duration).toFixed(2)}/${video.duration.toFixed(2)}`);
      }
    }
    
    const newTime = adjustedProgress * video.duration;
    
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    frameRef.current = requestAnimationFrame(() => {
      video.currentTime = newTime;
      onAfterVideoChange(progress >= 0.99); // Consider "after video" slightly earlier
    });
  };

  // Initialize ScrollTrigger
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("iOS detection:", isIOS);
    console.log("Firefox detection:", isFirefox);
    console.log("Scroll extra pixels:", scrollExtraPx);

    // Resize container based on scroll requirements
    const resizeSection = () => {
      if (container) {
        // Add extra height for iOS to ensure consistent 600% scroll
        const totalHeight = window.innerHeight + scrollExtraPx;
        console.log(`Setting container height to ${totalHeight}px`);
        container.style.height = `${totalHeight}px`;
      }
    };
    
    // Initial resize and add listener
    resizeSection();
    window.addEventListener("resize", resizeSection);

    const setupScrollTrigger = () => {
      if (setupCompleted.current) return;
      
      // For mobile, try to render a frame immediately without waiting for duration
      if (isMobile) {
        video.currentTime = 0.001;
      }
      
      // Check if video duration is available
      if (!video.duration && !isMobile) {
        console.log("Video duration not yet available, waiting...");
        return;
      }
      
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      // Ensure video is paused before setting up ScrollTrigger
      video.pause();
      
      // Determine the appropriate scrub value based on browser and device
      // Special case for iOS to make scrolling smoother
      let scrubValue = isFirefox ? 2.5 : (isMobile ? 1.0 : 0.8);
      
      // iOS specific scrub value - make it even smoother for iOS
      if (isIOS) {
        scrubValue = 2.2; // Smoother scrolling for iOS with increased value from 1.5 to 2.2
        console.log("Using iOS-specific scrub value:", scrubValue);
      }
      
      console.log(`Using scrub value: ${scrubValue} for ${isFirefox ? 'Firefox' : (isIOS ? 'iOS' : (isMobile ? 'mobile' : 'desktop'))}`);
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollExtraPx}`,
        scrub: scrubValue, // Use the device-specific scrub value
        pin: true, // Add pinning to ensure video stays in view during scroll
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        markers: false, // Set to true for debugging scroll triggers
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          updateVideoFrame(progress);
          
          // Log scroll position for debugging
          if (isIOS && self.progress > 0.9) {
            console.log(`iOS scroll position: ${self.progress.toFixed(4)}, pixels: ${window.scrollY}`);
          }
        }
      });
      
      setupCompleted.current = true;
      console.log("ScrollTrigger setup completed with scrub value:", scrubValue);
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
        console.log("Setting up ScrollTrigger after video event");
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
        console.log("Setting up ScrollTrigger after timeout");
        setupScrollTrigger();
      }
    }, 300);
    
    // Clean up function
    return () => {
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      setupEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
      clearTimeout(timeoutId);
      setupCompleted.current = false;
    };
  }, [containerRef, videoRef, scrollExtraPx, onAfterVideoChange, onProgressUpdate, isMobile, isIOS, isFirefox]);

  return { 
    isSetupComplete: setupCompleted.current 
  };
};
