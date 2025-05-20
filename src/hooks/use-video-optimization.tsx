import { useEffect } from "react";

interface UseVideoOptimizationProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isMobile: boolean;
  isIOS: boolean;
  isFirefox: boolean;
}

/**
 * Hook to apply browser & device-specific video optimizations
 */
export const useVideoOptimization = ({
  videoRef,
  isMobile,
  isIOS,
  isFirefox
}: UseVideoOptimizationProps) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Basic video attributes for all devices
    video.controls = false;
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    
    // Explicitly pause the video during initialization
    video.pause();
    console.log("Video paused during initialization");

    // Enhanced iOS-specific optimizations
    if (isIOS) {
      console.log("Applying enhanced iOS optimizations");
      // Force hardware acceleration more aggressively for iOS
      video.style.transform = "translate3d(0,0,0)";
      video.style.webkitTransform = "translate3d(0,0,0)";
      // Ensure native playback is used on iOS
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("playsinline", "true");
    }
    
    // Mobile-specific optimizations that don't affect appearance
    if (isMobile) {
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
      
      // Firefox-specific optimizations
      if (isFirefox) {
        // Add Firefox-specific hardware acceleration hints
        video.style.transform = "translateZ(0)";
        // Additional Firefox optimization to improve rendering
        video.style.backfaceVisibility = "hidden";
      }
    }

    // Request high priority loading for the video
    if ('fetchPriority' in HTMLImageElement.prototype) {
      // @ts-ignore - TypeScript doesn't know about fetchPriority yet
      video.fetchPriority = 'high';
    }
  }, [videoRef, isMobile, isIOS, isFirefox]);
};
