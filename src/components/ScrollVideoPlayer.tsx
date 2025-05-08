
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
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
  onTextIndexChange,
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

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Segment count:", segmentCount);

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    
    // Explicitly pause the video during initialization
    video.pause();
    console.log("Video paused during initialization");

    // Mobile-specific optimizations
    if (isMobile) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      // Force display for mobile devices
      video.style.display = "block";
      video.style.opacity = "1";
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
      if (setupCompleted.current) return;
      if (!video.duration) return;
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      // Ensure video is paused before setting up ScrollTrigger
      video.pause();
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: isMobile ? 0.5 : 0.4, // Increased scrub values for smoother scrolling
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
      
      // For mobile, attempt to trigger video playback after scroll
      if (isMobile) {
        const touchStart = () => {
          // Make sure video is visible first
          video.style.opacity = "1";
          video.style.visibility = "visible";
          
          video.play().then(() => {
            // Immediately pause after play to ensure it's ready for scrubbing
            video.pause();
            console.log("Mobile video played then paused on touch");
          }).catch(err => console.log("Mobile play attempt:", err));
        };
        
        document.addEventListener('touchstart', touchStart, { once: true });
        return () => document.removeEventListener('touchstart', touchStart);
      }
    };

    // Request high priority loading for the video
    if ('fetchPriority' in HTMLImageElement.prototype) {
      // @ts-ignore - TypeScript doesn't know about fetchPriority yet
      video.fetchPriority = 'high';
    }

    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      // For mobile devices, add more event listeners to ensure video loads properly
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
      
      // Safety timeout - if events don't fire in a reasonable time
      const timeoutId = setTimeout(() => {
        if (!setupCompleted.current && video.readyState >= 1) {
          console.log("Setting up ScrollTrigger after timeout");
          setupScrollTrigger();
        }
      }, 500);
      
      return () => {
        clearTimeout(timeoutId);
        setupEvents.forEach(event => {
          video.removeEventListener(event, handleVideoReady);
        });
      };
    }

    return () => {
      window.removeEventListener("resize", resizeSection);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      setupCompleted.current = false;
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onTextIndexChange, onAfterVideoChange, onProgressChange, src, isLoaded, isMobile]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
