
import React, { RefObject } from "react";

interface ImprovedVideoElementProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoSrc?: string;
  isVideoVisible: boolean;
  handleVideoLoaded: () => void;
}

const ImprovedVideoElement: React.FC<ImprovedVideoElementProps> = ({
  videoRef,
  videoSrc,
  isVideoVisible,
  handleVideoLoaded
}) => {
  if (!videoSrc) return null;
  
  return (
    <video 
      ref={videoRef}
      src={videoSrc}
      className="w-full h-full object-cover pointer-events-none"
      style={{ display: isVideoVisible ? 'block' : 'none' }}
      playsInline 
      preload="auto"
      muted 
      webkit-playsinline="true"
      x-webkit-airplay="allow"
      onLoadedData={handleVideoLoaded}
    />
  );
};

export default ImprovedVideoElement;
