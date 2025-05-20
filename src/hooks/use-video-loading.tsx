
import { useState, useEffect, useRef, RefObject } from "react";
import { useIsIOS } from "./use-ios";

interface UseVideoLoadingProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoSrc?: string;
}

export const useVideoLoading = ({ videoRef, videoSrc }: UseVideoLoadingProps) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const isIOS = useIsIOS();
  
  // Set up iOS specific video loading
  useEffect(() => {
    if (!videoRef.current || !videoSrc) return;
    
    const video = videoRef.current;
    
    // For iOS devices, we need special handling
    if (isIOS) {
      console.log("iOS device detected, applying special video handling");
      
      // Set playsinline explicitly (important for iOS)
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('x-webkit-airplay', 'allow');
      
      // Force video to load and show first frame
      const loadFirstFrame = () => {
        video.load();
        video.currentTime = 0.1;  // Set to a small non-zero value
        setIsVideoLoaded(true);
      };
      
      // Try different approaches to get the video showing
      loadFirstFrame();
      
      // Sometimes on iOS we need a user interaction
      const handleUserInteraction = () => {
        loadFirstFrame();
        // Try to play and immediately pause to kickstart the video
        video.play().then(() => {
          setTimeout(() => {
            video.pause();
          }, 100);
        }).catch(err => {
          console.log("iOS autoplay attempt failed:", err);
        });
      };
      
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', handleUserInteraction);
      };
    }
  }, [videoSrc, isIOS, videoRef]);

  // Handler function for standard video loaded event
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
    if (isIOS) {
      console.log("Video loaded on iOS device");
    }
  };

  return {
    isVideoLoaded,
    handleVideoLoaded
  };
};
