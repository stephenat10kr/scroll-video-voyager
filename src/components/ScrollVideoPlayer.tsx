
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsAndroid } from "../hooks/use-android";

gsap.registerPlugin(ScrollTrigger);

type ScrollVideoPlayerProps = {
  src?: string;
  segmentCount: number;
  onAfterVideoChange: (after: boolean) => void;
  onProgressChange?: (progress: number) => void;
  onVideoReady?: () => void;
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
  onVideoReady,
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
  const progressThreshold = 0.001; // Increased threshold for better performance
  const frameRef = useRef<number | null>(null);
  const setupCompleted = useRef(false);
  const videoEndedRef = useRef(false);
  const videoReadyCalledRef = useRef(false);
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  // Use the Android hook for detection
  const isAndroid = useIsAndroid();

  // Create a ref to store the current interpolation target time
  const targetTimeRef = useRef<number>(0);
  // Create a ref to store the current animation frame ID for interpolation
  const interpolationFrameRef = useRef<number | null>(null);
  // Create a ref to track if interpolation is in progress
  const isInterpolatingRef = useRef<boolean>(false);
  // Interpolation speed factor (higher means faster transition)
  const interpolationSpeed = 0.15;

  // Function to smoothly interpolate video time for Android
  const smoothlyUpdateVideoTime = (video: HTMLVideoElement, targetTime: number) => {
    // Store the target time for reference
    targetTimeRef.current = targetTime;
    
    // If we're already interpolating, no need to start another loop
    if (isInterpolatingRef.current) return;
    
    isInterpolatingRef.current = true;
    
    // Function for the interpolation loop
    const interpolateTime = () => {
      if (!video) {
        isInterpolatingRef.current = false;
        return;
      }
      
      const currentTime = video.currentTime;
      const timeDiff = targetTimeRef.current - currentTime;
      
      // If we're close enough to the target, set the time directly and stop
      if (Math.abs(timeDiff) < 0.01) {
        video.currentTime = targetTimeRef.current;
        isInterpolatingRef.current = false;
        return;
      }
      
      // Calculate the next time value with easing
      const newTime = currentTime + (timeDiff * interpolationSpeed);
      
      // Update the video time
      video.currentTime = newTime;
      
      // Continue the interpolation in the next frame
      interpolationFrameRef.current = requestAnimationFrame(interpolateTime);
    };
    
    // Start the interpolation loop
    if (interpolationFrameRef.current) {
      cancelAnimationFrame(interpolationFrameRef.current);
    }
    interpolationFrameRef.current = requestAnimationFrame(interpolateTime);
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("Mobile detection:", isMobile);
    console.log("Android detection:", isAndroid);
    console.log("Firefox detection:", isFirefox);
    console.log("Segment count:", segmentCount);

    // Optimize video element
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    
    // Explicitly pause the video during initialization
    video.pause();
    console.log("Video paused during initialization");

    // iOS-specific optimizations
    if (isMobile && !isAndroid) {
      console.log("iOS detected: Applying iOS-specific optimizations");
      
      // iOS requires specific attributes
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      
      // Ensure muted for autoplay capability
      video.muted = true;
      
      // iOS-specific hardware acceleration
      video.style.transform = "translate3d(0,0,0)";
      video.style.willChange = "transform";
      video.style.webkitTransform = "translate3d(0,0,0)";
      
      // Force the first frame to display for iOS
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
      }
    }
    // Android-specific optimizations
    else if (isAndroid) {
      console.log("Applying Android-specific optimizations");
      
      // Enhanced hardware acceleration for Android
      video.style.transform = "translate3d(0,0,0) translateZ(0)";
      video.style.backfaceVisibility = "hidden";
      video.style.perspective = "1000px";
      video.style.maxWidth = "100%";
      video.style.maxHeight = "100%";
      video.style.webkitTransform = "translate3d(0,0,0)";
      video.style.willChange = "transform, opacity";
      
      if (video.readyState >= 1) {
        setTimeout(() => {
          video.currentTime = 0.001;
          console.log("Forced initial frame on Android");
        }, 50);
      }
    } 
    // Desktop optimizations
    else {
      video.style.willChange = "contents";
      if (navigator.userAgent.indexOf("Chrome") > -1) {
        video.style.transform = "translate3d(0,0,0)";
      }
      
      if (isFirefox) {
        video.style.transform = "translateZ(0)";
        video.style.backfaceVisibility = "hidden";
      }
    }

    // Video source assignment
    if (!src) {
      console.log("[ScrollVideo] No src provided.");
      return;
    }

    if (video.src !== src) {
      video.src = src;
      const extension = src.split(".").pop() || "unknown";
      console.log(`[ScrollVideo] Assigned ${extension.toUpperCase()} video source: ${src}`);
    }

    const resizeSection = () => {
      if (container) {
        container.style.height = `${window.innerHeight + SCROLL_EXTRA_PX + AFTER_VIDEO_EXTRA_HEIGHT}px`;
      }
    };
    resizeSection();
    window.addEventListener("resize", resizeSection);
    
    const updateVideoFrame = (progress: number) => {
      if (!video || !video.duration || !isFinite(video.duration)) {
        console.log("Video not ready for scrubbing:", { duration: video?.duration, readyState: video?.readyState });
        return;
      }
      
      // Check if progress change is significant enough
      if (Math.abs(progress - lastProgressRef.current) < progressThreshold) {
        return;
      }
      lastProgressRef.current = progress;
      
      if (onProgressChange) {
        onProgressChange(progress);
      }
      
      // Calculate the target time - ensure we use the full video duration
      const targetTime = Math.min(progress * video.duration, video.duration - 0.01);
      
      console.log(`Video scrubbing: progress=${progress.toFixed(4)}, targetTime=${targetTime.toFixed(3)}, duration=${video.duration.toFixed(3)}`);
      
      // Check if we've reached the end
      const isAtEnd = progress >= 0.99; // Use 99% instead of 100% to avoid edge cases
      
      if (isAtEnd && !videoEndedRef.current) {
        videoEndedRef.current = true;
        console.log(`Video reached end: progress=${progress.toFixed(4)}`);
        onAfterVideoChange(true);
      } else if (!isAtEnd && videoEndedRef.current) {
        videoEndedRef.current = false;
        onAfterVideoChange(false);
      }
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        try {
          if (isAndroid) {
            smoothlyUpdateVideoTime(video, targetTime);
          } else {
            video.currentTime = targetTime;
          }
          console.log(`Video time updated to: ${video.currentTime.toFixed(3)}`);
        } catch (error) {
          console.error("Error updating video time:", error);
        }
      });
    };

    const setupScrollTrigger = () => {
      if (setupCompleted.current) return;
      
      // Wait for video to be ready
      if (!video.duration || !isFinite(video.duration)) {
        console.log("Video duration not available, waiting...");
        return;
      }
      
      console.log(`Video ready for ScrollTrigger setup. Duration: ${video.duration}s`);
      
      if (isMobile && !isAndroid) {
        video.currentTime = 0.001;
      }
      
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      
      video.pause();
      
      let scrubValue = isFirefox ? 2.5 : (isMobile ? 1.0 : 0.8);
      
      if (isAndroid) {
        scrubValue = 1.8;
        console.log("Using Android-optimized scrub value:", scrubValue);
      }
      
      console.log(`Using scrub value: ${scrubValue} for ${isFirefox ? 'Firefox' : (isAndroid ? 'Android' : (isMobile ? 'mobile' : 'desktop'))}`);
      
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${SCROLL_EXTRA_PX}`,
        scrub: scrubValue,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          const progress = self.progress;
          if (isNaN(progress) || progress < 0 || progress > 1) {
            console.warn("Invalid progress value:", progress);
            return;
          }
          updateVideoFrame(progress);
        }
      });
      
      setIsLoaded(true);
      setupCompleted.current = true;
      
      // Call onVideoReady callback once
      if (onVideoReady && !videoReadyCalledRef.current) {
        onVideoReady();
        videoReadyCalledRef.current = true;
      }
      
      console.log("ScrollTrigger setup completed with scrub value:", scrubValue);
    };

    // Enhanced video ready detection
    const handleVideoReady = () => {
      console.log("Video ready event fired:", { readyState: video.readyState, duration: video.duration });
      if (!setupCompleted.current && video.duration && isFinite(video.duration)) {
        console.log("Setting up ScrollTrigger after video event");
        setupScrollTrigger();
      }
    };

    // Wait for video metadata to be loaded before setting up ScrollTrigger
    if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
      setupScrollTrigger();
    } else {
      const setupEvents = ['loadedmetadata', 'canplay', 'loadeddata', 'durationchange'];
      
      setupEvents.forEach(event => {
        video.addEventListener(event, handleVideoReady);
      });
      
      // Fallback timeout
      const timeoutId = setTimeout(() => {
        if (!setupCompleted.current) {
          console.log("Setting up ScrollTrigger after timeout");
          setupScrollTrigger();
        }
      }, 1000); // Increased timeout
      
      // Cleanup function
      return () => {
        window.removeEventListener("resize", resizeSection);
        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.kill();
        }
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        if (interpolationFrameRef.current) {
          cancelAnimationFrame(interpolationFrameRef.current);
        }
        setupEvents.forEach(event => {
          video.removeEventListener(event, handleVideoReady);
        });
        clearTimeout(timeoutId);
        setupCompleted.current = false;
        isInterpolatingRef.current = false;
        videoEndedRef.current = false;
        videoReadyCalledRef.current = false;
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
      if (interpolationFrameRef.current) {
        cancelAnimationFrame(interpolationFrameRef.current);
      }
      setupCompleted.current = false;
      isInterpolatingRef.current = false;
      videoEndedRef.current = false;
      videoReadyCalledRef.current = false;
    };
  }, [segmentCount, SCROLL_EXTRA_PX, AFTER_VIDEO_EXTRA_HEIGHT, containerRef, videoRef, onAfterVideoChange, onProgressChange, onVideoReady, src, isLoaded, isMobile, isAndroid]);

  return <>{children}</>;
};

export default ScrollVideoPlayer;
