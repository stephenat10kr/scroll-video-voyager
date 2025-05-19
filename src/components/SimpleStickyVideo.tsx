
import React, { useRef, useEffect, useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";

interface SimpleStickyVideoProps {
  src?: string;
  children?: React.ReactNode;
  onProgressChange?: (progress: number) => void;
  androidOnly?: boolean;
}

const SimpleStickyVideo: React.FC<SimpleStickyVideoProps> = ({
  src,
  children,
  onProgressChange,
  androidOnly = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down' | null>(null);
  const isMobile = useIsMobile();
  
  // Detect Android device
  const isAndroid = typeof navigator !== 'undefined' && 
    (navigator.userAgent.toLowerCase().indexOf('android') > -1 || 
     (navigator.platform && /android/i.test(navigator.platform)));
  
  // Only use this component if it's Android or if androidOnly is false
  const shouldUseSimpleSticky = !androidOnly || isAndroid;

  useEffect(() => {
    if (!shouldUseSimpleSticky) return;
    
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    console.log("SimpleStickyVideo mounted for Android");
    
    // Make sure video is properly configured
    video.playsInline = true;
    video.muted = true;
    video.preload = "auto";
    video.pause();

    // Calculate the scroll space (300vh)
    const resizeContainer = () => {
      if (container) {
        container.style.height = `300vh`;
      }
    };
    
    resizeContainer();
    window.addEventListener("resize", resizeContainer);

    // Create intersection observer to detect when video is in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isNowInView = entry.isIntersecting;
        setIsInView(isNowInView);
        
        if (isNowInView) {
          console.log("Video container entered viewport");
          // Set initial time to slightly past the first frame
          if (video.readyState >= 1) {
            video.currentTime = 0.1;
          }
        } else {
          console.log("Video container left viewport");
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(container);

    // Track scroll to control video
    const handleScroll = () => {
      if (!isInView) return;
      
      const scrollY = window.scrollY;
      const containerTop = container.getBoundingClientRect().top + window.scrollY;
      const containerHeight = container.offsetHeight;
      
      // Determine if we're inside the container
      if (scrollY >= containerTop && scrollY <= containerTop + containerHeight) {
        // Calculate progress within container (0 to 1)
        const relativeProgress = (scrollY - containerTop) / containerHeight;
        setProgress(relativeProgress);
        
        if (onProgressChange) {
          onProgressChange(relativeProgress);
        }
        
        // Determine scroll direction
        scrollDirection.current = scrollY > lastScrollY.current ? 'down' : 'up';
        lastScrollY.current = scrollY;
        
        // Update video position if it has loaded
        if (video.readyState >= 1 && video.duration) {
          const targetTime = relativeProgress * video.duration;
          
          // When scrolling down, immediately update for responsiveness
          if (scrollDirection.current === 'down') {
            video.currentTime = targetTime;
          } 
          // When scrolling up, smooth the transition slightly
          else {
            // Use a smoother approach when scrolling up
            const currentTime = video.currentTime;
            const smoothFactor = 0.8; // Lower is smoother but less responsive
            const newTime = currentTime + (targetTime - currentTime) * smoothFactor;
            video.currentTime = newTime;
          }
          
          // For Android, always ensure we're not at frame 1
          if (isAndroid && video.currentTime < 0.1) {
            video.currentTime = 0.1;
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    
    // For Android, ensure we're never showing the first frame
    const preventFirstFrame = () => {
      if (isAndroid && video.currentTime < 0.1 && video.duration) {
        video.currentTime = 0.1;
      }
    };
    
    video.addEventListener("seeked", preventFirstFrame);
    
    // Handle video loading
    const handleCanPlay = () => {
      console.log("Video can play now");
      if (isAndroid) {
        video.currentTime = 0.1;
      }
      // Force an initial scroll calculation
      handleScroll();
    };
    
    video.addEventListener("canplay", handleCanPlay);
    
    return () => {
      window.removeEventListener("resize", resizeContainer);
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("seeked", preventFirstFrame);
    };
  }, [shouldUseSimpleSticky, isInView, onProgressChange, isAndroid]);

  // If not Android and androidOnly is true, return null
  if (!shouldUseSimpleSticky) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-black"
      style={{ 
        height: "300vh",
        zIndex: 1 
      }}
    >
      <div className="sticky top-0 left-0 w-full h-screen bg-black">
        <video 
          ref={videoRef} 
          src={src} 
          playsInline 
          preload="auto" 
          loop={false} 
          muted 
          tabIndex={-1} 
          className="w-full h-full object-cover pointer-events-none z-0"
        />
        {children}
      </div>
    </div>
  );
};

export default SimpleStickyVideo;
