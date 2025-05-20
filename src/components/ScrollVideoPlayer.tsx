import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsIOS } from "../hooks/use-ios";

gsap.registerPlugin(ScrollTrigger);

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onAfterVideoChange: (after: boolean) => void;
  onProgressChange?: (progress: number) => void;
  children?: React.ReactNode;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  AFTER_VIDEO_EXTRA_HEIGHT: number;
  isMobile: boolean;
};

const ScrollVideoPlayer: React.FC<ScrollVideoPlayerProps> = ({
  src,
  segmentCount,
  onAfterVideoChange,
  onProgressChange,
  children,
  videoRef,
  containerRef,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
  isMobile,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastProgressRef = useRef(0);
  // Setting the progressThreshold to 0.002 as requested
  const progressThreshold = 0.002; 
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  // Define the frames to stop before the end - reduced to 2 frames for better iOS experience
  const FRAMES_BEFORE_END = 2; // Reduced from 5 to 2 frames
  // Standard video frame rate (most common)
  const STANDARD_FRAME_RATE = 30;
  
  // Check if we're on iOS using our custom hook
  const isIOS = useIsIOS();
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("iOS detection:", isIOS);
    console.log("Firefox detection:", isFirefox);
    console.log("Segment count:", segmentCount);
    console.log("Scroll extra pixels:", SCROLL_EXTRA_PX);
    console.log("After video extra height:", AFTER_VIDEO_EXTRA_HEIGHT);

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    
    // Explicitly pause the video during initialization
    video.pause();
    console.log("Video paused during initialization");

    // Enhanced iOS-specific optimizations
    if (isIOS) {
      console.log("Applying enhanced iOS optimizations");
      // Force hardware acceleration more aggressively for iOS
      video.style.transform = "translate3d(0,0,0)";
      video.style.webkitTransform = "translate3d(0,0,0)";
      // Ensure native playback is used on iOS
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("playsinline", "true");
    }
    
    // Mobile-specific optimizations that don't affect appearance
    if (isMobile) {
      // Keep these optimizations but remove visibility settings
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      
      // Force hardware acceleration
      video.style.transform = "translate3d(0,0,0)";
      video.style.willChange = "contents";
      
      // Ensure muted state for autoplay capability
      video.muted = true;
      
      // Force the first frame to display immediately
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
      }
    } else {
      // Chrome-specific optimizations still apply
      video.style.willChange = "contents";
      if (navigator.userAgent.indexOf("Chrome") > -1) {
        video.style.transform = "translate3d(0,0,0)";
      }
      
      // Firefox-specific optimizations
      if (isFirefox) {
        // Add Firefox-specific hardware acceleration hints
        video.style.transform = "translateZ(0)";
        // Additional Firefox optimization to improve rendering
        video.style.backfaceVisibility = "hidden";
      }
    }

    // --- Begin: Video source selection and logging ---
    let srcAssigned = false;
    
    if (!src) {
      console.log("[ScrollVideo] No src provided.");
      return;
    }

    // For mobile or desktop, use the provided source
    if (video.src !== src) {
      video.src = src;
      const extension = src.split(".").pop() || "unknown";
      console.log(`[ScrollVideo] Assigned ${extension.toUpperCase()} video source: ${src}`);
    }
    srcAssigned = true;
    // --- End: Video source selection and logging ---

    const resizeSection = () => {
      if (container) {
        // Add extra height for iOS to ensure consistent 600% scroll
        const totalHeight = window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT;
        console.log(`Setting container height to ${totalHeight}px`);
        container.style.height = `${totalHeight}px`;
      }
    };
    
    // Initial resize and add listener
    resizeSection();
    window.addEventListener("resize", resizeSection);

    // Calculate segment length based on the dynamic segmentCount
    const calculateSegmentLength = (segments: number) => {
      return 1 / (segments + 1);
    };
    
    const updateVideoFrame = (progress: number) => {
      if (!video.duration) return;
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      lastProgressRef.current = progress;
      
      // Call the progress change callback
      if (onProgressChange) {
        onProgressChange(progress);
      }
      
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
        end: `+=${SCROLL_EXTRA_PX}`,
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
            console.log(`iOS scroll position: ${self.progress.toFixed(4)}, pixels: ${self.scrollTrigger?.scroller.scrollTop}`);
          }
        }
      });
      
      setIsLoaded(true);
      setupCompleted.current = true;
      
      console.log("ScrollTrigger setup completed with scrub value:", scrubValue);
    };

    // Request high priority loading for the video
    if ('fetchPriority' in HTMLImageElement.prototype) {
      // @ts-ignore - TypeScript doesn't know about fetchPriority yet
      video.fetchPriority = 'high';
    }

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
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, onProgressChange, src, isLoaded, isMobile, isIOS, isFirefox]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
