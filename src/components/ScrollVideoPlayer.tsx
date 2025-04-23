
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  const progressThreshold = isMobile ? 0.03 : 0.01;
  const frameRef = useRef<number | null>(null);
  const attemptedSourcesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();

    video.style.willChange = "contents";
    video.style.transform = "translate3d(0,0,0)";
    video.style.backfaceVisibility = "hidden";
    video.style.webkitBackfaceVisibility = "hidden";

    let srcAssigned = false;

    async function tryVideoSource(sourceUrl: string, sourceType: string): Promise<boolean> {
      if (!sourceUrl || attemptedSourcesRef.current.has(sourceUrl)) {
        return false;
      }
      
      attemptedSourcesRef.current.add(sourceUrl);
      console.log(`[ScrollVideo] Trying ${sourceType} video source: ${sourceUrl}`);
      
      try {
        const resp = await fetch(sourceUrl, { method: "HEAD" });
        if (resp.ok) {
          if (video.src !== sourceUrl) {
            video.src = sourceUrl;
            console.log(`[ScrollVideo] Assigned ${sourceType} video source: ${sourceUrl}`);
          }
          return true;
        }
      } catch (err) {
        console.log(`[ScrollVideo] Failed to load ${sourceType} source: ${err}`);
      }
      
      return false;
    }

    async function assignSource() {
      if (!src) {
        console.log("[ScrollVideo] No src provided.");
        return;
      }
      
      if (isMobile) {
        const mobileUrl = src.replace(/\.(mp4|webm|mov)$/i, '-mobile.$1');
        srcAssigned = await tryVideoSource(mobileUrl, "Mobile-optimized");
        if (srcAssigned) return;
        
        const lowResUrl = src.replace(/\.(mp4|webm|mov)$/i, '-low.$1');
        srcAssigned = await tryVideoSource(lowResUrl, "Low-resolution");
        if (srcAssigned) return;
      }
      
      const webmSrc = src.replace(/\.(mp4|mov)$/i, ".webm");
      if (video.canPlayType("video/webm")) {
        srcAssigned = await tryVideoSource(webmSrc, "WebM");
        if (srcAssigned) return;
      }
      
      await tryVideoSource(src, "Original");
    }

    assignSource();

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

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
        try {
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
        } catch (err) {
          console.error("[ScrollVideo] Frame update error:", err);
        }
      });
    };

    const setupScrollTrigger = () => {
      if (!video.duration) return;
      
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: isMobile ? 0.3 : 0.1,
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
    };

    // Remove the fetchPriority assignment as it's not supported in the HTMLVideoElement type
    // Instead, we'll use the preload attribute which is standard
    video.preload = "auto";

    if (video.readyState >= 2) {
      setupScrollTrigger();
    } else {
      video.addEventListener("loadedmetadata", setupScrollTrigger);
      
      const timeoutId = setTimeout(() => {
        if (!isLoaded && video.readyState >= 1) {
          console.log("[ScrollVideo] Using fallback initialization");
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
