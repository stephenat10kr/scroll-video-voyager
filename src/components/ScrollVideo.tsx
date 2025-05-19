
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";
import { useIsMobile } from "../hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

// Increase scroll distance from 2000 to 4000
const SCROLL_EXTRA_PX = 4000;
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
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  // Detect Android device with improved detection
  const isAndroid = typeof navigator !== 'undefined' && 
    (navigator.userAgent.toLowerCase().indexOf('android') > -1 || 
     (navigator.platform && /android/i.test(navigator.platform)));
  
  // Calculate segment count (keeping this for ScrollVideoPlayer functionality)
  const segmentCount = 5;
  
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
      // Log device detection
      console.log("Device detection - Mobile:", isMobile, "Firefox:", isFirefox, "Android:", isAndroid);
      
      // Force initial visibility for mobile devices
      if (isMobile) {
        // Immediately make video element visible
        setVideoVisible(true);
        console.log("Mobile detected: Forcing initial video visibility");
        
        // Force loading of the first frame
        if (isAndroid) {
          // For Android, start at frame 3% into video to avoid first frame issue
          if (video.duration) {
            const initialPos = Math.min(0.03 * video.duration, 1);
            console.log(`Android: Setting initial position to ${initialPos.toFixed(2)}s on load`);
            video.currentTime = initialPos;
          } else {
            // If duration isn't available yet, move away from frame 0
            video.currentTime = 0.5; // Try a half-second in
            console.log("Android: Setting initial position to 0.5s as fallback");
          }
        } else {
          video.currentTime = 0.001;
        }
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
      
      // Android-specific optimizations
      if (isAndroid) {
        console.log("Android detected: Applying Android-specific optimizations");
        
        // For Android, start at a frame slightly in from the beginning to avoid frame 1 issue
        const trySetAndroidPosition = () => {
          if (video.readyState >= 1 && video.duration) {
            // Set to 3% into the video to avoid first frame issue
            const initialPos = Math.min(0.03 * video.duration, 1);
            console.log(`Android: Setting initial position to ${initialPos.toFixed(2)}s in trySet function`);
            video.currentTime = initialPos;
          }
        };
        
        trySetAndroidPosition();
        
        // Simpler hardware acceleration for Android
        video.style.transform = "translate3d(0,0,0)";
      }
      
      const handleCanPlay = () => {
        console.log("Video can play now");
        setVideoLoaded(true);
        setVideoVisible(true);
        
        // Always pause the video when it can play
        video.pause();
        console.log("Video paused on load");
        
        // For Android, ensure we're not at the first frame
        if (isAndroid && video.duration) {
          const initialPos = Math.min(0.03 * video.duration, 1);
          console.log(`Android: Setting position to ${initialPos}s on canplay`);
          video.currentTime = initialPos;
        }
        // For other mobile devices, we need to ensure a frame is displayed
        else if (isMobile) {
          // Set the currentTime to show the first frame
          video.currentTime = 0.001;
        }
      };
      
      // Add loadeddata event to ensure video is fully loaded before showing
      const handleLoadedData = () => {
        console.log("Video data loaded");
        setVideoVisible(true);
        
        // For Android, ensure we're not at the first frame
        if (isAndroid && video.duration) {
          const initialPos = Math.min(0.03 * video.duration, 1);
          console.log(`Android: Setting position to ${initialPos}s on loadeddata`);
          video.currentTime = initialPos;
        }
        // Set the currentTime to show the first frame for other mobile
        else if (isMobile) {
          video.currentTime = 0.001;
        }
      };
      
      // Add loadedmetadata event which might fire earlier on some devices
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded");
        setVideoVisible(true);
        
        // For Android, ensure we're not at the first frame
        if (isAndroid && video.duration) {
          const initialPos = Math.min(0.03 * video.duration, 1);
          console.log(`Android: Setting position to ${initialPos}s on loadedmetadata`);
          video.currentTime = initialPos;
        }
        // Set the currentTime to show the first frame for other mobile
        else if (isMobile) {
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
      
      // Special handler for Android to consistently avoid frame 1
      if (isAndroid) {
        const handleSeeked = () => {
          // After any seek operation, verify we're not at the beginning
          if (video.currentTime < 0.02 && video.duration) {
            // If we ended up at the beginning, move to the offset position
            const initialPos = Math.min(0.03 * video.duration, 1);
            video.currentTime = initialPos;
            console.log(`Android: Correcting position to ${initialPos}s after seek in component`);
          }
        };
        video.addEventListener("seeked", handleSeeked);
        
        // Clean up the extra event listener
        return () => {
          video.removeEventListener("seeked", handleSeeked);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("loadeddata", handleLoadedData);
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
          video.removeEventListener("error", handleError);
        };
      }
      
      // Add a safety timeout to ensure visibility regardless of events
      const shortTimeoutId = setTimeout(() => {
        // Force visibility after a very short delay
        if (isMobile) {
          setVideoVisible(true);
          console.log("Mobile video visibility forced by short timeout");
          
          // For Android, ensure we're not at frame 1
          if (isAndroid && video.readyState >= 1 && video.duration) {
            const initialPos = Math.min(0.03 * video.duration, 1);
            video.currentTime = initialPos;
            console.log(`Android: Setting position to ${initialPos}s in short timeout`);
          }
        }
      }, 100);
      
      // Use a longer timeout as a fallback for all devices
      const timeoutId = setTimeout(() => {
        setVideoVisible(true);
        console.log("Video visibility forced by fallback timeout");
        
        // If video still hasn't loaded its first frame, try to force it
        if (isMobile && video.readyState < 2) {
          video.load();
          
          // For Android, ensure we're not at frame 1
          if (isAndroid && video.duration) {
            const initialPos = Math.min(0.03 * video.duration, 1);
            video.currentTime = initialPos;
            console.log(`Android: Setting position to ${initialPos}s in fallback timeout`);
          } else {
            video.currentTime = 0.001;
          }
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
  }, [secureVideoSrc, isMobile, isFirefox, isAndroid]);

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
            // For Android, ensure we're not at frame 1
            if (isAndroid && video.duration) {
              const initialPos = Math.min(0.03 * video.duration, 1);
              video.currentTime = initialPos;
              console.log(`Android: Setting position to ${initialPos}s after user interaction`);
            } else {
              video.currentTime = 0.001;
            }
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
  }, [isMobile, isAndroid]);

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
        isAndroid={isAndroid}
        isFirefox={isFirefox}
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
