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
  onReady?: () => void;
  onFirstFrameLoaded?: () => void; // New callback for first frame loaded
}> = ({
  src,
  onReady,
  onFirstFrameLoaded
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const [lastProgress, setLastProgress] = useState(0);
  const [firstFrameConfirmed, setFirstFrameConfirmed] = useState(false);
  const isMobile = useIsMobile();
  const isAndroid = useIsAndroid();
  const readyCalledRef = useRef(false);
  const firstFrameCalledRef = useRef(false);
  
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
      // Set background color to black immediately to prevent white flash
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = 'black';
      }
      video.style.backgroundColor = 'black';
      document.body.style.backgroundColor = 'black';
      
      // Force initial visibility for mobile devices
      if (isMobile) {
        // Immediately make video element visible
        setVideoVisible(true);
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
          if (video.paused && !videoVisible && video.readyState >= 2) {
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
        setVideoVisible(true);
        
        // Notify parent that video is ready, but only once
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback");
          onReady();
          readyCalledRef.current = true;
        }
        
        // Always pause the video when it can play
        video.pause();
        console.log("Video paused on load");
        
        // For all devices, ensure a frame is displayed
        video.currentTime = 0.001;
        
        // After a short delay, check if the frame has loaded
        setTimeout(() => {
          if (video.readyState >= 2) {
            console.log("First frame confirmed loaded in canplay handler");
            setFirstFrameConfirmed(true);
            
            // Notify parent that first frame is loaded, but only once
            if (onFirstFrameLoaded && !firstFrameCalledRef.current) {
              console.log("Calling onFirstFrameLoaded callback from canplay");
              onFirstFrameLoaded();
              firstFrameCalledRef.current = true;
            }
          }
        }, 100);
      };
      
      // Add loadeddata event to ensure video is fully loaded before showing
      const handleLoadedData = () => {
        console.log("Video data loaded");
        setVideoVisible(true);
        
        // Also notify ready on loadeddata if not already called
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback from loadeddata");
          onReady();
          readyCalledRef.current = true;
        }
        
        // Set the currentTime to show the first frame
        video.currentTime = 0.001;
        
        // After loadeddata, the first frame should be available
        setTimeout(() => {
          console.log("First frame confirmed loaded in loadeddata handler");
          setFirstFrameConfirmed(true);
          
          // Notify parent that first frame is loaded if not already called
          if (onFirstFrameLoaded && !firstFrameCalledRef.current) {
            console.log("Calling onFirstFrameLoaded callback from loadeddata");
            onFirstFrameLoaded();
            firstFrameCalledRef.current = true;
          }
        }, 50);
      };
      
      // Add seeked event to confirm frame navigation worked
      const handleSeeked = () => {
        console.log("Video seeked to specific frame");
        
        if (!firstFrameConfirmed) {
          console.log("First frame confirmed loaded in seeked handler");
          setFirstFrameConfirmed(true);
          
          // Notify parent that first frame is loaded if not already called
          if (onFirstFrameLoaded && !firstFrameCalledRef.current) {
            console.log("Calling onFirstFrameLoaded callback from seeked");
            onFirstFrameLoaded();
            firstFrameCalledRef.current = true;
          }
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
        // Even if there's an error, ensure video is visible
        setVideoVisible(true);
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("seeked", handleSeeked);
      video.addEventListener("error", handleError);
      
      // Safety timeout to ensure visibility and trigger callbacks
      const shortTimeoutId = setTimeout(() => {
        // Force visibility after a very short delay
        setVideoVisible(true);
        console.log("Video visibility forced by short timeout");
      }, 100);
      
      // Use a longer timeout as a fallback for all devices
      const timeoutId = setTimeout(() => {
        console.log("Fallback timeout triggered for video loading");
        setVideoVisible(true);
        
        // If video still hasn't loaded its first frame, try to force it
        if (video.readyState < 2) {
          video.load();
          video.currentTime = 0.001;
          
          // Try additional loading methods
          setTimeout(() => {
            // Try to force frame loading
            video.currentTime = 0.01;
            
            // If we still don't have confirmation, just assume it worked
            setTimeout(() => {
              if (!firstFrameConfirmed) {
                console.log("First frame loading assumed complete by fallback timeout");
                setFirstFrameConfirmed(true);
                
                // Notify parent that first frame is loaded (fallback)
                if (onFirstFrameLoaded && !firstFrameCalledRef.current) {
                  console.log("Calling onFirstFrameLoaded callback from fallback");
                  onFirstFrameLoaded();
                  firstFrameCalledRef.current = true;
                }
              }
            }, 100);
          }, 50);
        }
        
        // Also notify ready after timeout as a last resort
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback from fallback timeout");
          onReady();
          readyCalledRef.current = true;
        }
      }, 500); // Increased from 300ms to 500ms
      
      // Long timeout as absolute fallback
      const longTimeoutId = setTimeout(() => {
        console.log("Long fallback timeout triggered - forcing callbacks");
        
        if (!readyCalledRef.current && onReady) {
          console.log("Forcing onReady callback");
          onReady();
          readyCalledRef.current = true;
        }
        
        if (!firstFrameCalledRef.current && onFirstFrameLoaded) {
          console.log("Forcing onFirstFrameLoaded callback");
          onFirstFrameLoaded();
          firstFrameCalledRef.current = true;
        }
      }, 2000);
      
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("seeked", handleSeeked);
        video.removeEventListener("error", handleError);
        clearTimeout(shortTimeoutId);
        clearTimeout(timeoutId);
        clearTimeout(longTimeoutId);
      };
    }
  }, [secureVideoSrc, isMobile, isFirefox, isAndroid, onReady, videoLoaded, onFirstFrameLoaded, firstFrameConfirmed]);

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
            transition: "opacity 0.5s ease-in-out",
            display: "block",
            visibility: "visible",
            backgroundColor: "black", // Ensure background is black
            transform: "translateZ(0)", // Force GPU acceleration
            willChange: "transform, opacity", // Performance optimization
            backfaceVisibility: "hidden" // Prevent rendering the back face
          }} 
        />
      </ScrollVideoPlayer>
    </div>
  );
};

export default ScrollVideo;
