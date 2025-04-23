
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "../hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  SCROLL_EXTRA_PX: number;
  AFTER_VIDEO_EXTRA_HEIGHT: number;
};

const ScrollVideoPlayer: React.FC<ScrollVideoPlayerProps> = ({
  src,
  segmentCount,
  onTextIndexChange,
  onAfterVideoChange,
  onError,
  children,
  videoRef,
  containerRef,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.01; // Only update if progress change exceeds this threshold
  const frameRef = useRef<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();

    // Set playsinline and webkit-playsinline for iOS
    video.setAttribute("playsinline", "playsinline");
    video.setAttribute("webkit-playsinline", "webkit-playsinline");

    // Add iOS-specific attributes to help with playback
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      video.setAttribute("autoplay", "false");
      video.setAttribute("webkit-playsinline", "true");
    }

    // Chrome-specific optimizations
    video.style.willChange = "contents";
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      video.style.transform = "translate3d(0,0,0)";
    }

    // Clean up the source URL
    let cleanedSrc = "";
    if (src) {
      cleanedSrc = src.startsWith('//') ? `https:${src}` : src;
      
      // For testing: Log the video URL
      console.log("Video URL:", cleanedSrc);

      // Explicitly set source to help with mobile
      video.src = cleanedSrc;
    }

    // Handle video errors
    const handleVideoError = () => {
      const errorMsg = video.error 
        ? `Error loading video: ${video.error.message || 'Unknown error'}. Code: ${video.error.code || 'N/A'}`
        : 'Unknown video loading error';
      
      console.error(errorMsg);
      setLoadError(errorMsg);
      
      if (onError) {
        onError(errorMsg);
      }
    };
    
    video.addEventListener('error', handleVideoError);

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    
    resizeSection();
    window.addEventListener("resize", resizeSection);

    // Pre-calculate segment length
    const calculateSegmentLength = (segments: number) => {
      return 1 / (segments + 1);
    };
    const segLen = calculateSegmentLength(segmentCount);

    const updateVideoFrame = (progress: number) => {
      if (!video.duration) return;
      
      // Only update if the progress has changed significantly
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      
      lastProgressRef.current = progress;
      
      // Use requestAnimationFrame for smoother updates
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        video.currentTime = progress * video.duration;
        
        // Calculate current text index
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

    // Setup ScrollTrigger with improved mobile handling
    const setupScrollTrigger = () => {
      if (!video.duration) return;
      
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      const scrollConfig = {
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: isMobile ? 0.2 : 0.1, // Smoother on mobile
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self: any) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          updateVideoFrame(progress);
        }
      };
      
      scrollTriggerRef.current = ScrollTrigger.create(scrollConfig);
      setIsLoaded(true);
    };

    // Request high priority loading for the video
    if ('fetchPriority' in HTMLImageElement.prototype) {
      // @ts-ignore
      video.fetchPriority = 'high';
    }

    // Set up video loading
    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      video.addEventListener("loadedmetadata", setupScrollTrigger);
      
      // Add a specific listener for load success
      video.addEventListener("canplaythrough", () => {
        console.log("[ScrollVideo] Video can play through");
        setIsLoaded(true);
      }, { once: true });
      
      // Fallback timeout if video doesn't load properly
      const timeoutId = setTimeout(() => {
        if (!isLoaded && video.readyState >= 1) {
          console.log("[ScrollVideo] Setting up scroll trigger after timeout");
          setupScrollTrigger();
        }
      }, 1000);
      
      return () => {
        clearTimeout(timeoutId);
        video.removeEventListener('error', handleVideoError);
      };
    }

    return () => {
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", setupScrollTrigger);
      video.removeEventListener('error', handleVideoError);
      
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [
    segmentCount, 
    SCROLL_EXTRA_PX, 
    AFTER_VIDEO_EXTRA_HEIGHT, 
    containerRef, 
    videoRef, 
    onTextIndexChange, 
    onAfterVideoChange, 
    src, 
    isLoaded, 
    isMobile,
    onError
  ]);

  return (
    <>
      {loadError && !onError && (
        <div className="absolute top-0 left-0 w-full bg-red-500/70 text-white p-4 z-50 text-sm">
          {loadError}
        </div>
      )}
      {children}
    </>
  );
};

export default ScrollVideoPlayer;
