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
  isMobile: boolean;
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
  isMobile,
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastProgressRef = useRef(0);
  const progressThreshold = 0.015;
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();

    // Mobile-specific optimizations
    if (isMobile) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
    }

    // Chrome-specific optimizations still apply
    video.style.willChange = "contents";
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      video.style.transform = "translate3d(0,0,0)";
    }

    // --- Begin: Video source selection and logging ---
    // Figure out the possible alternatives based on the src extension
    let srcAssigned = false;
    const origSrc = src || "";
    const webmSrc =
      origSrc.match(/\.(mp4|mov)$/i) !== null
        ? origSrc.replace(/\.(mp4|mov)$/i, ".webm")
        : origSrc.match(/\.webm$/i)
        ? origSrc
        : undefined;

    function logSource(type: string, url: string) {
      console.log(`[ScrollVideo] Assigned ${type} video source: ${url}`);
    }

    // Only attempt to assign new source if not already loaded
    async function assignSource() {
      if (!origSrc) {
        console.log("[ScrollVideo] No src provided.");
        return;
      }
      
      // For mobile, prefer MP4 format
      if (isMobile) {
        if (video.src !== origSrc) {
          video.src = origSrc;
          const extension = origSrc.split(".").pop() || "unknown";
          logSource(`Mobile ${extension.toUpperCase()}`, origSrc);
        }
        srcAssigned = true;
        return;
      }
      
      // For desktop, prefer WebM if supported
      if (webmSrc && video.canPlayType("video/webm")) {
        // Test if the file exists (HEAD request)
        try {
          const resp = await fetch(webmSrc, { method: "HEAD" });
          if (resp.ok) {
            if (video.src !== webmSrc) {
              video.src = webmSrc;
              logSource("WebM", webmSrc);
            }
            srcAssigned = true;
            return;
          }
        } catch {
          // not available, fallback
        }
      }
      
      // Fallback to the originally provided source
      if (!srcAssigned) {
        if (video.src !== origSrc) {
          video.src = origSrc;
          const extension = origSrc.split(".").pop() || "unknown";
          logSource(extension.toUpperCase(), origSrc);
        }
      }
    }

    assignSource();

    // --- End: Video source selection and logging ---

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
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      lastProgressRef.current = progress;
      const newTime = progress * video.duration;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(() => {
        video.currentTime = newTime;
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
      
      // For mobile, attempt to trigger video playback after scroll
      if (isMobile) {
        const touchStart = () => {
          video.play().catch(err => console.log("Mobile play attempt:", err));
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
    
    if (!isMobile) {
      tryLowerResVersion();
    }

    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      video.addEventListener("loadedmetadata", setupScrollTrigger);
      
      // Safety timeout - if metadata doesn't load in a reasonable time
      const timeoutId = setTimeout(() => {
        if (!isLoaded && video.readyState >= 1) {
          console.log("Setting up ScrollTrigger after timeout");
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
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onTextIndexChange, onAfterVideoChange, src, isLoaded, isMobile]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
