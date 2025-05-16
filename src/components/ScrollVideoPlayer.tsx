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
  // Further reduce progress threshold for Safari to make video scrubbing smoother
  const progressThreshold = 0.0005; // Even smaller threshold for more updates
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  // Add Safari detection
  const isSafari = useRef(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  // Keep track of the last frame render time to limit frame rate on Safari
  const lastFrameTimeRef = useRef(0);
  // For Safari, use a less frequent frame update (e.g., limit to 10fps to improve performance)
  const safariFrameInterval = 100; // ~10fps for better performance
  // Save the last progress value to detect sudden jumps
  const progressHistoryRef = useRef<number[]>([]);
  // Keep a reference to the video duration
  const videoDurationRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Safari detection:", isSafari.current);
    console.log("Segment count:", segmentCount);

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    
    // Explicitly pause the video during initialization
    video.pause();
    console.log("Video paused during initialization");

    // Enhanced Safari-specific optimizations
    if (isSafari.current) {
      console.log("Applying enhanced Safari-specific optimizations");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      
      // Force hardware acceleration more aggressively
      video.style.transform = "translate3d(0,0,0) scale(1.001)"; // Subtle scale to force GPU
      video.style.webkitTransform = "translate3d(0,0,0) scale(1.001)";
      video.style.willChange = "transform, opacity";
      
      // Additional Safari optimizations
      video.style.backfaceVisibility = "hidden";
      video.style.webkitBackfaceVisibility = "hidden";
      
      // Make sure the video decoding is prioritized
      if ('playsInline' in video) {
        video.playsInline = true;
      }
      
      // Try to load a frame immediately
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
      }
      
      // Force high quality
      if ('preservesPitch' in video) {
        // @ts-ignore - TypeScript doesn't know about preservesPitch
        video.preservesPitch = false;
      }
      
      // On Safari, immediately set the video to the start position
      setTimeout(() => {
        if (video.readyState >= 1 && !isLoaded) {
          video.currentTime = 0.001;
          // If we have duration info, save it
          if (video.duration && isFinite(video.duration)) {
            videoDurationRef.current = video.duration;
          }
        }
      }, 50);
    }
    // Mobile-specific optimizations
    else if (isMobile) {
      // Keep these optimizations but remove visibility settings
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      
      // Force hardware acceleration
      video.style.transform = "translate3d(0,0,0)";
      video.style.willChange = "contents";
      
      // Ensure muted state for autoplay capability
      video.muted = true;
      
      // Force the first frame to display immediately
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
      }
    } else {
      // Chrome-specific optimizations still apply
      video.style.willChange = "contents";
      if (navigator.userAgent.indexOf("Chrome") > -1) {
        video.style.transform = "translate3d(0,0,0)";
      }
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
    
    // Enhanced video frame update logic with smoothing for Safari
    const updateVideoFrame = (progress: number) => {
      // If we know the duration, use it; otherwise try to get it from the video
      const duration = videoDurationRef.current || (video.duration || 0);
      
      if (duration <= 0) {
        // If we still don't have duration, try to get it
        if (video.readyState >= 1 && video.duration > 0 && isFinite(video.duration)) {
          videoDurationRef.current = video.duration;
        } else {
          return; // Can't update without duration info
        }
      }
      
      // For Safari, implement progress smoothing
      if (isSafari.current) {
        // Store progress history (keep last 5 values)
        progressHistoryRef.current.push(progress);
        if (progressHistoryRef.current.length > 5) {
          progressHistoryRef.current.shift();
        }
        
        // For Safari, throttle frame updates to improve performance
        const now = performance.now();
        if (now - lastFrameTimeRef.current < safariFrameInterval) {
          // Skip this frame update if we're updating too frequently on Safari
          return;
        }
        
        // Detect large jumps in progress (which can cause flicker)
        if (progressHistoryRef.current.length > 1) {
          const lastProgress = progressHistoryRef.current[progressHistoryRef.current.length - 2];
          // If jump is too large, smooth it
          if (Math.abs(progress - lastProgress) > 0.1) {
            // Use smoothed progress instead
            progress = (lastProgress * 0.7) + (progress * 0.3);
            console.log("Smoothing large progress jump:", lastProgress, "->", progress);
          }
        }
        
        lastFrameTimeRef.current = now;
      }
      
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      lastProgressRef.current = progress;
      
      // Call the progress change callback
      if (onProgressChange) {
        onProgressChange(progress);
      }
      
      const newTime = progress * videoDurationRef.current;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        video.currentTime = newTime;
        
        // For Safari, send the afterVideo event even earlier (at 90% progress)
        // This helps keep the video visible longer
        if (isSafari.current) {
          onAfterVideoChange(progress >= 0.90);
        } else {
          onAfterVideoChange(progress >= 1);
        }
      });
    };

    const setupScrollTrigger = () => {
      if (setupCompleted.current) return;
      
      // For mobile or Safari, try to render a frame immediately without waiting for duration
      if (isMobile || isSafari.current) {
        video.currentTime = 0.001;
        
        // If we have duration info already, save it
        if (video.duration && isFinite(video.duration)) {
          videoDurationRef.current = video.duration;
        }
      }
      
      // For Safari, we'll proceed even without duration, using a fallback logic
      if (!video.duration && !isMobile && !isSafari.current) {
        console.log("Video duration not yet available, waiting...");
        return;
      }
      
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      // Ensure video is paused before setting up ScrollTrigger
      video.pause();
      
      // Enhanced ScrollTrigger for Safari
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: isSafari.current ? 1.0 : (isMobile ? 0.5 : 0.4), // Even more scrub for Safari
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress)) return;
          updateVideoFrame(progress);
        },
        // Special handling for Safari to keep video visible longer
        onLeave: () => {
          if (isSafari.current) {
            // For Safari, we'll delay hiding the video even longer on leaving
            setTimeout(() => {
              if (scrollTriggerRef.current && 
                  scrollTriggerRef.current.progress >= 1) {
                console.log("ScrollTrigger onLeave - checking visibility");
                // Perform additional checks before hiding
                const scrollPos = window.scrollY;
                if (scrollPos > SCROLL_EXTRA_PX * 0.9) {
                  console.log("ScrollTrigger - video should hide now");
                } else {
                  console.log("ScrollTrigger - keeping video visible");
                }
              }
            }, 800); // Much longer delay for Safari (800ms)
          }
        },
        // Help keep video visible when entering the trigger area
        onEnter: () => {
          if (isSafari.current) {
            console.log("ScrollTrigger onEnter - ensuring video visibility");
            if (videoRef.current) {
              videoRef.current.style.opacity = "1";
            }
          }
        }
      });
      
      setIsLoaded(true);
      setupCompleted.current = true;
      
      console.log("ScrollTrigger setup completed");
    };

    // Request high priority loading for the video
    if ('fetchPriority' in HTMLImageElement.prototype) {
      // @ts-ignore - TypeScript doesn't know about fetchPriority yet
      video.fetchPriority = 'high';
    }

    // For Safari or mobile devices, we'll set up ScrollTrigger even without duration
    if (isSafari.current || isMobile) {
      setupScrollTrigger();
    } else if (video.readyState >= 2) {
      setupScrollTrigger();
    }

    // Capture duration as soon as it's available for Safari
    const handleDurationChange = () => {
      if (video.duration && isFinite(video.duration)) {
        console.log("Duration available:", video.duration);
        videoDurationRef.current = video.duration;
      }
    };
    video.addEventListener('durationchange', handleDurationChange);

    // Set up event listeners regardless of initial state
    const setupEvents = ['loadedmetadata', 'canplay', 'loadeddata'];
      
    const handleVideoReady = () => {
      // When video is ready, capture its duration
      if (video.duration && isFinite(video.duration)) {
        videoDurationRef.current = video.duration;
      }
      
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
    
    // Safety timeout to ensure ScrollTrigger gets set up
    // Reduced timeout for Safari to ensure quicker setup
    const timeoutId = setTimeout(() => {
      if (!setupCompleted.current) {
        console.log("Setting up ScrollTrigger after timeout");
        setupScrollTrigger();
      }
    }, isSafari.current ? 150 : 300);
    
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
      video.removeEventListener('durationchange', handleDurationChange);
      clearTimeout(timeoutId);
      setupCompleted.current = false;
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, onProgressChange, src, isLoaded, isMobile]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
