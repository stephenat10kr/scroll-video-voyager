
import React, { useRef, useEffect, useState, forwardRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import { useIsMobile } from "../hooks/use-mobile";
import { useIsAndroid } from "../hooks/use-android";

gsap.registerPlugin(ScrollTrigger);

// Increase scroll distance from 2000 to 4000
const SCROLL_EXTRA_PX = 4000;
const AFTER_VIDEO_EXTRA_HEIGHT = 0;

const ScrollVideo = forwardRef<HTMLVideoElement, {
  src?: string;
  onReady?: () => void;
}>(({ src, onReady }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  // Use the forwarded ref or fallback to internal ref
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalVideoRef;
  
  const [isAfterVideo, setIsAfterVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false); // Start with video hidden
  const [videoTextureLoaded, setVideoTextureLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const [lastProgress, setLastProgress] = useState(0);
  const isMobile = useIsMobile();
  const isAndroid = useIsAndroid();
  const readyCalledRef = useRef(false);
  
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
      // Start with video hidden until we confirm it's ready
      setVideoVisible(false);
      
      // Force loading of the first frame for mobile devices
      if (isMobile) {
        console.log("Mobile detected: Attempting to load initial video frame");
        
        // Try to load the video silently
        video.load();
        
        // Don't set currentTime yet, wait for metadata to load first
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
        
        // Add Android-specific texture management
        video.style.imageRendering = "high-quality";
      }
      
      // Firefox-specific optimizations
      if (isFirefox) {
        console.log("Firefox detected: Applying Firefox-specific optimizations");
        
        // Apply Firefox-specific hardware acceleration hints
        video.style.transform = "translateZ(0)";
        video.style.backfaceVisibility = "hidden";
        video.style.willChange = "transform, opacity";
      }
      
      const handleCanPlay = () => {
        console.log("Video can play now");
        setVideoLoaded(true);
        
        // For mobile, ensure a frame is loaded before marking as ready
        if (isMobile) {
          // Set the currentTime to show the first frame
          video.currentTime = 0.001;
          
          // Wait a bit to ensure frame is actually loaded
          setTimeout(() => {
            console.log("Setting video texture as loaded");
            setVideoTextureLoaded(true);
            
            // Wait additional time before showing video to ensure texture is displayed
            setTimeout(() => {
              setVideoVisible(true);
              
              // Notify parent that video is ready, but only once
              if (onReady && !readyCalledRef.current) {
                console.log("Calling onReady callback from canplay");
                onReady();
                readyCalledRef.current = true;
              }
            }, 300);
          }, 200);
        } else {
          // Non-mobile devices can show immediately
          setVideoTextureLoaded(true);
          setVideoVisible(true);
          
          // Notify parent that video is ready
          if (onReady && !readyCalledRef.current) {
            console.log("Calling onReady callback from canplay (non-mobile)");
            onReady();
            readyCalledRef.current = true;
          }
        }
        
        // Always pause the video when it can play
        video.pause();
        console.log("Video paused on load");
      };
      
      // Add loadeddata event to ensure video is fully loaded
      const handleLoadedData = () => {
        console.log("Video data loaded");
        
        // Set the currentTime to show the first frame for mobile
        if (isMobile) {
          video.currentTime = 0.001;
          
          // For Android, also try additional frames
          if (isAndroid) {
            // Try multiple frames to ensure loading
            setTimeout(() => { 
              if (video.readyState >= 2) video.currentTime = 0.01; 
            }, 50);
            setTimeout(() => { 
              if (video.readyState >= 2) video.currentTime = 0.1; 
            }, 100);
          }
        }
        
        // Mark texture as loaded after a delay to ensure frame is visible
        setTimeout(() => {
          setVideoTextureLoaded(true);
          
          // Additional delay before making video visible
          setTimeout(() => {
            setVideoVisible(true);
            
            // Also notify ready if not already done
            if (onReady && !readyCalledRef.current) {
              console.log("Calling onReady callback from loadeddata");
              onReady();
              readyCalledRef.current = true;
            }
          }, 300);
        }, 200);
      };
      
      // Add loadedmetadata event which might fire earlier
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded");
        
        // For mobile, try to load first frame
        if (isMobile) {
          // Try setting currentTime only after metadata is available
          video.currentTime = 0.001;
          
          // For Android, try additional initialization
          if (isAndroid) {
            // Try to initialize decoder without actually playing
            video.play().then(() => {
              video.pause();
              video.currentTime = 0.001;
              console.log("Android: Initialized hardware decoder");
            }).catch(() => {
              console.log("Android: Initial play failed, trying alternative method");
              // Try setting multiple times to ensure a frame loads
              video.currentTime = 0.001;
              setTimeout(() => { video.currentTime = 0.01; }, 50);
            });
          }
        }
      };
      
      // Handle seeking events to know when frames are actually showing
      const handleSeeked = () => {
        console.log("Video seeked to", video.currentTime);
        
        // If we previously tried to load a frame and now it's seeked, 
        // we know the frame is loaded and video is ready to show
        if (!videoTextureLoaded) {
          console.log("Video frame loaded after seeking");
          setVideoTextureLoaded(true);
          
          // Add a delay before making video visible to ensure frame is rendered
          setTimeout(() => {
            setVideoVisible(true);
            
            // Notify ready if not already done
            if (onReady && !readyCalledRef.current) {
              console.log("Calling onReady callback after seeking");
              onReady();
              readyCalledRef.current = true;
            }
          }, 300);
        }
      };
      
      // Add error handling
      const handleError = (e: Event) => {
        console.error("Video error:", e);
        // Even with error, we need to move forward
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady despite error");
          onReady();
          readyCalledRef.current = true;
        }
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("seeked", handleSeeked);
      video.addEventListener("error", handleError);
      
      // Add a safety timeout to ensure video eventually becomes ready
      const timeoutId = setTimeout(() => {
        console.log("Video visibility forced by fallback timeout");
        setVideoTextureLoaded(true);
        setVideoVisible(true);
        
        // Also notify ready as a last resort
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback after timeout");
          onReady();
          readyCalledRef.current = true;
        }
      }, 1500); // Increased timeout to ensure all resources load
      
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("seeked", handleSeeked);
        video.removeEventListener("error", handleError);
        clearTimeout(timeoutId);
      };
    }
  }, [secureVideoSrc, isMobile, isFirefox, isAndroid, onReady]);

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
            opacity: videoVisible && videoTextureLoaded && isInViewport ? 1 : 0,
            display: "block",
            visibility: videoVisible ? "visible" : "hidden", // Hide completely until ready
            backgroundColor: "black",
            transform: "translateZ(0)",
            willChange: "opacity",
            backfaceVisibility: "hidden",
            transition: "opacity 0.5s ease-in-out" // Smoother opacity transition
          }} 
        />
      </ScrollVideoPlayer>
    </div>
  );
});

ScrollVideo.displayName = "ScrollVideo";

export default ScrollVideo;
