
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

    // Chrome-specific optimizations still apply
    video.style.willChange = "contents";
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      video.style.transform = "translate3d(0,0,0)";
    }

    // --- Begin: Video source selection and logging ---
    // Figure out the possible alternatives based on the src extension
    let srcAssigned = false;
    const origSrc = src || "";
    
    // Clean up the Contentful URL if needed
    const cleanedSrc = origSrc.startsWith('//') ? `https:${origSrc}` : origSrc;
    
    // Try WebM format for supported browsers
    const webmSrc =
      cleanedSrc.match(/\.(mp4|mov)$/i) !== null
        ? cleanedSrc.replace(/\.(mp4|mov)$/i, ".webm")
        : cleanedSrc.match(/\.webm$/i)
        ? cleanedSrc
        : undefined;

    function logSource(type: string, url: string) {
      // eslint-disable-next-line no-console
      console.log(`[ScrollVideo] Assigned ${type} video source: ${url}`);
    }

    // Error handler for video
    const handleVideoError = () => {
      const errorMsg = `Error loading video: ${video.error?.message || 'Unknown error'}. Code: ${video.error?.code || 'N/A'}`;
      console.error(errorMsg);
      setLoadError(errorMsg);
    };
    
    video.addEventListener('error', handleVideoError);

    // Only attempt to assign new source if not already loaded
    async function assignSource() {
      if (!cleanedSrc) {
        // eslint-disable-next-line no-console
        console.log("[ScrollVideo] No src provided.");
        return;
      }
      
      console.log("[ScrollVideo] Trying to load video:", cleanedSrc);
      
      // For mobile, simplify by using the direct source and not trying WebM
      if (isMobile) {
        video.src = cleanedSrc;
        logSource("Mobile", cleanedSrc);
        return;
      }
      
      // Desktop flow - try WebM first if supported
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
        } catch (err) {
          console.warn("WebM format not available, falling back:", err);
        }
      }
      
      // Fallback to the originally provided source
      if (!srcAssigned) {
        if (video.src !== cleanedSrc) {
          video.src = cleanedSrc;
          const extension = cleanedSrc.split(".").pop() || "unknown";
          logSource(extension.toUpperCase(), cleanedSrc);
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
      
      // On mobile, we might need different scroll settings
      const scrollConfig = {
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: isMobile ? 0.2 : 0.1, // Slightly smoother on mobile
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
      // @ts-ignore - TypeScript doesn't know about fetchPriority yet
      video.fetchPriority = 'high';
    }

    // Try to load the video and handle errors
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
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onTextIndexChange, onAfterVideoChange, src, isLoaded, isMobile]);

  return (
    <>
      {loadError && (
        <div className="absolute top-0 left-0 w-full bg-red-500/70 text-white p-4 z-50 text-sm">
          {loadError}
        </div>
      )}
      {children}
    </>
  );
};

export default ScrollVideoPlayer;
