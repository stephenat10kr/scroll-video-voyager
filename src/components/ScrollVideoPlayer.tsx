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
  
  // iOS-specific frame settings - much more conservative to prevent black screen
  const isIOS = useIsIOS();
  const isAndroid = useIsAndroid();
  
  // Define frames to stop before the end based on device
  const FRAMES_BEFORE_END = isIOS ? 1 : 5; // Only 1 frame for iOS vs 5 for other devices
  
  // Standard video frame rate (most common)
  const STANDARD_FRAME_RATE = 30;
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

  // Create a ref to store the current interpolation target time
  const targetTimeRef = useRef<number>(0);
  // Create a ref to store the current animation frame ID for interpolation
  const interpolationFrameRef = useRef<number | null>(null);
  // Create a ref to track if interpolation is in progress
  const isInterpolatingRef = useRef<boolean>(false);
  // Interpolation speed factor (higher means faster transition)
  const interpolationSpeed = isIOS ? 0.2 : 0.15; // Slightly faster for iOS

  // iOS-specific texture retention timer
  const iOSTextureTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to smoothly interpolate video time for mobile devices
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

  // iOS-specific texture retention function
  useEffect(() => {
    if (isIOS && videoRef.current) {
      const video = videoRef.current;
      
      // Prevent iOS Safari from unloading video textures
      const preventTextureUnload = () => {
        if (video.paused && video.readyState >= 2) {
          // Gently touch the video element to keep texture in memory
          const currentTime = video.currentTime;
          video.currentTime = currentTime + 0.001;
        }
      };
      
      // Set up interval to maintain texture on iOS
      iOSTextureTimerRef.current = setInterval(preventTextureUnload, 1500);
      
      return () => {
        if (iOSTextureTimerRef.current) {
          clearInterval(iOSTextureTimerRef.current);
        }
      };
    }
  }, [isIOS, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("iOS detection:", isIOS);
    console.log("Android detection:", isAndroid);
    console.log("Firefox detection:", isFirefox);
    console.log("Segment count:", segmentCount);
    console.log(`Frames before end: ${FRAMES_BEFORE_END} (iOS optimized: ${isIOS})`);

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    
    // Explicitly pause the video during initialization
    video.pause();
    console.log("Video paused during initialization");

    // iOS-specific optimizations
    if (isIOS) {
      console.log("Applying iOS-specific optimizations");
      
      // iOS Safari hardware acceleration
      video.style.transform = "translate3d(0,0,0)";
      video.style.willChange = "transform";
      video.style.backfaceVisibility = "hidden";
      
      // iOS-specific rendering optimizations
      video.style.webkitBackfaceVisibility = "hidden";
      video.style.webkitTransform = "translate3d(0,0,0)";
      
      // Force the first frame to display immediately on iOS
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
      }
      
      // iOS viewport height handling
      const handleViewportChange = () => {
        // Account for iOS Safari's dynamic viewport
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        container.style.height = `${viewportHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      };
      
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleViewportChange);
      }
    }

    // Mobile-specific optimizations that don't affect appearance
    if (isMobile && !isIOS) {
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
    } else if (!isMobile) {
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
        // iOS-specific height calculation
        if (isIOS && window.visualViewport) {
          const viewportHeight = window.visualViewport.height;
          container.style.height = `${viewportHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
        } else {
          container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
        }
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
      
      // Calculate time to stop before the end of the video
      // iOS gets much more conservative stopping point
      const stopTimeBeforeEnd = FRAMES_BEFORE_END / STANDARD_FRAME_RATE;
      
      // Adjust progress to stop before the end - iOS gets smoother handling
      let adjustedProgress = progress;
      const endThreshold = isIOS ? 0.995 : 0.98; // iOS can go much closer to the end
      
      if (progress > endThreshold) {
        // Scale progress to end at (duration - stopTimeBeforeEnd)
        const maxTime = video.duration - stopTimeBeforeEnd;
        adjustedProgress = Math.min(progress, maxTime / video.duration);
        
        // iOS-specific smooth end transition
        if (isIOS && progress > 0.99) {
          // Create a smoother curve for the final 1% on iOS
          const finalProgress = (progress - 0.99) / 0.01;
          const smoothedFinal = 1 - Math.pow(1 - finalProgress, 3); // Ease-out curve
          adjustedProgress = 0.99 + (smoothedFinal * 0.01 * (maxTime / video.duration - 0.99));
        }
      }
      
      const newTime = adjustedProgress * video.duration;
      
      // Enhanced logging for iOS debugging
      if (progress > 0.95) {
        console.log(`iOS Video progress: ${progress.toFixed(4)}, adjusted: ${adjustedProgress.toFixed(4)}, time: ${newTime.toFixed(3)}/${video.duration.toFixed(3)}, frames before end: ${FRAMES_BEFORE_END}`);
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        // Enhanced mobile-specific smooth interpolation
        if (isIOS || isAndroid) {
          // Use our smooth interpolation function for mobile devices
          smoothlyUpdateVideoTime(video, newTime);
          
          // Log mobile-specific smoothing when near the end
          if (progress > 0.95) {
            console.log(`${isIOS ? 'iOS' : 'Android'} smooth interpolation: target time = ${newTime.toFixed(3)}, current = ${video.currentTime.toFixed(3)}`);
          }
        } else {
          // Standard approach for desktop devices
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
      let scrubValue = 0.8; // Default
      
      if (isIOS) {
        // iOS-specific scrub value for smoother performance
        scrubValue = 1.2;
        console.log("Using iOS-optimized scrub value:", scrubValue);
      } else if (isFirefox) {
        // Increased scrub value for Firefox
        scrubValue = 2.5;
      } else if (isAndroid) {
        // Android devices benefit from a higher scrub value
        scrubValue = 1.8;
        console.log("Using Android-optimized scrub value:", scrubValue);
      } else if (isMobile) {
        scrubValue = 1.0;
      }
      
      console.log(`Using scrub value: ${scrubValue} for ${isIOS ? 'iOS' : (isFirefox ? 'Firefox' : (isAndroid ? 'Android' : (isMobile ? 'mobile' : 'desktop')))}`);
      
      // iOS-specific ScrollTrigger configuration
      const scrollConfig: any = {
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: scrubValue,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          updateVideoFrame(progress);
        }
      };
      
      // iOS-specific ScrollTrigger optimizations
      if (isIOS) {
        scrollConfig.refreshPriority = 1;
        scrollConfig.invalidateOnRefresh = false;
      }
      
      scrollTriggerRef.current = ScrollTrigger.create(scrollConfig);
      
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
      if (iOSTextureTimerRef.current) {
        clearInterval(iOSTextureTimerRef.current);
      }
      setupEvents.forEach(event => {
        video.removeEventListener(event, handleVideoReady);
      });
      clearTimeout(timeoutId);
      setupCompleted.current = false;
      isInterpolatingRef.current = false;
      
      // iOS-specific cleanup
      if (isIOS && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', resizeSection);
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, onProgressChange, src, isLoaded, isMobile, isIOS, isAndroid]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
