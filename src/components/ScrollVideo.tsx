
import React, { useRef, useState, useEffect } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";

const ScrollVideo: React.FC<{
  src?: string;
}> = ({
  src
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false);
  const isMobile = useIsMobile();
  const secureVideoSrc = src ? src.replace(/^\/\//, 'https://').replace(/^http:/, 'https:') : undefined;
  
  useEffect(() => {
    const video = videoRef.current;
    if (video && secureVideoSrc) {
      // Force initial visibility for mobile devices
      if (isMobile) {
        setVideoVisible(true);
        
        // Force loading of the first frame
        video.currentTime = 0.001;
        video.load();
      }
      
      const handleCanPlay = () => {
        setVideoLoaded(true);
        setVideoVisible(true);
      };
      
      const handleLoadedData = () => {
        setVideoVisible(true);
      };
      
      const handleLoadedMetadata = () => {
        setVideoVisible(true);
      };
      
      const handleError = (e: Event) => {
        console.error("Video error:", e);
        setVideoVisible(true);
      };
      
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("error", handleError);
      
      const shortTimeoutId = setTimeout(() => {
        if (isMobile) {
          setVideoVisible(true);
        }
      }, 100);
      
      const timeoutId = setTimeout(() => {
        setVideoVisible(true);
        
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
    if (isMobile) {
      const handleInteraction = () => {
        setVideoVisible(true);
        
        const video = videoRef.current;
        if (video) {
          if (video.readyState >= 1) {
            video.currentTime = 0.001;
          }
        }
      };
      
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
      className="relative w-full h-screen sticky top-0 overflow-hidden bg-black" 
      style={{ zIndex: 1 }}
    >
      <video 
        ref={videoRef} 
        src={secureVideoSrc} 
        playsInline 
        preload="auto" 
        loop
        autoPlay
        muted 
        tabIndex={-1} 
        className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black" 
        style={{
          minHeight: "100vh",
          opacity: videoVisible ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          display: "block",
          visibility: "visible"
        }} 
      />

      <ScrollVideoTextOverlay 
        containerRef={containerRef}
      />
    </div>
  );
};

export default ScrollVideo;
