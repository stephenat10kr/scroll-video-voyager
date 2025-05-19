
import React from "react";
import ScrollVideo from "./ScrollVideo";
import SimpleStickyVideo from "./SimpleStickyVideo";
import { useDeviceDetection } from "../hooks/use-device-detection";
import ScrollVideoTextOverlay from "./ScrollVideoTextOverlay";

const Video: React.FC = () => {
  const { isAndroid } = useDeviceDetection();
  
  // Use the appropriate video source based on browser compatibility and device
  const getAppropriateVideoSrc = () => {
    // For lower quality on Android devices
    if (isAndroid) {
      return "/videos/HeroTest_1-720.mp4";
    }
    
    // Default video path
    const path = "/videos/HeroTest_1-720";
    
    // Check if browser supports WebM
    const supportsWebm = !!document.createElement('video').canPlayType('video/webm; codecs="vp8, vorbis"');
    
    if (supportsWebm) {
      return `${path}.webm`;
    }
    
    // Fallback to MP4
    return `${path}.mp4`;
  };
  
  const videoSrc = getAppropriateVideoSrc();
  
  // For progress tracking between components
  const handleProgressChange = (progress: number) => {
    // We could use this to sync other elements with the video progress
    console.log("Video progress:", progress);
  };
  
  return (
    <>
      {/* For Android devices, use the SimpleStickyVideo component */}
      {isAndroid && (
        <SimpleStickyVideo 
          src={videoSrc}
          onProgressChange={handleProgressChange}
        >
          <ScrollVideoTextOverlay containerRef={{current: null}} />
        </SimpleStickyVideo>
      )}
      
      {/* For other devices, use the ScrollVideo component */}
      {!isAndroid && (
        <ScrollVideo 
          src={videoSrc} 
        />
      )}
    </>
  );
};

export default Video;
