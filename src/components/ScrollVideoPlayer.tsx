
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
  isAndroid?: boolean;
  isFirefox?: boolean;
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
  isAndroid = false,
  isFirefox = false,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastProgressRef = useRef(0);
  const lastTimeRef = useRef(0);
  const frameSkipCountRef = useRef(0);
  
  // Setting different progressThreshold values based on device
  const progressThreshold = isAndroid ? 0.01 : (isFirefox ? 0.003 : 0.002);
  
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  // Define the frames to stop before the end
  const FRAMES_BEFORE_END = 5;
  // Standard video frame rate (most common)
  const STANDARD_FRAME_RATE = 30;
  
  // New initial position offset for Android to avoid frame 1 issue
  const ANDROID_INITIAL_OFFSET = 0.03; // 3% into the video

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Firefox detection:", isFirefox);
    console.log("Android detection:", isAndroid);
    console.log("Progress threshold:", progressThreshold);
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
        // For Android, set initial position slightly ahead to avoid frame 1 issue
        if (isAndroid && video.duration) {
          const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
          console.log(`Android: Setting initial frame position to ${initialPos.toFixed(2)}s`);
          video.currentTime = initialPos;
        } else {
          video.currentTime = 0.001;
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
    
    // Android-specific optimizations
    if (isAndroid) {
      console.log("Applying Android-specific optimizations in ScrollVideoPlayer");
      
      // More aggressive rendering optimizations for Android
      video.style.transform = "translateZ(0) scale(1.0)"; // Force GPU layer
      video.style.backfaceVisibility = "hidden";
      video.style.perspective = "1000px"; // Help with 3D acceleration
      
      // More aggressive hardware acceleration
      video.style.willChange = "transform";
      
      // Force hardware acceleration using vendor prefixes
      video.style.webkitBackfaceVisibility = "hidden";
      video.style.webkitPerspective = "1000px";
      
      // Reduce rendering quality for better performance on Android
      if ("mozImageSmoothingEnabled" in video.style) {
        // @ts-ignore - Property may not exist in all browsers
        video.style.mozImageSmoothingEnabled = false;
      }
      if ("webkitImageSmoothingEnabled" in video.style) {
        // @ts-ignore - Property may not exist in all browsers
        video.style.webkitImageSmoothingEnabled = false;
      }
      
      // Try reducing playback quality
      if (typeof video.getVideoPlaybackQuality === 'function') {
        console.log("Android: VideoPlaybackQuality API available");
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
      
      // Use device-specific progressThreshold to control update frequency
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
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
      
      // For Android, apply a minimum offset to avoid getting stuck at frame 1
      let adjustedProgress = progress;
      
      // Only adjust near the beginning for Android (first 5%)
      if (isAndroid && progress < 0.05) {
        // Ensure we're always at least 3% in for Android
        adjustedProgress = Math.max(progress, ANDROID_INITIAL_OFFSET);
        console.log(`Android beginning: Using adjusted progress ${adjustedProgress.toFixed(3)} (raw: ${progress.toFixed(3)})`);
      }
      
      // Adjust progress to stop 5 frames before the end
      if (progress > 0.98) {  // Only adjust near the end
        // Scale progress to end at (duration - stopTimeBeforeEnd)
        const maxTime = video.duration - stopTimeBeforeEnd;
        adjustedProgress = Math.min(adjustedProgress, maxTime / video.duration);
      }
      
      const newTime = adjustedProgress * video.duration;
      
      // For Android, limit frame updates to avoid stuttering
      if (isAndroid) {
        // Skip every other frame update within the same scroll session to reduce processing
        frameSkipCountRef.current += 1;
        if (frameSkipCountRef.current % 2 !== 0) {
          // Skip this update to reduce load
          return;
        }
        
        // If time hasn't changed significantly, don't update
        if (Math.abs(newTime - lastTimeRef.current) < 0.1 && lastTimeRef.current > 0) {
          return;
        }
      }
      
      // Log when we're approaching the end or beginning
      if (progress > 0.95 || progress < 0.05) {
        console.log(`Video progress: ${progress.toFixed(3)}, adjusted: ${adjustedProgress.toFixed(3)}, time: ${newTime.toFixed(2)}/${video.duration.toFixed(2)}`);
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        // Only update the video if the time has changed significantly
        if (Math.abs(video.currentTime - newTime) > 0.05) {
          video.currentTime = newTime;
          lastTimeRef.current = newTime;
        }
        onAfterVideoChange(progress >= 1);
      });
    };

    const setupScrollTrigger = () => {
      if (setupCompleted.current) return;
      
      // For Android or mobile, try to render a frame immediately beyond initial frame
      if (isAndroid && video.duration) {
        // Set to 3% into video for Android to avoid first frame issue
        const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
        video.currentTime = initialPos;
        console.log(`Android: Setting initial position to ${initialPos}s`);
      } else if (isMobile) {
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
      
      // Determine the appropriate scrub value based on browser/device
      // Much higher value for Android (4.0) for smoother but less responsive scrubbing
      const scrubValue = isAndroid ? 4.0 : (isFirefox ? 2.5 : (isMobile ? 1.0 : 0.8));
      
      console.log(`Using scrub value: ${scrubValue} for ${
        isAndroid ? 'Android' : (isFirefox ? 'Firefox' : (isMobile ? 'mobile' : 'desktop'))
      }`);
      
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
      
      // For Android, ensure we're not at frame 1 after video is ready
      if (isAndroid && video.duration && !setupCompleted.current) {
        const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
        video.currentTime = initialPos;
        console.log(`Android: Setting position to ${initialPos}s after video ready`);
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
    
    // Special handler for Android to ensure we're not stuck at frame 1
    if (isAndroid) {
      video.addEventListener('seeked', () => {
        // After any seek operation is complete, verify we're not at the beginning
        if (video.currentTime < 0.02 && video.duration) {
          // If we somehow ended up at the beginning, move to the offset position
          const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
          video.currentTime = initialPos;
          console.log(`Android: Correcting position to ${initialPos}s after seek`);
        }
      });
    }
    
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
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, 
      onProgressChange, src, isLoaded, isMobile, isFirefox, isAndroid, progressThreshold]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;

