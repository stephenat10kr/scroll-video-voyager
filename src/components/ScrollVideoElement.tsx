
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
  }, [videoLoaded]);

  return (
    <video 
      ref={videoRef} 
      src={src} 
      playsInline 
      preload="auto" 
      loop={false} 
      muted 
      tabIndex={-1} 
      className="fixed top-0 left-0 w-full h-full object-cover pointer-events-none z-0 bg-black" 
      style={{
        minHeight: "100vh",
        opacity: videoLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out"
      }} 
    />
  );
};

export default ScrollVideoElement;
