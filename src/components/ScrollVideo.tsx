import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import { useIsMobile } from "../hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

// Increase scroll distance
const SCROLL_EXTRA_PX = 2000;
const AFTER_VIDEO_EXTRA_HEIGHT = 0;

const ScrollVideo: React.FC<{
  src?: string;
}> = ({
  src
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
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;
  
  // Keep track of Safari browser specifically
  const isSafari = useRef(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  
  // Calculate segment count (keeping this for ScrollVideoPlayer functionality)
  const segmentCount = 5;
  
  // Add intersection observer to detect when video exits viewport
  useEffect(() => {
    if (!containerRef.current) return;

    // Significantly increase the rootMargin to make the video disappear much later
    // This ensures the video stays visible longer when scrolling, especially on Safari
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
        
        // Safari-specific: keep video visible even after exiting viewport
        if (isSafari.current && !entry.isIntersecting) {
          // Delay setting isInViewport to false for Safari
          setTimeout(() => {
            // Check if we're still not intersecting before setting to false
            if (!entry.isIntersecting) {
              setIsInViewport(false);
            }
          }, 300); // 300ms delay before hiding on Safari
          return;
        }
        
        setIsInViewport(entry.isIntersecting);
      },
      { 
        threshold: 0.01,  // Trigger when just 1% of element is visible
        rootMargin: "0px 0px 300px 0px" // Increased to 300px at the bottom for Safari
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
      // Scrolling up - set smoother transition for Safari
      if (videoRef.current) {
        // Slower transition for Safari when scrolling up
        const transitionDuration = isSafari.current ? "0.5s" : "0.3s";
        videoRef.current.style.transition = `opacity ${transitionDuration} ease-in-out`;
      }
    }
    setLastProgress(progress);
  }, [progress]);

  // Add optimization for Safari specifically
  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    const video = videoRef.current;
    if (video && secureVideoSrc) {
      // Safari-specific optimizations
      if (isSafari) {
        // Force video to stay visible longer on Safari
        setVideoVisible(true);
        
        // Apply Safari-specific styles
        video.style.willChange = 'transform';
        video.style.transform = 'translateZ(0)';
        
        // Make sure playsinline is set for Safari
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        
        // Add additional Safari-specific optimizations to keep video visible
        video.style.backfaceVisibility = 'hidden'; // Helps with Safari rendering
        
        // For Safari, we want to ensure the video stays in memory
        video.style.display = 'block !important';
        video.style.visibility = 'visible !important';
      }
      
      // Force initial visibility for mobile devices
      if (isMobile) {
        // Immediately make video element visible
        setVideoVisible(true);
        console.log("Mobile detected: Forcing initial video visibility");
        
        // Force loading of the first frame
        video.currentTime = 0.001;
        video.load();
      }
      
      // ... keep existing code (event handler functions and event listeners)
      const handleCanPlay = () => {
        console.log("Video can play now");
        setVideoLoaded(true);
        setVideoVisible(true);
        
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
  }, [secureVideoSrc, isMobile]);

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
            // Use much longer fade-out transition for Safari to make disappearance smoother
            transition: isSafari.current ? "opacity 0.8s ease-in-out" : "opacity 0.5s ease-in-out",
            display: "block",
            visibility: "visible"
          }} 
        />
      </ScrollVideoPlayer>

      <ScrollVideoTextOverlay 
        containerRef={containerRef}
      />
    </div>
  );
};

export default ScrollVideo;
