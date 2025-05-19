
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
  scrubValue?: number; // Optional custom scrub value
  isAndroid?: boolean; // Flag for Android-specific handling
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
  scrubValue,
  isAndroid = false, // Default to false
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastProgressRef = useRef(0);
  // Setting the progressThreshold to 0.002 as requested
  const progressThreshold = isAndroid ? 0.001 : 0.002; // Lower threshold for Android 
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  // Define the frames to stop before the end
  const FRAMES_BEFORE_END = 5;
  // Standard video frame rate (most common)
  const STANDARD_FRAME_RATE = 30;
  const lastFrameTimeRef = useRef(0); // Track last frame time for Android
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

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
      
      // Force hardware acceleration
      video.style.transform = "translate3d(0,0,0)";
      video.style.willChange = "contents";
      
      // Ensure muted state for autoplay capability
      video.muted = true;
      
      // Force the first frame to display immediately
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
      }

      // Android-specific optimizations
      if (isAndroid) {
        console.log("Applying Android-specific optimizations");
        // Android needs more aggressive hardware acceleration
        video.style.transform = "translate3d(0,0,0) translateZ(0)";
        // Force backface visibility hidden for better performance
        video.style.backfaceVisibility = "hidden";
        // Prerender helps with smoother playback on Android
        document.body.style.webkitBackfaceVisibility = "hidden";
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
    
    // Enhanced frame throttling for Android devices
    const updateVideoFrame = (progress: number) => {
      if (!video.duration) return;
      
      // Android-specific throttling and precision
      if (isAndroid) {
        const now = performance.now();
        // Enforce a minimum time between frame updates for Android (smoother playback)
        if (now - lastFrameTimeRef.current < 16) { // ~60fps
          return; // Skip this update if it's too soon
        }
        lastFrameTimeRef.current = now;
      } else {
        // Standard threshold check for non-Android
        if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
          return;
        }
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
      
      const newTime = adjustedProgress * video.duration;
      
      // Log when we're approaching the end
      if (progress > 0.95) {
        console.log(`Video progress: ${progress.toFixed(3)}, adjusted: ${adjustedProgress.toFixed(3)}, time: ${newTime.toFixed(2)}/${video.duration.toFixed(2)}`);
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        // Android requires special handling for seeking
        if (isAndroid) {
          // For Android, use precision seeking to avoid stuttering
          // Only update if the time difference is significant
          const timeDiff = Math.abs(video.currentTime - newTime);
          if (timeDiff > 0.05) { // Only seek if difference is notable
            try {
              video.currentTime = newTime;
              console.log(`Android seek to: ${newTime.toFixed(2)}`);
            } catch (e) {
              console.error("Android seek error:", e);
            }
          }
        } else {
          // Standard behavior for other platforms
          video.currentTime = newTime;
        }
        
        onAfterVideoChange(progress >= 1);
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
      
      // Determine the appropriate scrub value based on browser and platform
      // Custom scrub value takes precedence if provided
      let finalScrubValue = scrubValue;
      
      // If no custom scrub value is provided, use platform-specific defaults
      if (!finalScrubValue) {
        if (isAndroid) {
          finalScrubValue = 2.0; // Higher value for Android (smoother but more delayed)
        } else if (isFirefox) {
          finalScrubValue = 2.5; // Higher for Firefox
        } else if (isMobile) {
          finalScrubValue = 1.0; // Default for mobile
        } else {
          finalScrubValue = 0.8; // Default for desktop
        }
      }
      
      console.log(`Using scrub value: ${finalScrubValue} for ${isAndroid ? 'Android' : (isFirefox ? 'Firefox' : (isMobile ? 'mobile' : 'desktop'))}`);
      
      // Android needs special ScrollTrigger configuration
      const scrollTriggerConfig = {
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: finalScrubValue,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self: any) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          
          // Android-specific velocity detection for smoother scrolling
          if (isAndroid) {
            // Track scroll velocity for smoother updates
            const velocity = Math.abs(self.getVelocity() / 1000);
            
            // For fast scrolling, reduce update frequency
            if (velocity > 0.5) {
              // During fast scrolling, update less frequently
              if (Math.random() < 0.5) { // only update ~50% of the frames
                updateVideoFrame(progress);
              }
            } else {
              // For slow or normal scrolling, update normally
              updateVideoFrame(progress);
            }
          } else {
            // Standard update for other platforms
            updateVideoFrame(progress);
          }
        }
      };
      
      scrollTriggerRef.current = ScrollTrigger.create(scrollTriggerConfig);
      
      setIsLoaded(true);
      setupCompleted.current = true;
      
      console.log("ScrollTrigger setup completed with scrub value:", finalScrubValue);
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
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, onProgressChange, src, isLoaded, isMobile, isAndroid, scrubValue]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
