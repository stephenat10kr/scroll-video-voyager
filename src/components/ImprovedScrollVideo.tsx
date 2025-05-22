import React, { useState, useRef, useEffect } from "react";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import Spinner from "./Spinner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsIOS } from "@/hooks/useIsIOS";
import { useIsAndroid } from "@/hooks/use-android";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImprovedScrollVideoProps {
  src?: string; // Make the src prop optional
  onReady?: () => void; // Add onReady callback
  onProgress?: (progress: number) => void; // Add onProgress callback
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({ 
  src: externalSrc, 
  onReady,
  onProgress
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoInitialized, setIsVideoInitialized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isIOS = useIsIOS();
  const isAndroid = useIsAndroid();
  const readyCalledRef = useRef(false);
  const lastProgressRef = useRef(0);
  
  // For debugging
  useEffect(() => {
    if (isIOS) {
      console.log("iOS device detected in ImprovedScrollVideo component");
    }
    if (isAndroid) {
      console.log("Android device detected in ImprovedScrollVideo component");
    }
  }, [isIOS, isAndroid]);
  
  const { data: heroVideoAsset, isLoading } = useContentfulAsset(HERO_VIDEO_ASSET_ID);
  
  // Use external src if provided, otherwise use the one from Contentful
  const videoSrc = externalSrc || (heroVideoAsset?.fields?.file?.url 
    ? (heroVideoAsset.fields.file.url.startsWith('//') 
        ? 'https:' + heroVideoAsset.fields.file.url 
        : heroVideoAsset.fields.file.url)
    : undefined);

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
  
  // Detect touch devices
  const isTouchDevice = () => {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;
    
    // For iOS devices, we need special handling
    if (isIOS && !isVideoInitialized) {
      initializeVideoForIOS();
    }
    // For touch devices, we need to initialize the video first
    else if (isTouchDevice() && !isIOS) { // Only run this for non-iOS touch devices
      video.play().then(() => {
        video.pause();
      }).catch(err => {
        console.error("Error initializing video for touch device:", err);
      });
    }
    
    // Create timeline for scroll scrubbing
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        // Increase the end value to extend the scrolling length
        end: "bottom+=600% bottom", // Keep extended scrolling length
        // Use a much lower scrub value for Android devices to reduce lag
        scrub: isAndroid ? 0.5 : 3.5, // Lower value for Android for more responsive scrubbing
        markers: false, // Set to true for debugging
        onUpdate: (self) => {
          // Report progress to parent component
          if (onProgress) {
            const currentProgress = self.progress;
            if (Math.abs(currentProgress - lastProgressRef.current) > 0.005) {
              lastProgressRef.current = currentProgress;
              onProgress(currentProgress);
            }
          }
        }
      }
    });
    
    // Wait until video metadata is loaded before creating the animation
    const handleMetadataLoaded = () => {
      if (video.duration) {
        timeline.to(video, { currentTime: video.duration });
        console.log("Video scroll animation set up with duration:", video.duration);
        console.log("Using scrub value:", isAndroid ? "0.5 (Android)" : "3.5 (non-Android)");
      }
    };
    
    if (video.readyState >= 2) {
      handleMetadataLoaded();
    } else {
      video.addEventListener('loadedmetadata', handleMetadataLoaded);
    }

    // Add ScrollTrigger to control visibility based on RevealText component position
    const revealTextSection = document.getElementById('revealText-section');
    if (revealTextSection) {
      console.log("RevealText section found for video visibility trigger");
      ScrollTrigger.create({
        trigger: revealTextSection,
        start: "top top", // This fires when the top of RevealText reaches the top of viewport
        onEnter: () => {
          console.log("Hiding video (scrolling down)");
        },
        onLeaveBack: () => {
          console.log("Showing video (scrolling up)");
        },
        markers: false
      });
    } else {
      console.warn("RevealText section not found for video visibility trigger");
    }
    
    // Clean up
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isVideoLoaded, isIOS, isVideoInitialized, isAndroid, onProgress]);

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

  return (
    <div ref={containerRef} className="video-container w-full h-screen">
      {/* Show loading state if video is still loading */}
      {(isLoading || !isVideoLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Spinner />
        </div>
      )}
      
      {videoSrc && (
        <video 
          ref={videoRef}
          className="w-full h-full object-cover pointer-events-none"
          style={{ 
            backgroundColor: 'black',
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
          playsInline={true}
          webkit-playsinline="true" 
          preload="auto"
          muted={true}
          autoPlay={isIOS ? true : false}
          controls={false}
          onLoadedData={handleVideoLoaded}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      )}
    </div>
  );
};

export default ImprovedScrollVideo;
