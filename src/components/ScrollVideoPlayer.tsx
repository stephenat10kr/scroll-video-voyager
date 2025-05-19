
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
  // Increased for Android to reduce update frequency significantly
  const progressThreshold = isAndroid ? 0.02 : (isFirefox ? 0.003 : 0.002);
  
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  // Define the frames to stop before the end
  const FRAMES_BEFORE_END = 5;
  // Standard video frame rate (most common)
  const STANDARD_FRAME_RATE = 30;
  
  // New initial position offset for Android to avoid frame 1 issue
  const ANDROID_INITIAL_OFFSET = 0.03; // 3% into the video
  
  // Track the last scroll direction
  const lastDirectionRef = useRef<'up' | 'down' | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Firefox detection:", isFirefox);
    console.log("Android detection:", isAndroid);
    console.log("Progress threshold:", progressThreshold);

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
    }

    // Firefox-specific optimizations
    if (isFirefox) {
      // Add Firefox-specific hardware acceleration hints
      video.style.transform = "translateZ(0)";
      // Additional Firefox optimization to improve rendering
      video.style.backfaceVisibility = "hidden";
    }
    
    // Android-specific optimizations
    if (isAndroid) {
      console.log("Applying Android-specific optimizations in ScrollVideoPlayer");
      
      // Simpler hardware acceleration for Android - avoid overdoing it
      video.style.transform = "translateZ(0)";
      
      // Force position away from frame 1
      if (video.duration) {
        const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
        video.currentTime = initialPos;
        console.log(`Android: Setting position to ${initialPos}s during setup`);
      }
    }

    // --- Begin: Video source selection and logging ---
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
    // --- End: Video source selection and logging ---

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);
    
    // For Android, this function helps force the video away from frame 1
    const forceAndroidFrame = () => {
      if (!isAndroid || !video.duration) return;
      
      // Only force a frame if we're at or very near the beginning
      if (video.currentTime < 0.02) {
        const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
        video.currentTime = initialPos;
        console.log(`Android: Force corrected position to ${initialPos}s`);
      }
    };
    
    // Add an interval check for Android to catch any resets to frame 1
    let androidCheckInterval: number | undefined;
    if (isAndroid) {
      androidCheckInterval = window.setInterval(forceAndroidFrame, 300);
    }
    
    const updateVideoFrame = (progress: number) => {
      if (!video.duration) return;
      
      // Detect scroll direction for optimizations
      const direction = progress > lastProgressRef.current ? 'down' : 'up';
      if (direction !== lastDirectionRef.current) {
        lastDirectionRef.current = direction;
        console.log(`Scroll direction changed to: ${direction}`);
      }
      
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
      const stopTimeBeforeEnd = FRAMES_BEFORE_END / STANDARD_FRAME_RATE;
      
      // Adjust progress for Android to prevent first frame issue
      let adjustedProgress = progress;
      
      // For Android, ensure we're never at the very beginning of the video
      if (isAndroid) {
        // If near the beginning, ensure we're at least at our offset 
        if (progress < 0.05) {
          adjustedProgress = Math.max(progress, ANDROID_INITIAL_OFFSET);
        }
      }
      
      // Adjust progress to stop 5 frames before the end
      if (progress > 0.98) {  // Only adjust near the end
        // Scale progress to end at (duration - stopTimeBeforeEnd)
        const maxTime = video.duration - stopTimeBeforeEnd;
        adjustedProgress = Math.min(adjustedProgress, maxTime / video.duration);
      }
      
      const newTime = adjustedProgress * video.duration;
      
      // For Android, implement more aggressive frame-skipping
      if (isAndroid) {
        // Skip updates more aggressively on Android 
        frameSkipCountRef.current += 1;
        if (frameSkipCountRef.current % 3 !== 0) { // Skip 2 out of every 3 updates
          return;
        }
        
        // If time difference is very small, don't update to reduce jank
        if (Math.abs(newTime - lastTimeRef.current) < 0.2 && lastTimeRef.current > 0) {
          return;
        }
      }
      
      // Debug when we're approaching the edges
      if (progress < 0.05 || progress > 0.95) {
        console.log(`Video progress: ${progress.toFixed(3)}, adjusted: ${adjustedProgress.toFixed(3)}, time: ${newTime.toFixed(2)}s`);
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Use requestAnimationFrame to smooth out video updates
      frameRef.current = requestAnimationFrame(() => {
        // For Android, always make sure we're not at the beginning
        if (isAndroid && newTime < 0.1) {
          // Ensure we're not at the very beginning
          const safeTime = Math.max(newTime, ANDROID_INITIAL_OFFSET * video.duration);
          console.log(`Android: Safety adjusting time from ${newTime.toFixed(2)}s to ${safeTime.toFixed(2)}s`);
          video.currentTime = safeTime;
        } 
        // For normal updates, only change time if it's changed significantly
        else if (Math.abs(video.currentTime - newTime) > 0.05) {
          video.currentTime = newTime;
        }
        
        lastTimeRef.current = video.currentTime; // Track actual set time
        onAfterVideoChange(progress >= 1);
      });
    };

    const setupScrollTrigger = () => {
      if (setupCompleted.current) return;
      
      // For Android, try to render a frame immediately beyond initial frame
      if (isAndroid && video.duration) {
        // Set to 3% into video for Android to avoid first frame issue
        const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
        video.currentTime = initialPos;
        console.log(`Android: Setting initial position to ${initialPos}s before ScrollTrigger setup`);
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
      
      // Android needs a much higher scrub value (4.5) for smoother playback
      // This makes scrolling less responsive but much smoother
      const scrubValue = isAndroid ? 4.5 : (isFirefox ? 2.5 : (isMobile ? 1.0 : 0.8));
      
      console.log(`Setting up ScrollTrigger with scrub: ${scrubValue} for ${
        isAndroid ? 'Android' : (isFirefox ? 'Firefox' : (isMobile ? 'mobile' : 'desktop'))
      }`);
      
      scrollTriggerRef.current = ScrollTrigger.create({
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
      });
      
      setIsLoaded(true);
      setupCompleted.current = true;
      
      console.log("ScrollTrigger setup completed with scrub value:", scrubValue);
      
      // Force Android safe frame once more after setup
      if (isAndroid && video.duration) {
        setTimeout(() => {
          forceAndroidFrame();
        }, 100);
      }
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
      if (isAndroid && video.duration) {
        const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
        video.currentTime = initialPos;
        console.log(`Android: Setting position to ${initialPos}s after video ready event`);
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
      // This event fires after a seek operation completes
      const handleSeeked = () => {
        // After any seek operation is complete, verify we're not at the beginning
        if (video.currentTime < 0.02 && video.duration) {
          // If we somehow ended up at the beginning, move to the offset position
          const initialPos = Math.min(ANDROID_INITIAL_OFFSET * video.duration, 1);
          video.currentTime = initialPos;
          console.log(`Android: Correcting position to ${initialPos}s after seek`);
        }
      };
      video.addEventListener('seeked', handleSeeked);
      
      // Clean up the event listener
      const cleanupSeekedListener = () => {
        video.removeEventListener('seeked', handleSeeked);
      };
      
      // Make sure we clean up this listener
      return () => {
        cleanupSeekedListener();
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
        if (androidCheckInterval !== undefined) {
          clearInterval(androidCheckInterval);
        }
      };
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
      if (androidCheckInterval !== undefined) {
        clearInterval(androidCheckInterval);
      }
      setupCompleted.current = false;
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, 
      onProgressChange, src, isLoaded, isMobile, isFirefox, isAndroid, progressThreshold]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
