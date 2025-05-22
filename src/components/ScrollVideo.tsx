
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import { useIsMobile } from "../hooks/use-mobile";
import { useIsAndroid } from "../hooks/use-android";

gsap.registerPlugin(ScrollTrigger);

// Standardize scroll distance to 4200px for all devices
const SCROLL_EXTRA_PX = 4200;
const AFTER_VIDEO_EXTRA_HEIGHT = 0;

const ScrollVideo: React.FC<{
  src?: string;
  onReady?: () => void;
}> = ({
  src,
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const [lastProgress, setLastProgress] = useState(0);
  const isMobile = useIsMobile();
  const isAndroid = useIsAndroid();
  
  console.log("Using standardized scroll distance:", SCROLL_EXTRA_PX + "px");
  
  // Ensure the src is secure (https) but don't provide a fallback URL
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;
  
  // Detect Firefox browser
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  // Calculate segment count - increase for Android for smoother transitions
  const segmentCount = isAndroid ? 8 : 5;

  // Add scroll event listener to detect when to hide/show video
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Show video when scroll position is 0-4200px, hide it when beyond 4200px
      setIsInViewport(scrollPosition <= SCROLL_EXTRA_PX);
      
      if (scrollPosition <= SCROLL_EXTRA_PX) {
        console.log("Showing video (scroll position <= 4200px)");
      } else {
        console.log("Hiding video (scroll position > 4200px)");
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
        console.log("Mobile detected: Forcing initial video visibility");
        
        // Force loading of the first frame
        video.currentTime = 0.001;
        video.load();
      }
      
      // Android-specific optimizations
      if (isAndroid) {
        console.log("Android detected: Applying Android-specific optimizations");
        
        // Enhanced hardware acceleration for Android
        video.style.transform = "translate3d(0,0,0) translateZ(0)";
        video.style.backfaceVisibility = "hidden";
        video.style.perspective = "1000px";
        
        // Apply will-change for GPU acceleration on Android
        video.style.willChange = "transform, opacity";
        
        // Force multiple frame loading attempts for Android
        const loadFirstFrame = () => {
          if (video.readyState >= 1) {
            // Set multiple timestamps to ensure frame loading
            video.currentTime = 0.001;
            setTimeout(() => { video.currentTime = 0.01; }, 50);
            setTimeout(() => { video.currentTime = 0.1; }, 100);
          }
        };
        
        loadFirstFrame();
        
        // Additional frame loading attempts for Android
        setTimeout(loadFirstFrame, 200);
        setTimeout(loadFirstFrame, 500);
        
        // Add Android-specific texture management
        video.style.imageRendering = "high-quality";
        
        // Prevent Android browser from unloading video textures
        setInterval(() => {
          if (video.paused && video.readyState >= 2) {
            // Touch the video element to prevent texture unloading
            const currentTime = video.currentTime;
            video.currentTime = currentTime + 0.001;
          }
        }, 2000);
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
          
          // Android-specific frame loading
          if (isAndroid) {
            // Use multiple frames to ensure texture loading on Android
            setTimeout(() => { video.currentTime = 0.01; }, 50);
            setTimeout(() => { video.currentTime = 0.1; }, 100);
          }
        }
      };
      
      // Add loadeddata event to ensure video is fully loaded before showing
      const handleLoadedData = () => {
        console.log("Video data loaded");
        
        // Also notify ready on loadeddata in case canplay doesn't fire
        if (onReady) {
          onReady();
        }
        
        // Set the currentTime to show the first frame for mobile
        if (isMobile) {
          video.currentTime = 0.001;
          
          // Android-specific frame loading
          if (isAndroid) {
            // Force rendering multiple frames for Android texture loading
            setTimeout(() => { video.currentTime = 0.01; }, 50);
            setTimeout(() => { video.currentTime = 0.1; }, 100);
          }
        }
      };
      
      // Add loadedmetadata event which might fire earlier on some devices
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded");
        
        // Set the currentTime to show the first frame for mobile
        if (isMobile) {
          video.currentTime = 0.001;
        }
        
        // Android-specific optimization after metadata loads
        if (isAndroid) {
          // Force hardware decoder initialization on Android
          video.play().then(() => {
            video.pause();
            console.log("Android: Forced play/pause to initialize hardware decoder");
          }).catch(err => {
            console.log("Android: Initial play failed, using alternative method", err);
            // Alternative method - set multiple frames
            video.currentTime = 0.001;
            setTimeout(() => { video.currentTime = 0.01; }, 50);
          });
        }
      };
      
      // Add error handling
      const handleError = (e: Event) => {
        console.error("Video error:", e);
        // Even if there's an error, try to notify ready
        if (onReady && !videoLoaded) {
          onReady();
        }
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("error", handleError);
      
      // Add a safety timeout to ensure visibility regardless of events
      const shortTimeoutId = setTimeout(() => {
        // Force visibility after a very short delay
        if (isMobile) {
          console.log("Mobile video visibility forced by short timeout");
        }
      }, 100);
      
      // Use a longer timeout as a fallback for all devices
      const timeoutId = setTimeout(() => {
        console.log("Video visibility forced by fallback timeout");
        
        // If video still hasn't loaded its first frame, try to force it
        if (isMobile && video.readyState < 2) {
          video.load();
          video.currentTime = 0.001;
          
          // Android-specific frame loading in the fallback timeout
          if (isAndroid) {
            // Try additional loading methods for Android
            setTimeout(() => {
              // Force hardware decoding with a quick play/pause
              video.play().then(() => {
                video.pause();
              }).catch(() => {
                // If play fails, try multiple frame settings
                video.currentTime = 0.01;
                setTimeout(() => { video.currentTime = 0.1; }, 50);
              });
            }, 50);
          }
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
  }, [secureVideoSrc, isMobile, isFirefox, isAndroid, onReady, videoLoaded]);

  // Add document-level interaction detection
  useEffect(() => {
    // Global interaction handler for mobile devices
    if (isMobile) {
      const handleInteraction = () => {
        console.log("User interaction detected");
        
        const video = videoRef.current;
        if (video) {
          // Try to display the first frame
          if (video.readyState >= 1) {
            video.currentTime = 0.001;
            
            // Android-specific interaction handling
            if (isAndroid) {
              // Force multiple frame renders on Android after interaction
              setTimeout(() => { video.currentTime = 0.01; }, 50);
              setTimeout(() => { video.currentTime = 0.1; }, 100);
              
              // Try to initialize hardware decoder on Android after interaction
              video.play().then(() => {
                video.pause();
                console.log("Android: Initialized hardware decoder after user interaction");
              }).catch(() => {
                console.log("Android: Play after interaction failed, using alternative methods");
              });
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
        isInViewport={isInViewport}
      >
        <video 
          ref={videoRef} 
          src={secureVideoSrc} 
          playsInline 
          preload="auto" 
          loop={false} 
          muted 
          tabIndex={-1} 
          className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none bg-black" 
          style={{
            minHeight: "100vh",
            backgroundColor: "black",
            display: "block",
            visibility: isInViewport ? "visible" : "hidden",
            opacity: isInViewport ? 1 : 0,
            transition: "opacity 0.3s ease-out"
          }} 
        />
      </ScrollVideoPlayer>
    </div>
  );
};

export default ScrollVideo;
