
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
  const progressThreshold = 0.002; 
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    
    // Explicitly pause the video during initialization
    video.pause();

    // Mobile-specific optimizations
    if (isMobile) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.style.transform = "translate3d(0,0,0)";
      video.style.willChange = "contents";
      video.muted = true;
      
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
      }
    } else {
      video.style.willChange = "contents";
      if (navigator.userAgent.indexOf("Chrome") > -1) {
        video.style.transform = "translate3d(0,0,0)";
      }
    }

    // Video source handling
    if (!src) {
      console.log("[ScrollVideo] No src provided.");
      return;
    }

    if (video.src !== src) {
      video.src = src;
    }

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);
    
    const updateVideoFrame = (progress: number) => {
      if (!video.duration) return;
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      lastProgressRef.current = progress;
      
      if (onProgressChange) {
        onProgressChange(progress);
      }
      
      const newTime = progress * video.duration;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        video.currentTime = newTime;
        onAfterVideoChange(progress >= 1);
      });
    };

    const setupScrollTrigger = () => {
      if (setupCompleted.current) return;
      
      if (isMobile) {
        video.currentTime = 0.001;
      }
      
      if (!video.duration && !isMobile) {
        return;
      }
      
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      video.pause();
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: isMobile ? 0.5 : 0.4,
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
    };

    // Priority loading
    if ('fetchPriority' in HTMLImageElement.prototype) {
      // @ts-ignore
      video.fetchPriority = 'high';
    }

    if (isMobile) {
      setupScrollTrigger();
    } else if (video.readyState >= 2) {
      setupScrollTrigger();
    }

    // Event listeners
    const setupEvents = ['loadedmetadata', 'canplay', 'loadeddata'];
      
    const handleVideoReady = () => {
      if (!setupCompleted.current) {
        setupScrollTrigger();
      }
      
      if (setupCompleted.current) {
        setupEvents.forEach(event => {
          video.removeEventListener(event, handleVideoReady);
        });
      }
    };
    
    setupEvents.forEach(event => {
      video.addEventListener(event, handleVideoReady);
    });
    
    const timeoutId = setTimeout(() => {
      if (!setupCompleted.current) {
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
