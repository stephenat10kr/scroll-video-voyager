
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollVideoPlayer from "./ScrollVideoPlayer";
import { useIsMobile } from "../hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

// Android-specific configuration
const ANDROID_SCROLL_EXTRA_PX = 5000; // Increased for smoother Android scrolling
const AFTER_VIDEO_EXTRA_HEIGHT = 0;
const ANDROID_SCRUB_VALUE = 2.0; // Higher scrub value for Android
const ANDROID_SEGMENT_COUNT = 3; // Lower segment count for better Android performance

const AndroidScrollVideo: React.FC<{
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
  const [videoVisible, setVideoVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInViewport, setIsInViewport] = useState(true);
  const [lastProgress, setLastProgress] = useState(0);
  const isMobile = useIsMobile();
  const frameRef = useRef<number | null>(null);
  
  // Ensure the src is secure (https)
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;

  // Android-specific scroll event handling
  const handleAndroidScroll = () => {
    console.log("Android scroll event optimized handler");
    if (videoRef.current && videoRef.current.duration) {
      // Force hardware acceleration for smoother scrolling
      videoRef.current.style.transform = "translateZ(0)";
      videoRef.current.style.willChange = "transform, contents";
    }
  };

  // Add intersection observer to detect when video exits viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
        console.log("Android video in viewport:", entry.isIntersecting);
      },
      { 
        threshold: 0.01,
        rootMargin: "0px"
      }
    );

    observer.observe(containerRef.current);
    
    // Android-specific performance optimization
    if (containerRef.current) {
      containerRef.current.style.transform = "translateZ(0)";
      containerRef.current.style.willChange = "transform";
      
      // Add passive scroll listener for smoother Android performance
      document.addEventListener('scroll', handleAndroidScroll, { passive: true });
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      document.removeEventListener('scroll', handleAndroidScroll);
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

  // Video initialization and loading
  useEffect(() => {
    const video = videoRef.current;
    if (video && secureVideoSrc) {
      console.log("Android - Setting up video element");
      
      // Android-specific video optimizations
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.style.transform = "translateZ(0)";
      video.style.willChange = "contents, transform";
      video.style.backfaceVisibility = "hidden";
      
      // Force hardware acceleration
      video.style.transform = "translate3d(0,0,0)";
      
      // Explicitly force muted for Android autoplay capability
      video.muted = true;
      
      // Immediately make video element visible
      setVideoVisible(true);
      
      // Force loading of the first frame
      video.currentTime = 0.001;
      video.load();
      
      const handleCanPlay = () => {
        console.log("Android - Video can play now");
        setVideoLoaded(true);
        setVideoVisible(true);
        
        // Notify parent that video is ready
        if (onReady) {
          onReady();
        }
        
        // Always pause the video when it can play
        video.pause();
        
        // Set the currentTime to show the first frame
        video.currentTime = 0.001;
      };
      
      // Add multiple event listeners for Android's inconsistent event firing
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", () => {
        console.log("Android - Video data loaded");
        setVideoVisible(true);
        if (onReady) onReady();
        video.currentTime = 0.001;
      });
      video.addEventListener("loadedmetadata", () => {
        console.log("Android - Video metadata loaded");
        setVideoVisible(true);
        video.currentTime = 0.001;
      });
      
      // Error handling
      video.addEventListener("error", (e) => {
        console.error("Android - Video error:", e);
        setVideoVisible(true);
      });
      
      // Android sometimes needs manual frame advancement
      const forceFrameDisplay = () => {
        if (video.readyState >= 1) {
          video.currentTime = 0.001;
          console.log("Android - Forcing frame display");
        }
      };
      
      // Try multiple times to force frame display
      const frameTimers = [
        setTimeout(forceFrameDisplay, 100),
        setTimeout(forceFrameDisplay, 300),
        setTimeout(forceFrameDisplay, 1000)
      ];
      
      // Use a longer timeout as a fallback
      const timeoutId = setTimeout(() => {
        setVideoVisible(true);
        console.log("Android - Video visibility forced by fallback timeout");
        
        if (video.readyState < 2) {
          video.load();
          video.currentTime = 0.001;
        }
        
        if (onReady && !videoLoaded) {
          onReady();
        }
      }, 300);
      
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", () => {});
        video.removeEventListener("loadedmetadata", () => {});
        video.removeEventListener("error", () => {});
        clearTimeout(timeoutId);
        frameTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [secureVideoSrc, onReady, videoLoaded]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen overflow-hidden bg-black" 
      style={{ zIndex: 1 }}
    >
      <ScrollVideoPlayer 
        src={secureVideoSrc} 
        segmentCount={ANDROID_SEGMENT_COUNT}  // Android-specific segment count
        onAfterVideoChange={setIsAfterVideo}
        onProgressChange={setProgress}
        videoRef={videoRef} 
        containerRef={containerRef} 
        SCROLL_EXTRA_PX={ANDROID_SCROLL_EXTRA_PX}  // Android-specific scroll distance
        AFTER_VIDEO_EXTRA_HEIGHT={AFTER_VIDEO_EXTRA_HEIGHT} 
        isMobile={true}  // Always true for Android
        scrubValue={ANDROID_SCRUB_VALUE}  // Android-specific scrub value
        isAndroid={true}  // Mark as Android
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
            display: "block",
            visibility: "visible",
            backgroundColor: "black",
            transform: "translate3d(0,0,0)", // Force hardware acceleration
            willChange: "contents, transform" // Hint to browser for optimization
          }} 
        />
      </ScrollVideoPlayer>
    </div>
  );
};

export default AndroidScrollVideo;
