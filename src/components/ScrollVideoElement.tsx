
import React, { useEffect } from "react";

interface ScrollVideoElementProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src?: string;
  videoLoaded: boolean;
}

const ScrollVideoElement: React.FC<ScrollVideoElementProps> = ({ 
  videoRef, 
  src, 
  videoLoaded 
}) => {
  // Log when the component receives a videoLoaded update
  useEffect(() => {
    console.log("[ScrollVideoElement] Video loaded state:", videoLoaded);
    
    // iOS-specific fix: Apply inline styles directly to the video element
    if (videoRef.current) {
      videoRef.current.playsInline = true;
      videoRef.current.setAttribute('playsinline', '');
      videoRef.current.setAttribute('webkit-playsinline', '');
      videoRef.current.muted = true;
    }
  }, [videoLoaded, videoRef]);

  return (
    <video 
      ref={videoRef} 
      src={src} 
      playsInline 
      muted
      preload="auto" 
      loop={false} 
      tabIndex={-1}
      className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black" 
      style={{
        minHeight: "100vh",
        opacity: videoLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out"
      }}
      // iOS-specific attributes as proper HTML5 attributes
      // Remove invalid attribute and use proper attribute syntax
      data-wk-playsinline="true"
    />
  );
};

export default ScrollVideoElement;
