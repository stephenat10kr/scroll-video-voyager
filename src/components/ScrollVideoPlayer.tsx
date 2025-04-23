import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onTextIndexChange: (idx: number | null) => void;
  onAfterVideoChange: (after: boolean) => void;
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
  children,
  videoRef,
  containerRef,
  SCROLL_EXTRA_PX,
  AFTER_VIDEO_EXTRA_HEIGHT,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.01; // Only update if progress change exceeds this threshold
  const frameRef = useRef<number | null>(null);

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

    // Apply Chrome-specific optimizations
    video.style.willChange = "contents";
    
    // Apply hardware acceleration for Chrome
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      // Force hardware acceleration
      video.style.transform = "translate3d(0,0,0)";
      // Reduce the quality for better performance in Chrome
      if (video.canPlayType('video/webm')) {
        // Prefer WebM for Chrome if available
        const webmSrc = src?.replace(/\.(mp4|mov)$/, '.webm');
        if (webmSrc && webmSrc !== src) {
          // Check if this WebM version exists before switching
          fetch(webmSrc, { method: 'HEAD' })
            .then(response => {
              if (response.ok && !isLoaded) {
                video.src = webmSrc;
              }
            })
            .catch(() => {
              // WebM not available, keep using original source
            });
        }
      }
    }

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

    // Pre-calculate segment length to avoid doing it on every scroll
    const calculateSegmentLength = (segments: number) => {
      return 1 / (segments + 1);
    };
    const segLen = calculateSegmentLength(segmentCount);

    const updateVideoFrame = (progress: number) => {
      if (!video.duration) return;
      
      // Only update if progress change is significant enough
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      
      lastProgressRef.current = progress;
      
      // Update video time with a small delay to improve performance
      const newTime = progress * video.duration;
      
      // Use RAF for smoother updates
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        video.currentTime = newTime;
        
        // Update text index based on progress
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
      if (!video.duration) return;

      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: 0.1, // Add a small amount of smoothing
        anticipatePin: 1, // Help with performance
        fastScrollEnd: true, // Optimize for fast scrolling
        preventOverlaps: true,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          updateVideoFrame(progress);
        }
      });
      
      setIsLoaded(true);
    };

    // Request high priority loading for the video
    if ('fetchPriority' in HTMLImageElement.prototype) {
      // @ts-ignore - TypeScript doesn't know about fetchPriority yet
      video.fetchPriority = 'high';
    }

    // Load video at a lower resolution initially if available
    const tryLowerResVersion = () => {
      const lowResSrc = src?.replace(/\.(mp4|mov|webm)$/, '-low.$1');
      if (lowResSrc && lowResSrc !== src) {
        fetch(lowResSrc, { method: 'HEAD' })
          .then(response => {
            if (response.ok && !isLoaded) {
              video.src = lowResSrc;
              video.addEventListener('canplaythrough', () => {
                // Once low-res is ready, switch to high-res in background
                if (src) {
                  const highResVideo = new Image();
                  highResVideo.src = src;
                  highResVideo.onload = () => {
                    if (!isLoaded) {
                      video.src = src;
                    }
                  };
                }
              }, { once: true });
            }
          })
          .catch(() => {
            // Low-res version not available
          });
      }
    };
    
    tryLowerResVersion();

    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      video.addEventListener("loadedmetadata", setupScrollTrigger);
      // Also set a timeout to handle videos that load slowly
      const timeoutId = setTimeout(() => {
        if (!isLoaded && video.readyState >= 1) {
          setupScrollTrigger();
        }
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }

    return () => {
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", setupScrollTrigger);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onTextIndexChange, onAfterVideoChange, src, isLoaded]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
