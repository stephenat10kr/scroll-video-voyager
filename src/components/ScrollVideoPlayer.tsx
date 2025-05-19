
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  // Reduce the threshold for smoother Android scrubbing
  const progressThreshold = isMobile ? 0.001 : 0.002;
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  // Define the frames to stop before the end
  const FRAMES_BEFORE_END = 5;
  // Standard video frame rate (most common)
  const STANDARD_FRAME_RATE = 30;
  
  // Detect Android browser
  const isAndroid = typeof navigator !== 'undefined' && 
    navigator.userAgent.toLowerCase().indexOf('android') > -1;
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && 
    navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Android detection:", isAndroid);
    console.log("Firefox detection:", isFirefox);
    console.log("Segment count:", segmentCount);

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    
    // Explicitly pause the video during initialization
    video.pause();
    console.log("Video paused during initialization");

    // Mobile-specific optimizations that don't affect appearance
    if (isMobile) {
      // Keep these optimizations but remove visibility settings
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      
      // Force hardware acceleration - enhanced for Android
      video.style.transform = "translate3d(0,0,0)";
      video.style.willChange = "contents, transform";
      
      // Android-specific optimizations
      if (isAndroid) {
        // Apply additional Android-specific optimizations
        video.style.webkitBackfaceVisibility = "hidden";
        video.style.webkitPerspective = "1000";
        video.style.webkitTransformStyle = "preserve-3d";
        
        // Add buffer prefetch hint for Android
        video.preload = "auto";
        if (video.readyState < 3) {
          // Try to preload more aggressively
          video.load();
        }
      }
      
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
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

    // Calculate segment length based on the dynamic segmentCount
    const calculateSegmentLength = (segments: number) => {
      return 1 / (segments + 1);
    };
    
    // Enhanced video frame updater with smoother Android handling
    const updateVideoFrame = (progress: number) => {
      if (!video.duration) return;
      
      // Use different threshold for Android for smoother scrubbing
      const threshold = isAndroid ? 0.0005 : progressThreshold;
      
      if (Math.abs(progress - lastProgressRef.current) < threshold) {
        return;
      }
      
      lastProgressRef.current = progress;
      
      // Call the progress change callback
      if (onProgressChange) {
        onProgressChange(progress);
      }
      
      // Calculate time to stop before the end of the video
      // For a standard 30fps video, 5 frames = 5/30 = 0.167 seconds before the end
      const stopTimeBeforeEnd = FRAMES_BEFORE_END / STANDARD_FRAME_RATE;
      
      // Adjust progress to stop 5 frames before the end
      let adjustedProgress = progress;
      if (progress > 0.98) {  // Only adjust near the end
        // Scale progress to end at (duration - stopTimeBeforeEnd)
        const maxTime = video.duration - stopTimeBeforeEnd;
        adjustedProgress = Math.min(progress, maxTime / video.duration);
      }
      
      // For Android, add slight easing to the progress value for smoother scrubbing
      if (isAndroid) {
        // Apply slight interpolation for smoother Android playback
        const easeFactor = 0.85;
        const currentTime = video.currentTime;
        const targetTime = adjustedProgress * video.duration;
        const newTime = currentTime + (targetTime - currentTime) * easeFactor;
        
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        
        frameRef.current = requestAnimationFrame(() => {
          video.currentTime = newTime;
          onAfterVideoChange(progress >= 1);
        });
      } else {
        // Standard handling for non-Android devices
        const newTime = adjustedProgress * video.duration;
        
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        
        frameRef.current = requestAnimationFrame(() => {
          video.currentTime = newTime;
          onAfterVideoChange(progress >= 1);
        });
      }
      
      // Log when we're approaching the end
      if (progress > 0.95) {
        console.log(`Video progress: ${progress.toFixed(3)}, adjusted: ${adjustedProgress.toFixed(3)}, time: ${video.currentTime.toFixed(2)}/${video.duration.toFixed(2)}`);
      }
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
      
      // Determine the appropriate scrub value based on device
      let scrubValue = 0.8;  // Default for desktop
      
      if (isFirefox) {
        scrubValue = 2.5;  // Higher values for Firefox
      } else if (isAndroid) {
        scrubValue = 1.8;  // Optimized for Android - higher for smoother scrubbing
      } else if (isMobile) {
        scrubValue = 1.0;  // Standard for other mobile devices
      }
      
      console.log(`Using scrub value: ${scrubValue} for ${isAndroid ? 'Android' : isFirefox ? 'Firefox' : (isMobile ? 'mobile' : 'desktop')}`);
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: scrubValue, // Use the device-specific scrub value
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          updateVideoFrame(progress);
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

    // For Android devices, we need more aggressive loading
    if (isAndroid) {
      // Try to pre-decode frames for Android
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
        
        // Force load and then setup
        video.load();
        setTimeout(() => {
          if (!setupCompleted.current) {
            console.log("Setting up ScrollTrigger for Android after forced load");
            setupScrollTrigger();
          }
        }, 50);
      }
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
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, onProgressChange, src, isLoaded, isMobile]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
