
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type UseScrollVideoPlayerProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  src?: string;
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
  onProgressChange?: (progress: number) => void;
  onLoadedChange?: (loaded: boolean) => void;
  SCROLL_EXTRA_PX: number;
  AFTER_VIDEO_EXTRA_HEIGHT: number;
  isMobile: boolean;
};

export const useScrollVideoPlayer = ({
  videoRef,
  containerRef,
  src,
  segmentCount,
  onTextIndexChange,
  onAfterVideoChange,
  onProgressChange,
  onLoadedChange,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
  isMobile,
}: UseScrollVideoPlayerProps) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.002;
  const frameRef = useRef<number | null>(null);
  const loadAttempts = useRef(0);

  // Call onLoadedChange whenever isLoaded changes
  useEffect(() => {
    if (onLoadedChange) {
      onLoadedChange(isLoaded);
    }
  }, [isLoaded, onLoadedChange]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Segment count:", segmentCount);

    // Check if running on iOS
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    console.log("iOS device detected:", isiOS);

    // Optimize video element for all devices, especially iOS
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();

    // iOS/Mobile-specific optimizations
    if (isMobile) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("x-webkit-airplay", "allow");
      video.setAttribute("disablePictureInPicture", "");
      video.setAttribute("crossorigin", "anonymous");
      
      if (isiOS) {
        // iOS Safari needs these additional helpers
        video.load(); // Force reload the video element
      }
    }

    // Chrome-specific optimizations still apply
    video.style.willChange = "contents";
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      video.style.transform = "translate3d(0,0,0)";
    }

    // --- Begin: Video source selection and logging ---
    let srcAssigned = false;
    
    if (!src) {
      console.log("[ScrollVideo] No src provided.");
      return;
    }

    // Use the provided source for all devices
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
      
      const newTime = progress * video.duration;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        video.currentTime = newTime;
        
        // Calculate which text should be showing based on current progress
        const segLen = calculateSegmentLength(segmentCount);
        let textIdx: number | null = null;
        
        for (let i = 0; i < segmentCount; ++i) {
          if (progress >= segLen * i && progress < segLen * (i + 1)) {
            textIdx = i;
            break;
          }
        }
        
        if (progress >= segLen * segmentCount) {
          textIdx = null;
        }
        
        onTextIndexChange(textIdx);
        onAfterVideoChange(progress >= 1);
      });
    };

    const setupScrollTrigger = () => {
      if (!video.duration) {
        console.log("Video duration not available yet, cannot setup ScrollTrigger");
        return;
      }
      
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        // Use same scrub value for both mobile and desktop for consistent behavior
        scrub: 0.4,
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
      console.log("Video can play now");
    };

    // Request high priority loading for the video
    if ('fetchPriority' in HTMLImageElement.prototype) {
      // @ts-ignore - TypeScript doesn't know about fetchPriority yet
      video.fetchPriority = 'high';
    }

    // iOS is very finicky with video loading - use multiple strategies
    const trySetup = () => {
      loadAttempts.current += 1;
      console.log(`Setup attempt ${loadAttempts.current}, readyState: ${video.readyState}`);
      
      if (video.duration) {
        setupScrollTrigger();
        return true;
      } else if (video.readyState >= 2) {
        setupScrollTrigger();
        return true;
      }
      
      return false;
    };
    
    // Multiple ways to detect when video is ready on iOS
    const setupVideo = () => {
      if (!isLoaded) {
        const success = trySetup();
        console.log(`Setup attempt result: ${success ? "success" : "failed"}`);
      }
    };
    
    // Add multiple event listeners to catch when video is ready
    video.addEventListener("loadedmetadata", setupVideo);
    video.addEventListener("loadeddata", setupVideo);
    video.addEventListener("canplay", setupVideo);
    video.addEventListener("canplaythrough", setupVideo);
    video.addEventListener("durationchange", setupVideo);
    
    // Safety timeout - if metadata doesn't load in a reasonable time
    const timeoutId = setTimeout(() => {
      if (!isLoaded) {
        console.log("Setting up ScrollTrigger after timeout");
        trySetup();
        
        // Last resort for iOS - force a time update
        if (isiOS && !isLoaded) {
          console.log("iOS special handling - forcing time update");
          // Set current time to 0.01 to force iOS to initialize the video
          video.currentTime = 0.01;
          setTimeout(() => trySetup(), 50);
        }
      }
    }, 1000);
    
    return () => {
      window.removeEventListener("resize", resizeSection);
      clearTimeout(timeoutId);
      video.removeEventListener("loadedmetadata", setupVideo);
      video.removeEventListener("loadeddata", setupVideo);
      video.removeEventListener("canplay", setupVideo);
      video.removeEventListener("canplaythrough", setupVideo);
      video.removeEventListener("durationchange", setupVideo);
      
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onTextIndexChange, onAfterVideoChange, onProgressChange, onLoadedChange, src, isLoaded, isMobile]);

  return {
    isLoaded
  };
};
