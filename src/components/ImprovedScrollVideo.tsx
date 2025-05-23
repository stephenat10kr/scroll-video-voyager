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
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({ src: externalSrc, onReady }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoInitialized, setIsVideoInitialized] = useState(false);
  const [playAttempted, setPlayAttempted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isIOS = useIsIOS();
  const isAndroid = useIsAndroid();
  const readyCalledRef = useRef(false);
  
  // For debugging
  useEffect(() => {
    if (isIOS) {
      console.log("iOS device detected in ImprovedScrollVideo component");
    }
    if (isAndroid) {
      console.log("Android device detected in ImprovedScrollVideo component - disabling scroll scrubbing");
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
    
    // For Android, try to play the video
    if (isAndroid && videoRef.current && !playAttempted) {
      playAndroidVideo();
    }
  };
  
  // Function to start Android video playback
  const playAndroidVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setPlayAttempted(true);
    console.log("Android device - attempting to play video");
    
    // Set loop attribute for Android
    video.loop = true;
    
    // Force play on Android
    const playPromise = video.play();
    
    // Handle play promise
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log("Android video started playing successfully");
      }).catch(err => {
        console.error("Android auto-play failed:", err);
        
        // Try again after a short delay
        setTimeout(() => {
          if (video) {
            console.log("Retrying Android video playback");
            // Try unmuting as a fallback
            video.muted = true;
            video.play().catch(e => {
              console.error("Second Android play attempt failed:", e);
            });
          }
        }, 500);
      });
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
    // For Android devices, we'll play the video normally instead of scroll scrubbing
    else if (isAndroid) {
      console.log("Setting up normal video playback for Android without controls");
      
      // Disable controls for Android users
      video.controls = false;
      
      // Enable looping for Android
      video.loop = true;
      
      // Try to play video normally
      if (!playAttempted) {
        playAndroidVideo();
      }
      
      // Make sure onReady is called
      if (onReady && !readyCalledRef.current) {
        onReady();
        readyCalledRef.current = true;
      }
      
      return; // Skip setting up ScrollTrigger for Android
    }
    // For touch devices, we need to initialize the video first
    else if (isTouchDevice() && !isIOS) { // Only run this for non-iOS touch devices
      video.play().then(() => {
        video.pause();
      }).catch(err => {
        console.error("Error initializing video for touch device:", err);
      });
    }
    
    // Create timeline for scroll scrubbing - only for non-Android devices
    if (!isAndroid) {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          // Increase the end value to extend the scrolling length
          end: "bottom+=600% bottom", // Keep extended scrolling length
          scrub: 3.5,
          markers: false, // Set to true for debugging
        }
      });
      
      // Wait until video metadata is loaded before creating the animation
      const handleMetadataLoaded = () => {
        if (video.duration) {
          timeline.to(video, { currentTime: video.duration });
          console.log("Video scroll animation set up with duration:", video.duration);
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
    }
  }, [isVideoLoaded, isIOS, isVideoInitialized, isAndroid, playAttempted]);

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

  // Additional Android-specific effect to retry playback periodically
  useEffect(() => {
    if (!isAndroid || !videoRef.current) return;
    
    // Try playing video again after component fully mounts
    const retryTimeout = setTimeout(() => {
      if (videoRef.current) {
        console.log("Delayed retry of Android video playback");
        playAndroidVideo();
      }
    }, 1000);
    
    // Setup observer to check if video is actually playing
    const video = videoRef.current;
    let playCheckInterval: NodeJS.Timeout;
    
    // Check if time is advancing (video is actually playing)
    if (video) {
      let lastTime = video.currentTime;
      playCheckInterval = setInterval(() => {
        if (video.currentTime === lastTime && !video.paused) {
          console.log("Video appears stuck, trying to restart playback");
          video.currentTime += 0.1; // Try advancing slightly
          playAndroidVideo();
        }
        lastTime = video.currentTime;
      }, 2000); // Check every 2 seconds
    }
    
    return () => {
      clearTimeout(retryTimeout);
      if (playCheckInterval) clearInterval(playCheckInterval);
    };
  }, [isAndroid, isVideoLoaded]);

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
            backfaceVisibility: 'hidden',
            pointerEvents: 'none' // Disable controls interaction for all devices
          }}
          playsInline={true}
          webkit-playsinline="true" 
          preload="auto"
          muted={!isAndroid} // Only mute for non-Android
          autoPlay={isAndroid} // Auto play on Android
          loop={isAndroid} // Loop for Android devices
          controls={false} // Never show controls
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
