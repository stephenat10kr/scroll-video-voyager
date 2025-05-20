
import React, { RefObject } from 'react';

interface VideoElementProps {
  videoRef: RefObject<HTMLVideoElement>;
  src?: string;
  videoVisible: boolean;
  isInViewport: boolean;
}

/**
 * Pure video element component with proper attributes
 */
const VideoElement: React.FC<VideoElementProps> = ({
  videoRef,
  src,
  videoVisible,
  isInViewport
}) => {
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
        opacity: videoVisible && isInViewport ? 1 : 0,
        display: "block",
        visibility: "visible"
      }} 
    />
  );
};

export default VideoElement;
