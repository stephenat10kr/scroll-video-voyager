import React, { useState, useRef, useEffect } from "react";
import { useContentfulAsset } from "@/hooks/useContentfulAsset";
import { HERO_VIDEO_ASSET_ID } from "@/types/contentful";
import Spinner from "./Spinner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsIOS } from "@/hooks/useIsIOS";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ImprovedScrollVideoProps {
  src?: string; // Make the src prop optional
}

const ImprovedScrollVideo: React.FC<ImprovedScrollVideoProps> = ({ src: externalSrc }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isVideoInitialized, setIsVideoInitialized] = useState(false);
  const [fadeInComplete, setFadeInComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isIOS = useIsIOS();
  
  // For debugging
  useEffect(() => {
    if (isIOS) {
      console.log("iOS device detected in ImprovedScrollVideo component");
    }
  }, [isIOS]);
  
  const { data: heroVideoAsset, isLoading } = useContentfulAsset(HERO_VIDEO_ASSET_ID);
  
  // Use external src if provided, otherwise use the one from Contentful
  // Remove all fallback URLs and only use Contentful
  const videoSrc = externalSrc || (heroVideoAsset?.fields?.file?.url 
    ? (heroVideoAsset.fields.file.url.startsWith('//') 
        ? 'https:' + heroVideoAsset.fields.file.url 
        : heroVideoAsset.fields.file.url)
    : undefined);

  const handleVideoLoaded = () => {
    console.log("Video loaded event triggered");
    setIsVideoLoaded(true);
    
    // For iOS, we need to manually initialize the video when it's loaded
    if (isIOS && videoRef.current && !isVideoInitialized) {
      initializeVideoForIOS();
    }
    
    // Add fade-in animation for the video
    if (videoRef.current) {
      // Set initial opacity to 0
      gsap.set(videoRef.current, { opacity: 0 });
      
      // Animate to full opacity
      gsap.to(videoRef.current, {
        opacity: 1,
        duration: 1.5,
        delay: 0.2,
        onComplete: () => setFadeInComplete(true)
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
      }).catch(err => {
        console.error("Error initializing video for iOS:", err);
        // Try a different approach - set the currentTime which sometimes forces a frame to load
        video.currentTime = 0.1;
        setIsVideoInitialized(true);
      });
    } else {
      // Play didn't return a promise, try setting currentTime
      video.currentTime = 0.1;
      setIsVideoInitialized(true);
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
        // This makes the scrubbing effect less sensitive
        end: "bottom+=600% bottom", // Changed from 400% to 600% to make scrubbing much less sensitive
        scrub: 3.5, // Changed from 2.5 to 3.5 to add an even smoother delay effect
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
          setIsVideoVisible(false);
          console.log("Hiding video (scrolling down)");
        },
        onLeaveBack: () => {
          setIsVideoVisible(true);
          console.log("Showing video (scrolling up)");
        },
        markers: false
      });
    } else {
      console.warn("RevealText section not found for video visibility trigger");
      // Fallback to another selector if the ID approach fails
      const revealTextElement = document.querySelector('.w-full.py-24');
      if (revealTextElement) {
        console.log("Found RevealText using class selector");
        ScrollTrigger.create({
          trigger: revealTextElement,
          start: "top top",
          onEnter: () => {
            setIsVideoVisible(false);
            console.log("Hiding video (scrolling down) - using fallback selector");
          },
          onLeaveBack: () => {
            setIsVideoVisible(true);
            console.log("Showing video (scrolling up) - using fallback selector");
          },
          markers: false
        });
      } else {
        console.error("Could not find RevealText component with any selector");
      }
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
  }, [isVideoLoaded, isIOS, isVideoInitialized]);

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
      }, 500);
      
      return () => {
        document.removeEventListener('visibilitychange', handleIOSVisibilityChange);
      };
    }
  }, [isIOS, isVideoInitialized]);

  return (
    <div ref={containerRef} className="video-container fixed top-0 left-0 w-full h-screen z-0">
      {/* Show loading state if video is still loading */}
      {(isLoading || !isVideoLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
          <Spinner />
        </div>
      )}
      
      {videoSrc && (
        <video 
          ref={videoRef}
          className="w-full h-full object-cover pointer-events-none"
          style={{ 
            opacity: isVideoVisible ? (fadeInComplete ? 1 : 0) : 0,
            visibility: isVideoVisible ? 'visible' : 'hidden',
            transition: 'opacity 1.5s ease-in-out'
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
