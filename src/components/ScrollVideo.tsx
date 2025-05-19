
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import { useIsMobile } from "../hooks/use-mobile";
import { useIsAndroid } from "../hooks/use-android";

gsap.registerPlugin(ScrollTrigger);

// Increase scroll distance from 2000 to 4000
const SCROLL_EXTRA_PX = 4000;
const AFTER_VIDEO_EXTRA_HEIGHT = 0;

const ScrollVideo: React.FC<{
  src?: string;
  onReady?: () => void; // Add onReady callback prop
}> = ({
  src,
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const [lastProgress, setLastProgress] = useState(0);
  const isMobile = useIsMobile();
  const isAndroid = useIsAndroid();
  
  // Ensure the src is secure (https) but don't provide a fallback URL
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  // Calculate segment count - increase for Android for smoother transitions
  const segmentCount = isAndroid ? 8 : 5;
  
  // Add intersection observer to detect when video exits viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { 
        threshold: 0.01,  // Trigger when just 1% of element is visible
        rootMargin: "0px" // No additional margin
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Update progress state and determine scroll direction
  useEffect(() => {
    if (progress > lastProgress) {
      // Scrolling down - set immediate transition
      if (videoRef.current) {
        videoRef.current.style.transition = "opacity 0s";
      }
    } else {
      // Scrolling up - set smooth transition
      if (videoRef.current) {
        videoRef.current.style.transition = "opacity 0.3s ease-in-out";
      }
    }
    setLastProgress(progress);
  }, [progress]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && secureVideoSrc) {
      // Force initial visibility for mobile devices
      if (isMobile) {
        // Immediately make video element visible
        setVideoVisible(true);
        console.log("Mobile detected: Forcing initial video visibility");
        
        // Force loading of the first frame
        video.currentTime = 0.001;
        video.load();
      }
      
      // Firefox-specific optimizations
      if (isFirefox) {
        console.log("Firefox detected: Applying Firefox-specific optimizations");
        
        // Apply Firefox-specific hardware acceleration hints
        video.style.transform = "translateZ(0)";
        video.style.backfaceVisibility = "hidden";
        
        // Try to improve Firefox performance by reducing motion complexity
        video.style.willChange = "transform, opacity";
      }
      
      const handleCanPlay = () => {
        console.log("Video can play now");
        setVideoLoaded(true);
        setVideoVisible(true);
        
        // Notify parent that video is ready
        if (onReady) {
          onReady();
        }
        
        // Always pause the video when it can play
        video.pause();
        console.log("Video paused on load");
        
        // For mobile, we need to ensure a frame is displayed
        if (isMobile) {
          // Set the currentTime to show the first frame
          video.currentTime = 0.001;
        }
      };
      
      // Add loadeddata event to ensure video is fully loaded before showing
      const handleLoadedData = () => {
        console.log("Video data loaded");
        setVideoVisible(true);
        
        // Also notify ready on loadeddata in case canplay doesn't fire
        if (onReady) {
          onReady();
        }
        
        // Set the currentTime to show the first frame for mobile
        if (isMobile) {
          video.currentTime = 0.001;
        }
      };
      
      // Add loadedmetadata event which might fire earlier on some devices
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded");
        setVideoVisible(true);
        
        // Set the currentTime to show the first frame for mobile
        if (isMobile) {
          video.currentTime = 0.001;
        }
      };
      
      // Add error handling
      const handleError = (e: Event) => {
        console.error("Video error:", e);
        // Even if there's an error, ensure video is visible
        setVideoVisible(true);
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("error", handleError);
      
      // Add a safety timeout to ensure visibility regardless of events
      const shortTimeoutId = setTimeout(() => {
        // Force visibility after a very short delay
        if (isMobile) {
          setVideoVisible(true);
          console.log("Mobile video visibility forced by short timeout");
        }
      }, 100);
      
      // Use a longer timeout as a fallback for all devices
      const timeoutId = setTimeout(() => {
        setVideoVisible(true);
        console.log("Video visibility forced by fallback timeout");
        
        // If video still hasn't loaded its first frame, try to force it
        if (isMobile && video.readyState < 2) {
          video.load();
          video.currentTime = 0.001;
        }
        
        // Also notify ready after timeout as a last resort
        if (onReady && !videoLoaded) {
          onReady();
        }
      }, 300);
      
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleError);
        clearTimeout(shortTimeoutId);
        clearTimeout(timeoutId);
      };
    }
  }, [secureVideoSrc, isMobile, isFirefox, onReady, videoLoaded]);

  // Add document-level interaction detection
  useEffect(() => {
    // Global interaction handler for mobile devices
    if (isMobile) {
      const handleInteraction = () => {
        console.log("User interaction detected");
        setVideoVisible(true);
        
        const video = videoRef.current;
        if (video) {
          // Try to display the first frame
          if (video.readyState >= 1) {
            video.currentTime = 0.001;
          }
        }
      };
      
      // Listen for any user interaction
      document.addEventListener('touchstart', handleInteraction, { once: true });
      document.addEventListener('click', handleInteraction, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('click', handleInteraction);
      };
    }
  }, [isMobile]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen overflow-hidden bg-black" 
      style={{ zIndex: 1 }}
    >
      <ScrollVideoPlayer 
        src={secureVideoSrc} 
        segmentCount={segmentCount} 
        onAfterVideoChange={setIsAfterVideo}
        onProgressChange={setProgress}
        videoRef={videoRef} 
        containerRef={containerRef} 
        SCROLL_EXTRA_PX={SCROLL_EXTRA_PX} 
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT} 
        isMobile={isMobile}
      >
        <video 
          ref={videoRef} 
          src={secureVideoSrc} 
          playsInline 
          preload="auto" 
          loop={false} 
          muted 
          tabIndex={-1} 
          className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black" 
          style={{
            minHeight: "100vh",
            opacity: videoVisible && isInViewport ? 1 : 0,
            // Transition is now managed dynamically based on scroll direction
            display: "block",
            visibility: "visible",
            backgroundColor: "black" // Ensure background is black, not white
          }} 
        />
      </ScrollVideoPlayer>
    </div>
  );
};

export default ScrollVideo;
