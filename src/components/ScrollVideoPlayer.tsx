
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsAndroid } from "../hooks/use-android";
import { useIsIOS } from "../hooks/useIsIOS";

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
  // Reducing the threshold from 0.002 to 0.0005 for more responsive scrubbing
  const progressThreshold = 0.0005; 
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  // Define the frames to stop before the end - iOS specific handling
  const FRAMES_BEFORE_END = 5;
  // Standard video frame rate (most common)
  const STANDARD_FRAME_RATE = 30;
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  // Use the Android and iOS hooks for detection
  const isAndroid = useIsAndroid();
  const isIOS = useIsIOS();

  // Create a ref to store the current interpolation target time
  const targetTimeRef = useRef<number>(0);
  // Create a ref to store the current animation frame ID for interpolation
  const interpolationFrameRef = useRef<number | null>(null);
  // Create a ref to track if interpolation is in progress
  const isInterpolatingRef = useRef<boolean>(false);
  // Interpolation speed factor (higher means faster transition)
  const interpolationSpeed = 0.15;

  // Function to smoothly interpolate video time for Android
  const smoothlyUpdateVideoTime = (video: HTMLVideoElement, targetTime: number) => {
    // Store the target time for reference
    targetTimeRef.current = targetTime;
    
    // If we're already interpolating, no need to start another loop
    if (isInterpolatingRef.current) return;
    
    isInterpolatingRef.current = true;
    
    // Function for the interpolation loop
    const interpolateTime = () => {
      if (!video) {
        isInterpolatingRef.current = false;
        return;
      }
      
      const currentTime = video.currentTime;
      const timeDiff = targetTimeRef.current - currentTime;
      
      // If we're close enough to the target, set the time directly and stop
      if (Math.abs(timeDiff) < 0.01) {
        video.currentTime = targetTimeRef.current;
        isInterpolatingRef.current = false;
        return;
      }
      
      // Calculate the next time value with easing
      const newTime = currentTime + (timeDiff * interpolationSpeed);
      
      // Update the video time
      video.currentTime = newTime;
      
      // Continue the interpolation in the next frame
      interpolationFrameRef.current = requestAnimationFrame(interpolateTime);
    };
    
    // Start the interpolation loop
    if (interpolationFrameRef.current) {
      cancelAnimationFrame(interpolationFrameRef.current);
    }
    interpolationFrameRef.current = requestAnimationFrame(interpolateTime);
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Android detection:", isAndroid);
    console.log("iOS detection:", isIOS);
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
      
      // iOS-specific optimizations
      if (isIOS) {
        console.log("Applying iOS-specific optimizations");
        
        // iOS Safari video optimizations
        video.style.transform = "translate3d(0,0,0)";
        video.style.webkitTransform = "translate3d(0,0,0)";
        video.style.backfaceVisibility = "hidden";
        video.style.willChange = "transform";
        
        // iOS-specific attributes to prevent video texture unloading
        video.setAttribute("webkit-playsinline", "true");
        video.setAttribute("playsinline", "true");
        video.setAttribute("preload", "auto");
        
        // Force initial frame load for iOS
        setTimeout(() => {
          if (video.readyState >= 1) {
            video.currentTime = 0.001;
            console.log("iOS: Forced initial frame load");
          }
        }, 100);
      }
      
      // Android-specific optimizations
      if (isAndroid) {
        console.log("Applying Android-specific optimizations");
        
        // Enhanced hardware acceleration for Android
        video.style.transform = "translate3d(0,0,0) translateZ(0)";
        
        // Improve Android rendering performance
        video.style.backfaceVisibility = "hidden";
        video.style.perspective = "1000px";
        
        // Android texture size optimization
        video.style.maxWidth = "100%";
        video.style.maxHeight = "100%";
        
        // Android sometimes benefits from webkitTransform
        // @ts-ignore
        video.style.webkitTransform = "translate3d(0,0,0)";
        
        // Force hardware acceleration using additional properties
        video.style.willChange = "transform, opacity";
        
        // Attempt to improve initial frame rendering on Android
        if (video.readyState >= 1) {
          setTimeout(() => {
            video.currentTime = 0.001;
            console.log("Forced initial frame on Android");
          }, 50);
        }
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
      
      // iOS-specific end handling - allow video to play closer to completion
      let adjustedProgress = progress;
      if (isIOS) {
        // For iOS, allow the video to play much closer to the end to prevent black screen
        // Only stop 1 frame before the end instead of 5 frames
        const stopTimeBeforeEnd = 1 / STANDARD_FRAME_RATE;
        
        if (progress > 0.99) {  // Only adjust very close to the end
          const maxTime = video.duration - stopTimeBeforeEnd;
          adjustedProgress = Math.min(progress, maxTime / video.duration);
        }
        
        // Log iOS-specific handling
        if (progress > 0.95) {
          console.log(`iOS video progress: ${progress.toFixed(3)}, adjusted: ${adjustedProgress.toFixed(3)}, time: ${(adjustedProgress * video.duration).toFixed(2)}/${video.duration.toFixed(2)}`);
        }
      } else {
        // Non-iOS devices use the original logic
        const stopTimeBeforeEnd = FRAMES_BEFORE_END / STANDARD_FRAME_RATE;
        
        if (progress > 0.98) {  // Only adjust near the end
          const maxTime = video.duration - stopTimeBeforeEnd;
          adjustedProgress = Math.min(progress, maxTime / video.duration);
        }
        
        // Log when we're approaching the end
        if (progress > 0.95) {
          console.log(`Video progress: ${progress.toFixed(3)}, adjusted: ${adjustedProgress.toFixed(3)}, time: ${(adjustedProgress * video.duration).toFixed(2)}/${video.duration.toFixed(2)}`);
        }
      }
      
      const newTime = adjustedProgress * video.duration;
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        if (isIOS) {
          // iOS-specific smooth time updates to prevent glitches
          const timeDiff = Math.abs(video.currentTime - newTime);
          
          // For iOS, use a more conservative approach to time updates
          if (timeDiff > 0.1) {
            // Large jumps - set directly but with a small buffer
            video.currentTime = newTime;
          } else {
            // Small adjustments - interpolate smoothly
            const lerpFactor = 0.3; // Slower interpolation for iOS
            const interpolatedTime = video.currentTime + (newTime - video.currentTime) * lerpFactor;
            video.currentTime = interpolatedTime;
          }
          
          if (progress > 0.95) {
            console.log(`iOS smooth update: target=${newTime.toFixed(3)}, current=${video.currentTime.toFixed(3)}`);
          }
        } else if (isAndroid) {
          // Use our existing smooth interpolation function for Android
          smoothlyUpdateVideoTime(video, newTime);
          
          // Log Android-specific smoothing when near the end
          if (progress > 0.95) {
            console.log(`Android smooth interpolation: target time = ${newTime.toFixed(3)}, current = ${video.currentTime.toFixed(3)}`);
          }
        } else {
          // Standard approach for desktop browsers
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
      
      // Determine the appropriate scrub value based on browser and device
      let scrubValue = isFirefox ? 2.5 : (isMobile ? 1.0 : 0.8);
      
      // iOS-specific scrub value optimization
      if (isIOS) {
        // iOS benefits from a higher scrub value for smoother performance and less glitches
        scrubValue = 2.2;
        console.log("Using iOS-optimized scrub value:", scrubValue);
      } else if (isAndroid) {
        // Android devices benefit from a higher scrub value for smoother performance
        scrubValue = 1.8;
        console.log("Using Android-optimized scrub value:", scrubValue);
      }
      
      console.log(`Using scrub value: ${scrubValue} for ${isIOS ? 'iOS' : (isAndroid ? 'Android' : (isFirefox ? 'Firefox' : (isMobile ? 'mobile' : 'desktop')))}`);
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: scrubValue, // Use the device/browser-specific scrub value
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
      if (interpolationFrameRef.current) {
        cancelAnimationFrame(interpolationFrameRef.current);
      }
      setupEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
      clearTimeout(timeoutId);
      setupCompleted.current = false;
      isInterpolatingRef.current = false;
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, onProgressChange, src, isLoaded, isMobile, isAndroid, isIOS]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
