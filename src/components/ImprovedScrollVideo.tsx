
import React, { useState, useRef, useEffect, forwardRef } from "react";
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

const ImprovedScrollVideo = forwardRef<HTMLVideoElement, ImprovedScrollVideoProps>(({ src: externalSrc, onReady }, ref) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false); // Start with video hidden
  const [isVideoTextureLoaded, setIsVideoTextureLoaded] = useState(false);
  const [isVideoInitialized, setIsVideoInitialized] = useState(false);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  // Use the forwarded ref or fallback to internal ref
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalVideoRef;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isIOS = useIsIOS();
  const isAndroid = useIsAndroid();
  const readyCalledRef = useRef(false);
  const frameLoadAttemptsRef = useRef(0);
  const maxFrameLoadAttempts = 5;
  
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
  // Remove all fallback URLs and only use Contentful
  const videoSrc = externalSrc || (heroVideoAsset?.fields?.file?.url 
    ? (heroVideoAsset.fields.file.url.startsWith('//') 
        ? 'https:' + heroVideoAsset.fields.file.url 
        : heroVideoAsset.fields.file.url)
    : undefined);
    
  // Function to attempt loading a frame of the video
  const attemptLoadVideoFrame = () => {
    const video = videoRef.current;
    if (!video || frameLoadAttemptsRef.current >= maxFrameLoadAttempts) return;
    
    frameLoadAttemptsRef.current++;
    console.log(`Attempting to load video frame (attempt ${frameLoadAttemptsRef.current}/${maxFrameLoadAttempts})`);
    
    // Try different timestamps to ensure a frame loads
    if (video.readyState >= 1) {
      video.currentTime = 0.001;
      
      // For iOS/Android, try more aggressive frame loading
      if (isIOS || isAndroid) {
        setTimeout(() => { 
          if (video.readyState >= 2) video.currentTime = 0.01; 
        }, 100);
        setTimeout(() => { 
          if (video.readyState >= 2) video.currentTime = 0.1; 
        }, 200);
      }
    }
    
    // Schedule next attempt if needed
    if (frameLoadAttemptsRef.current < maxFrameLoadAttempts) {
      setTimeout(attemptLoadVideoFrame, 300);
    }
  };

  const handleVideoLoaded = () => {
    console.log("Video loaded event triggered");
    setIsVideoLoaded(true);
    
    // Don't make video visible yet, wait until texture is confirmed loaded
    // Try to load the frame first
    attemptLoadVideoFrame();
    
    // Add a delay before considering texture loaded
    setTimeout(() => {
      console.log("Confirming video texture loaded");
      setIsVideoTextureLoaded(true);
      
      // Additional delay before showing video
      setTimeout(() => {
        console.log("Making video visible after confirmed texture loaded");
        setIsVideoVisible(true);
        
        // Notify parent component that video is ready, but only once
        if (onReady && !readyCalledRef.current) {
          console.log("Calling onReady callback after delay");
          onReady();
          readyCalledRef.current = true;
        }
      }, 300);
    }, 300);
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
        
        // Start the frame loading process
        attemptLoadVideoFrame();
        
        // Add a delay before making video visible
        setTimeout(() => {
          setIsVideoTextureLoaded(true);
          setTimeout(() => {
            setIsVideoVisible(true);
            
            // Make sure ready callback is called after successful initialization
            if (onReady && !readyCalledRef.current) {
              console.log("Calling onReady callback after iOS initialization");
              onReady();
              readyCalledRef.current = true;
            }
          }, 300);
        }, 200);
      }).catch(err => {
        console.error("Error initializing video for iOS:", err);
        // Try a different approach - set the currentTime which sometimes forces a frame to load
        video.currentTime = 0.1;
        setIsVideoInitialized(true);
        
        // Don't make video visible yet, continue with frame loading attempts
        attemptLoadVideoFrame();
        
        // Add a delay before making video visible
        setTimeout(() => {
          setIsVideoTextureLoaded(true);
          setTimeout(() => {
            setIsVideoVisible(true);
            
            // Call ready even on error, to prevent getting stuck
            if (onReady && !readyCalledRef.current) {
              console.log("Calling onReady callback after iOS initialization (error case)");
              onReady();
              readyCalledRef.current = true;
            }
          }, 300);
        }, 200);
      });
    } else {
      // Play didn't return a promise, try setting currentTime
      video.currentTime = 0.1;
      setIsVideoInitialized(true);
      
      // Try frame loading attempts
      attemptLoadVideoFrame();
      
      // Add a delay before making video visible
      setTimeout(() => {
        setIsVideoTextureLoaded(true);
        setTimeout(() => {
          setIsVideoVisible(true);
          
          // Call ready in this case too
          if (onReady && !readyCalledRef.current) {
            console.log("Calling onReady callback after iOS initialization (no promise case)");
            onReady();
            readyCalledRef.current = true;
          }
        }, 300);
      }, 200);
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
    if (!video || !videoSrc) return;
    
    // Pre-initialize video to avoid black flash
    const preInitVideo = () => {
      if (video.readyState >= 1) {
        video.currentTime = 0.001;
        console.log("Pre-initializing video frame");
      }
    };
    
    // Reset frame load attempts counter when src changes
    frameLoadAttemptsRef.current = 0;
    
    // Try to pre-initialize immediately
    preInitVideo();
    
    // And also after a slight delay to ensure it works
    setTimeout(preInitVideo, 50);
    
    // For iOS devices, we need special handling
    if (isIOS && !isVideoInitialized) {
      initializeVideoForIOS();
    }
    // For touch devices, we need to initialize the video first
    else if (isTouchDevice() && !isIOS) { // Only run this for non-iOS touch devices
      video.play().then(() => {
        video.pause();
        attemptLoadVideoFrame();
      }).catch(err => {
        console.error("Error initializing video for touch device:", err);
        attemptLoadVideoFrame();
      });
    } else {
      // For desktop, still try to load frames
      attemptLoadVideoFrame();
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
          setIsVideoVisible(false);
          console.log("Hiding video (scrolling down)");
        },
        onLeaveBack: () => {
          // Only show video if texture is loaded
          if (isVideoTextureLoaded && isVideoLoaded) {
            setIsVideoVisible(true);
            console.log("Showing video (scrolling up)");
          }
        },
        markers: false
      });
    } else {
      // Fallback to class selector
      const revealTextElement = document.querySelector('.w-full.py-24');
      if (revealTextElement) {
        ScrollTrigger.create({
          trigger: revealTextElement,
          start: "top top",
          onEnter: () => {
            setIsVideoVisible(false);
            console.log("Hiding video (scrolling down) - using fallback selector");
          },
          onLeaveBack: () => {
            // Only show video if texture is loaded
            if (isVideoTextureLoaded && isVideoLoaded) {
              setIsVideoVisible(true);
              console.log("Showing video (scrolling up) - using fallback selector");
            }
          },
          markers: false
        });
      }
    }
    
    // Handle seeked events to know when frames are actually displayed
    const handleSeeked = () => {
      console.log("Video seeked to", video.currentTime);
      
      // If we previously tried to load a frame and now it's seeked,
      // we know the frame is loaded
      if (!isVideoTextureLoaded) {
        console.log("Video texture loaded after seeking");
        setIsVideoTextureLoaded(true);
        
        // Add delay before making visible
        setTimeout(() => {
          setIsVideoVisible(true);
          
          // Call ready if not already done
          if (onReady && !readyCalledRef.current) {
            console.log("Calling onReady callback after seeking event");
            onReady();
            readyCalledRef.current = true;
          }
        }, 300);
      }
    };
    
    // Add seeked listener
    video.addEventListener("seeked", handleSeeked);
    
    // Clean up
    return () => {
      video.removeEventListener('loadedmetadata', handleMetadataLoaded);
      video.removeEventListener("seeked", handleSeeked);
      if (timeline.scrollTrigger) {
        timeline.scrollTrigger.kill();
      }
      timeline.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [videoSrc, isIOS, isVideoInitialized, isAndroid, isVideoTextureLoaded, isVideoLoaded]);

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
        
        // Add additional fallback to ensure video becomes visible
        setTimeout(() => {
          if (!isVideoVisible) {
            console.log("Force setting video visible after delay");
            setIsVideoTextureLoaded(true);
            setIsVideoVisible(true);
            
            // Ensure ready callback is called if not done yet
            if (onReady && !readyCalledRef.current) {
              console.log("Calling onReady callback after iOS delayed initialization");
              onReady();
              readyCalledRef.current = true;
            }
          }
        }, 2000);
      }, 500);
      
      return () => {
        document.removeEventListener('visibilitychange', handleIOSVisibilityChange);
      };
    }
    
    // Add a fallback to ensure we always trigger onReady and make video visible
    const fallbackTimer = setTimeout(() => {
      if (!isVideoVisible || !isVideoTextureLoaded) {
        console.log("Fallback: forcing video visible after timeout");
        setIsVideoTextureLoaded(true);
        setIsVideoVisible(true);
      }
      
      if (onReady && !readyCalledRef.current && videoRef.current) {
        console.log("Fallback: calling onReady callback after timeout");
        onReady();
        readyCalledRef.current = true;
      }
    }, 3000); // 3 second fallback
    
    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [isIOS, isVideoInitialized, onReady, isVideoVisible, isVideoTextureLoaded]);

  return (
    <div ref={containerRef} className="video-container fixed top-0 left-0 w-full h-screen z-0">
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
            opacity: isVideoVisible && isVideoTextureLoaded ? 1 : 0,
            visibility: isVideoVisible ? 'visible' : 'hidden',
            backgroundColor: 'black', // Add background color to prevent white flashing
            willChange: 'transform, opacity', // Added performance optimization
            transform: 'translateZ(0)', // Force GPU acceleration
            backfaceVisibility: 'hidden', // Prevent rendering the back face
            transition: 'opacity 0.5s ease-out' // Smooth transition for opacity changes
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
});

ImprovedScrollVideo.displayName = "ImprovedScrollVideo";

export default ImprovedScrollVideo;
