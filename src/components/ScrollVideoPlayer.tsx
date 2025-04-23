
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
  debugLog?: (message: string, data?: any) => void;
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
  debugLog = () => {},
}) => {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastProgressRef = useRef(0);
  const isMobile = useIsMobile();
  
  const progressThreshold = isMobile ? 0.03 : 0.01;
  const frameRef = useRef<number | null>(null);
  const attemptedSourcesRef = useRef<Set<string>>(new Set());
  const scrollStartTimestampRef = useRef<number>(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) {
      debugLog("Missing video or container refs");
      return;
    }

    // Configure video properties
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();

    // Set video styles for optimized performance
    video.style.willChange = "contents";
    video.style.transform = "translate3d(0,0,0)";
    video.style.backfaceVisibility = "hidden";
    video.style.webkitBackfaceVisibility = "hidden";

    debugLog("Video element configured", {
      playsInline: video.playsInline,
      muted: video.muted,
      preload: video.preload
    });

    let srcAssigned = false;

    async function tryVideoSource(sourceUrl: string, sourceType: string): Promise<boolean> {
      if (!sourceUrl || attemptedSourcesRef.current.has(sourceUrl)) {
        return false;
      }
      
      attemptedSourcesRef.current.add(sourceUrl);
      debugLog(`Trying ${sourceType} video source: ${sourceUrl}`);
      
      try {
        const resp = await fetch(sourceUrl, { method: "HEAD" });
        debugLog(`Source ${sourceType} fetch status: ${resp.status}`, {
          url: sourceUrl,
          headers: Array.from(resp.headers.entries())
        });
        
        if (resp.ok) {
          if (video.src !== sourceUrl) {
            video.src = sourceUrl;
            debugLog(`Assigned ${sourceType} video source: ${sourceUrl}`);
          }
          return true;
        }
      } catch (err) {
        debugLog(`Failed to load ${sourceType} source`, err);
      }
      
      return false;
    }

    async function assignSource() {
      if (!src) {
        debugLog("No src provided.");
        return;
      }
      
      // Try mobile-specific source first on mobile devices
      if (isMobile) {
        const mobileUrl = src.replace(/\.(mp4|webm|mov)$/i, '-mobile.$1');
        srcAssigned = await tryVideoSource(mobileUrl, "Mobile-optimized");
        if (srcAssigned) return;
        
        const lowResUrl = src.replace(/\.(mp4|webm|mov)$/i, '-low.$1');
        srcAssigned = await tryVideoSource(lowResUrl, "Low-resolution");
        if (srcAssigned) return;
      }
      
      // For mobile, prioritize MP4 over WebM (better compatibility)
      if (isMobile) {
        const mp4Src = src.replace(/\.(webm|mov)$/i, ".mp4");
        srcAssigned = await tryVideoSource(mp4Src, "MP4");
        if (srcAssigned) return;
      } else {
        // Try WebM format if supported by browser (for desktop)
        const webmSrc = src.replace(/\.(mp4|mov)$/i, ".webm");
        if (video.canPlayType("video/webm")) {
          srcAssigned = await tryVideoSource(webmSrc, "WebM");
          if (srcAssigned) return;
        }
      }
      
      // Fall back to original source
      srcAssigned = await tryVideoSource(src, "Original");
      
      // If still no source assigned, try fallback formats
      if (!srcAssigned) {
        debugLog("All source attempts failed, trying alternate formats");
        
        // Try .mp4 version
        if (!src.endsWith(".mp4")) {
          await tryVideoSource(src.replace(/\.(webm|mov)$/i, ".mp4"), "MP4 fallback");
        }
        
        // If in public directory, try directly
        if (src.includes("contentful.com")) {
          await tryVideoSource("/videos/HeroTest_1-720.mp4", "Local MP4");
        }
      }
    }

    assignSource();

    // Set up scrolling container size
    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
        debugLog("Container resized", {
          height: container.style.height,
          windowHeight: window.innerHeight
        });
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);

    const calculateSegmentLength = (segments: number) => {
      return 1 / (segments + 1);
    };
    const segLen = calculateSegmentLength(segmentCount);
    debugLog("Segment length calculated", { segLen, segmentCount });

    // Update video frame based on scroll position
    const updateVideoFrame = (progress: number) => {
      if (!video.duration) {
        debugLog("Video has no duration yet");
        return;
      }
      
      // Log performance for mobile
      if (isMobile) {
        const now = performance.now();
        if (now - scrollStartTimestampRef.current > 500) {
          debugLog("Scroll performance check", {
            timeSinceLastUpdate: now - scrollStartTimestampRef.current,
            progress,
            lastProgress: lastProgressRef.current
          });
          scrollStartTimestampRef.current = now;
        }
      }
      
      // Optimize frame updates by only updating when significant change occurs
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
          // Update video time based on scroll position
          if (isMobile) {
            debugLog(`Setting time to ${newTime.toFixed(2)} (${(progress * 100).toFixed(1)}%)`);
          }
          
          video.currentTime = newTime;
          
          // Calculate which text to display
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
          
          if (isMobile && textIdx !== null) {
            debugLog(`At text segment: ${textIdx + 1} of ${segmentCount}`);
          }
        } catch (err) {
          debugLog("Frame update error", err);
        }
      });
    };

    // Set up scroll trigger for controlling video playback
    const setupScrollTrigger = () => {
      if (!video.duration) {
        debugLog("Video has no duration, can't setup ScrollTrigger");
        return;
      }
      
      if (scrollTriggerRef.current) {
        debugLog("Killing existing ScrollTrigger");
        scrollTriggerRef.current.kill();
      }
      
      debugLog("Creating ScrollTrigger", {
        scrubSetting: isMobile ? 0.3 : 0.1,
        containerHeight: container.style.height
      });
      
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
          if (isNaN(progress)) {
            debugLog("Invalid progress value", { progress });
            return;
          }
          updateVideoFrame(progress);
        },
        onToggle: ({ isActive }) => {
          debugLog(`ScrollTrigger toggle: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
        },
        onRefresh: () => {
          debugLog("ScrollTrigger refreshed");
        }
      });
      
      setIsLoaded(true);
      debugLog("ScrollTrigger setup complete");
    };

    // Use preload attribute which is standard
    video.preload = "auto";

    // Set up video initialization
    debugLog(`Video readyState: ${video.readyState}`);
    if (video.readyState >= 2) {
      debugLog("Video metadata already loaded");
      setupScrollTrigger();
    } else {
      debugLog("Waiting for video metadata to load");
      video.addEventListener("loadedmetadata", () => {
        debugLog("Video metadata loaded");
        setupScrollTrigger();
      });
      
      // Fallback initialization if metadata takes too long
      const timeoutId = setTimeout(() => {
        if (!isLoaded && video.readyState >= 1) {
          debugLog("Using fallback initialization after timeout");
          setupScrollTrigger();
        }
      }, 2000); // Reduced from 1000 to 2000ms to give more time on slow connections
      
      return () => clearTimeout(timeoutId);
    }

    return () => {
      debugLog("ScrollVideoPlayer cleanup");
      window.removeEventListener("resize", resizeSection);
      video.removeEventListener("loadedmetadata", setupScrollTrigger);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onTextIndexChange, onAfterVideoChange, src, isLoaded, isMobile, debugLog]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
