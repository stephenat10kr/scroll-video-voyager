
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  isMobile?: boolean;
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
  isMobile,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastProgressRef = useRef(0);
  const progressThreshold = isMobile ? 0.002 : 0.01; // More responsive but less intensive on mobile
  const frameRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  const initialPauseDone = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // CRITICAL: Immediately set these attributes to prevent autoplay
    video.autoplay = false;
    video.preload = "none"; // More aggressive setting for mobile - load only when needed
    
    // CRITICAL: Start with blank source initially on mobile
    if (isMobile && isInitialMount.current) {
      // Clear any potentially existing source as a precaution
      video.removeAttribute('src');
      video.load();
    }

    // CRITICAL: Controls and attributes for preventing autoplay
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    
    // Explicitly pause the video right away
    video.pause();
    video.currentTime = 0;
    
    // Initialize video source only after other attributes are set
    // This delayed pattern helps prevent autoplay in some browsers
    if (isMobile) {
      setTimeout(() => {
        // Set source only after we've prepared the video element
        if (src) {
          // Process the source URL for mobile
          let cleanedSrc = "";
          if (src.startsWith('//')) {
            cleanedSrc = `https:${src}`;
          } else if (src.startsWith('http://')) {
            cleanedSrc = src.replace('http://', 'https://');
          } else if (!src.startsWith('http')) {
            cleanedSrc = `https://${src}`;
          } else {
            cleanedSrc = src;
          }
          
          // Add cache-busting and autoplay prevention parameter
          const preventAutoplayParam = Date.now().toString();
          cleanedSrc = cleanedSrc.includes('?') 
            ? `${cleanedSrc}&preventAutoplay=${preventAutoplayParam}` 
            : `${cleanedSrc}?preventAutoplay=${preventAutoplayParam}`;
            
          console.log("Mobile: Setting video source with delay:", cleanedSrc);
          
          // Set source and immediately pause again
          video.src = cleanedSrc;
          video.pause();
          
          // Force reload after setting source
          video.load();
          video.pause();
        }
      }, 100); // Small delay to ensure browser has processed previous commands
    } else {
      // Desktop behavior - set source immediately
      if (src) {
        let cleanedSrc = "";
        if (src.startsWith('//')) {
          cleanedSrc = `https:${src}`;
        } else if (src.startsWith('http://')) {
          cleanedSrc = src.replace('http://', 'https://');
        } else if (!src.startsWith('http')) {
          cleanedSrc = `https://${src}`;
        } else {
          cleanedSrc = src;
        }
        
        video.src = cleanedSrc;
      }
    }
    
    // CRITICAL: Force pause whenever the browser tries to play the video
    const forcePause = () => {
      console.log("Intercepted play attempt - forcing pause");
      video.pause();
      video.currentTime = 0;
      initialPauseDone.current = true;
    };
    
    // Catch all potential play events
    video.addEventListener('play', forcePause);
    video.addEventListener('playing', forcePause);
    
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

    // Optimized update function to reduce stuttering and control video frame
    const updateVideoFrame = (progress: number) => {
      if (!video.duration) return;
      
      // Prevent stuttering on mobile by using a threshold
      if (isMobile && Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      
      lastProgressRef.current = progress;
      
      // Cancel any existing animation frame to prevent stacking
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        // CRITICAL: Always ensure video is paused before setting time
        video.pause();
        
        // Manually set the currentTime based on scroll position
        if (video.duration && !isNaN(progress)) {
          video.currentTime = progress * video.duration;
        }
        
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

    // Improved ScrollTrigger configuration for mobile
    const setupScrollTrigger = () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      
      // Ensure video is paused before setting up ScrollTrigger
      video.pause();
      
      // More conservative scrub setting for mobile to prevent stuttering
      const scrubValue = isMobile ? 1 : 0.1;
      
      const scrollConfig = {
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: scrubValue,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        markers: false,
        onUpdate: (self: any) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          
          // Always ensure video is paused before updating frame
          video.pause();
          updateVideoFrame(progress);
        },
        onLeave: () => {
          video.pause();
        },
        onEnterBack: () => {
          video.pause();
        }
      };
      
      scrollTriggerRef.current = ScrollTrigger.create(scrollConfig);
      setIsLoaded(true);
      
      // Final check to ensure video is paused
      video.pause();
    };

    // Setup events for video loading
    if (video.readyState >= 2) {
      video.pause();
      console.log("Video already has enough data, setting up ScrollTrigger");
      setupScrollTrigger();
    } else {
      // Use loadeddata instead of loadedmetadata for more safety
      video.addEventListener("loadeddata", () => {
        console.log("Video loadeddata event fired");
        video.pause();
        setupScrollTrigger();
      });
      
      // Add a specific listener for load success
      video.addEventListener("canplaythrough", () => {
        console.log("Video canplaythrough event fired");
        video.pause();
        setIsLoaded(true);
        if (!scrollTriggerRef.current) {
          setupScrollTrigger();
        }
      }, { once: true });
      
      // Fallback timeout if video doesn't load properly
      const timeoutId = setTimeout(() => {
        console.log("Setting up ScrollTrigger after timeout");
        if (!isLoaded && video.readyState >= 1) {
          video.pause();
          setupScrollTrigger();
        }
      }, isMobile ? 2000 : 1000);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }

    // More aggressive cleanup for iOS and mobile
    if (isMobile) {
      // iOS requires multiple pauses to ensure video doesn't autoplay
      const safetyPauseInterval = setInterval(() => {
        if (video && !initialPauseDone.current) {
          console.log("Safety pause interval fired");
          video.pause();
          video.currentTime = 0;
        } else {
          clearInterval(safetyPauseInterval);
        }
      }, 100);
      
      // Clear the interval when component unmounts
      return () => {
        clearInterval(safetyPauseInterval);
        window.removeEventListener("resize", resizeSection);
        video.removeEventListener('error', handleVideoError);
        video.removeEventListener('play', forcePause);
        video.removeEventListener('playing', forcePause);
        
        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.kill();
        }
        
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }

    return () => {
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener('error', handleVideoError);
      video.removeEventListener('play', forcePause);
      video.removeEventListener('playing', forcePause);
      
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
