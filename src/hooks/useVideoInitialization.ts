
import { useState, useRef, useEffect } from "react";
import { useIsIOS } from "./useIsIOS";

interface UseVideoInitializationOptions {
  onReady?: () => void;
}

export const useVideoInitialization = (options: UseVideoInitializationOptions = {}) => {
  const { onReady } = options;
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoInitialized, setIsVideoInitialized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyCalledRef = useRef(false);
  const isIOS = useIsIOS();
  
  const handleVideoLoaded = () => {
    console.log("Video loaded event triggered");
    setIsVideoLoaded(true);
    
    // Notify parent component that video is ready, but only once
    if (onReady && !readyCalledRef.current) {
      console.log("Calling onReady callback");
      onReady();
      readyCalledRef.current = true;
    }
    
    // For iOS, we need to manually initialize the video when it's loaded
    if (isIOS && videoRef.current && !isVideoInitialized) {
      initializeVideoForIOS();
    }
  };
  
  // Initialize video specifically for iOS
  const initializeVideoForIOS = () => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log("iOS device detected, initializing video with special handling");
    
    // Set playsinline attribute directly on the element for iOS
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    
    // iOS requires user interaction to play video
    // Muting allows autoplay in some cases
    video.muted = true;
    
    // Try to preload the video
    video.load();
    
    // Set current time to 0 first to ensure we're at the beginning
    video.currentTime = 0;
    
    // Try to play and immediately pause to initialize the video
    // This helps with iOS's strict autoplay policies
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Successfully played, now pause
        video.pause();
        console.log("Successfully initialized video for iOS");
        setIsVideoInitialized(true);
        
        // Make sure ready callback is called after successful initialization
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback after iOS initialization");
          onReady();
          readyCalledRef.current = true;
        }
      }).catch(err => {
        console.error("Error initializing video for iOS:", err);
        // Try a different approach - set the currentTime which sometimes forces a frame to load
        video.currentTime = 0.1;
        setIsVideoInitialized(true);
        
        // Still call ready even on error, to prevent getting stuck
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback after iOS initialization (error case)");
          onReady();
          readyCalledRef.current = true;
        }
      });
    } else {
      // Play didn't return a promise, try setting currentTime
      video.currentTime = 0.1;
      setIsVideoInitialized(true);
      
      // Call ready in this case too
      if (onReady && !readyCalledRef.current) {
        console.log("Calling onReady callback after iOS initialization (no promise case)");
        onReady();
        readyCalledRef.current = true;
      }
    }
  };

  // Add a useEffect specifically for iOS video handling
  useEffect(() => {
    // Run only once when component mounts and if iOS is detected
    if (isIOS && videoRef.current) {
      // Set up iOS-specific event listeners
      const video = videoRef.current;
      
      // Try to load a frame immediately
      if (video.readyState >= 1) {
        video.currentTime = 0.1;
      }
      
      const handleIOSVisibilityChange = () => {
        if (!document.hidden && video) {
          // If page becomes visible again on iOS, try to re-initialize
          console.log("Page visibility changed on iOS, reinitializing video");
          initializeVideoForIOS();
        }
      };
      
      // iOS sometimes unloads video when page visibility changes
      document.addEventListener('visibilitychange', handleIOSVisibilityChange);
      
      // For iOS, try initializing right away
      setTimeout(() => {
        if (!isVideoInitialized) {
          console.log("Delayed initialization for iOS");
          initializeVideoForIOS();
        }
        
        // Ensure video ready callback is called if not done yet
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback after iOS delayed initialization");
          onReady();
          readyCalledRef.current = true;
        }
      }, 500);
      
      return () => {
        document.removeEventListener('visibilitychange', handleIOSVisibilityChange);
      };
    }
    
    // Add a fallback to ensure we always trigger onReady
    const fallbackTimer = setTimeout(() => {
      if (onReady && !readyCalledRef.current && videoRef.current) {
        console.log("Fallback: calling onReady callback after timeout");
        onReady();
        readyCalledRef.current = true;
      }
    }, 3000); // 3 second fallback
    
    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [isIOS, isVideoInitialized, onReady]);

  // Check for touch devices
  const isTouchDevice = () => {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  };

  // Effect for initializing non-iOS touch devices
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded || isIOS) return;
    
    // For touch devices, we need to initialize the video first
    if (isTouchDevice()) {
      video.play().then(() => {
        video.pause();
      }).catch(err => {
        console.error("Error initializing video for touch device:", err);
      });
    }
  }, [isVideoLoaded, isIOS]);

  return {
    videoRef,
    isVideoLoaded,
    isVideoInitialized,
    handleVideoLoaded,
    isTouchDevice
  };
};
